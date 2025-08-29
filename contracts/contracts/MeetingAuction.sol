// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MeetingAuction is ReentrancyGuard, Ownable, Pausable, ERC721 {
    struct Auction {
        uint256 id;
        address host;
        uint256 startBlock;
        uint256 endBlock;
        uint256 reservePrice;
        uint256 highestBid;
        address highestBidder;
        string meetingMetadataIPFS;
        string hostTwitterId;
        bool ended;
        bool meetingScheduled;
        uint256 duration; // Meeting duration in minutes
        uint256 nftTokenId; // NFT token ID minted for winner
    }
    
    // Storage optimization: pack multiple values
    struct BidderInfo {
        uint128 totalBids;
        uint64 bidCount;
        uint64 lastBidBlock;
    }
    
    // NFT metadata for meeting access
    struct NFTMetadata {
        uint256 auctionId;
        address host;
        string hostTwitterId;
        string meetingMetadataIPFS;
        uint256 meetingDuration;
        uint256 mintTimestamp;
    }
    
    // Mappings
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;
    mapping(address => BidderInfo) public bidderStats;
    mapping(string => bool) public usedTwitterIds;
    mapping(uint256 => NFTMetadata) public nftMetadata; // NFT token ID to metadata
    mapping(uint256 => bool) public nftUsedForMeeting; // tokenId => used status
    
    // State variables
    uint256 public auctionCounter;
    uint256 public nftCounter; // NFT token counter
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public constant MIN_BID_INCREMENT = 0.01 ether;
    uint256 public constant ANTI_SNIPE_BLOCKS = 50; // ~10 minutes
    uint256 public constant EXTENSION_BLOCKS = 25; // ~5 minutes
    
    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed host,
        string twitterId,
        uint256 reservePrice,
        uint256 endBlock,
        string metadataIPFS
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 newEndBlock
    );
    
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        address indexed host,
        uint256 winningBid,
        uint256 nftTokenId
    );
    
    event MeetingScheduled(
        uint256 indexed auctionId,
        string meetingAccessHash
    );
    
    event FundsWithdrawn(
        uint256 indexed auctionId,
        address indexed recipient,
        uint256 amount
    );
    
    // Events for NFT transfer tracking and burning
    event NFTTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 auctionId
    );
    
    event NFTBurnedForMeeting(
        uint256 indexed tokenId,
        uint256 indexed auctionId,
        address indexed user
    );

    // Constructor
    constructor() Ownable() ERC721("MeetingPass", "MEET") {}
    
    /**
     * @dev Create auction - called by backend after Twitter auth
     */
    function createAuction(
        address _host,
        string memory _twitterId,
        uint256 _duration, // blocks until end
        uint256 _reservePrice,
        string memory _metadataIPFS,
        uint256 _meetingDuration
    ) external onlyOwner whenNotPaused returns (uint256) {
        require(!usedTwitterIds[_twitterId], "Twitter ID already used");
        require(_duration > ANTI_SNIPE_BLOCKS, "Duration too short");
        require(_reservePrice >= MIN_BID_INCREMENT, "Reserve too low");
        
        uint256 auctionId = ++auctionCounter;
        uint256 endBlock = block.number + _duration;
        
        auctions[auctionId] = Auction({
            id: auctionId,
            host: _host,
            startBlock: block.number,
            endBlock: endBlock,
            reservePrice: _reservePrice,
            highestBid: 0,
            highestBidder: address(0),
            meetingMetadataIPFS: _metadataIPFS,
            hostTwitterId: _twitterId,
            ended: false,
            meetingScheduled: false,
            duration: _meetingDuration,
            nftTokenId: 0
        });
        
        usedTwitterIds[_twitterId] = true;
        
        emit AuctionCreated(
            auctionId,
            _host,
            _twitterId,
            _reservePrice,
            endBlock,
            _metadataIPFS
        );
        
        return auctionId;
    }
    
    /**
     * @dev Place bid with anti-sniping protection
     */
    function placeBid(uint256 _auctionId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.id != 0, "Auction does not exist");
        require(block.number < auction.endBlock, "Auction ended");
        require(!auction.ended, "Auction already ended");
        require(msg.sender != auction.host, "Host cannot bid");
        require(
            msg.value >= auction.highestBid + MIN_BID_INCREMENT,
            "Bid too low"
        );
        require(msg.value >= auction.reservePrice, "Below reserve price");
        
        // Anti-sniping protection
        uint256 newEndBlock = auction.endBlock;
        if (auction.endBlock - block.number < ANTI_SNIPE_BLOCKS) {
            newEndBlock = auction.endBlock + EXTENSION_BLOCKS;
            auction.endBlock = newEndBlock;
        }
        
        // Handle previous highest bidder refund
        if (auction.highestBidder != address(0)) {
            pendingReturns[_auctionId][auction.highestBidder] += auction.highestBid;
        }
        
        // Update auction state
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;
        
        // Update bidder statistics
        BidderInfo storage bidder = bidderStats[msg.sender];
        bidder.totalBids += uint128(msg.value);
        bidder.bidCount++;
        bidder.lastBidBlock = uint64(block.number);
        
        emit BidPlaced(_auctionId, msg.sender, msg.value, newEndBlock);
    }
    
    /**
     * @dev End auction and distribute funds with NFT minting
     */
    function endAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.id != 0, "Auction does not exist");
        require(block.number >= auction.endBlock, "Auction still active");
        require(!auction.ended, "Auction already ended");
        
        auction.ended = true;
        uint256 nftTokenId = 0;
        
        // Transfer funds and mint NFT if there was a winner
        if (auction.highestBidder != address(0)) {
            uint256 platformAmount = (auction.highestBid * platformFee) / 10000;
            uint256 hostAmount = auction.highestBid - platformAmount;
            
            // Transfer to platform (owner)
            payable(owner()).transfer(platformAmount);
            
            // Transfer to host
            (bool hostSuccess, ) = auction.host.call{value: hostAmount}("");
            require(hostSuccess, "Host transfer failed");
            
            // Mint NFT for winner as meeting access pass
            nftTokenId = ++nftCounter;
            auction.nftTokenId = nftTokenId;
            _safeMint(auction.highestBidder, nftTokenId);
            
            // Store NFT metadata
            nftMetadata[nftTokenId] = NFTMetadata({
                auctionId: _auctionId,
                host: auction.host,
                hostTwitterId: auction.hostTwitterId,
                meetingMetadataIPFS: auction.meetingMetadataIPFS,
                meetingDuration: auction.duration,
                mintTimestamp: block.timestamp
            });
        }
        
        emit AuctionEnded(
            _auctionId,
            auction.highestBidder,
            auction.host,
            auction.highestBid,
            nftTokenId
        );
    }
    
    /**
     * @dev Schedule meeting (backend calls this)
     */
    function scheduleMeeting(
        uint256 _auctionId,
        string memory _meetingAccessHash
    ) external onlyOwner {
        Auction storage auction = auctions[_auctionId];
        require(auction.ended, "Auction not ended");
        require(!auction.meetingScheduled, "Meeting already scheduled");
        
        auction.meetingScheduled = true;
        
        emit MeetingScheduled(_auctionId, _meetingAccessHash);
    }
    
    /**
     * @dev Burn NFT for meeting access - CRITICAL for backend flow
     */
    function burnNFTForMeeting(uint256 _tokenId) 
        external 
        nonReentrant 
        returns (uint256 auctionId) 
    {
        require(_exists(_tokenId), "Token does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not token owner");
        require(!nftUsedForMeeting[_tokenId], "NFT already used for meeting");
        
        // Get auction ID from NFT metadata
        NFTMetadata memory metadata = nftMetadata[_tokenId];
        auctionId = metadata.auctionId;
        
        // Verify auction is ended and meeting is scheduled
        Auction memory auction = auctions[auctionId];
        require(auction.ended, "Auction not ended");
        require(auction.meetingScheduled, "Meeting not scheduled");
        
        // Mark as used and burn
        nftUsedForMeeting[_tokenId] = true;
        _burn(_tokenId);
        
        emit NFTBurnedForMeeting(_tokenId, auctionId, msg.sender);
        
        return auctionId;
    }
    
    /**
     * @dev Check if NFT can be burned for meeting access
     */
    function canBurnForMeeting(uint256 _tokenId, address _user) 
        external 
        view 
        returns (bool) 
    {
        if (!_exists(_tokenId)) return false;
        if (ownerOf(_tokenId) != _user) return false;
        if (nftUsedForMeeting[_tokenId]) return false;
        
        NFTMetadata memory metadata = nftMetadata[_tokenId];
        Auction memory auction = auctions[metadata.auctionId];
        
        return auction.ended && auction.meetingScheduled;
    }
    
    /**
     * @dev Get all NFTs owned by user (for "Get My Meetings" API)
     */
    function getNFTsOwnedByUser(address _user) 
        external 
        view 
        returns (uint256[] memory tokenIds, uint256[] memory auctionIds) 
    {
        uint256 balance = balanceOf(_user);
        uint256[] memory tokens = new uint256[](balance);
        uint256[] memory auctionIdsArray = new uint256[](balance);
        
        uint256 count = 0;
        for (uint256 i = 1; i <= nftCounter; i++) {
            if (_exists(i) && ownerOf(i) == _user && !nftUsedForMeeting[i]) {
                tokens[count] = i;
                auctionIdsArray[count] = nftMetadata[i].auctionId;
                count++;
                if (count >= balance) break; // Optimization: stop when balance reached
            }
        }
        
        // Resize arrays to actual count
        uint256[] memory resultTokens = new uint256[](count);
        uint256[] memory resultAuctions = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            resultTokens[i] = tokens[i];
            resultAuctions[i] = auctionIdsArray[i];
        }
        
        return (resultTokens, resultAuctions);
    }
    
    /**
     * @dev Withdraw failed bids
     */
    function withdrawBid(uint256 _auctionId) external nonReentrant {
        uint256 amount = pendingReturns[_auctionId][msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingReturns[_auctionId][msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(_auctionId, msg.sender, amount);
    }
    
    /**
     * @dev Verify if address can access meeting (updated for burn-to-access logic)
     */
    function canAccessMeeting(uint256 _auctionId, address _user) 
        external 
        view 
        returns (bool) 
    {
        Auction memory auction = auctions[_auctionId];
        require(auction.ended, "Auction not ended");
        require(auction.meetingScheduled, "Meeting not scheduled");
        
        // Host can always access
        if (auction.host == _user) {
            return true;
        }
        
        // For participants: Check if they have a valid NFT they can burn
        if (auction.nftTokenId > 0 && _exists(auction.nftTokenId)) {
            return (ownerOf(auction.nftTokenId) == _user && 
                   !nftUsedForMeeting[auction.nftTokenId]);
        }
        
        return false;
    }
    
    /**
     * @dev Override tokenURI to provide NFT metadata
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        
        NFTMetadata memory metadata = nftMetadata[tokenId];
        
        // Return IPFS URL for metadata
        return string(abi.encodePacked(
            "ipfs://",
            metadata.meetingMetadataIPFS
        ));
    }
    
    /**
     * @dev Get NFT metadata
     */
    function getNFTMetadata(uint256 tokenId) 
        external 
        view 
        returns (NFTMetadata memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        return nftMetadata[tokenId];
    }
    
    /**
     * @dev Override transfer functions to emit tracking events
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Only emit for actual transfers (not minting/burning)
        if (from != address(0) && to != address(0)) {
            NFTMetadata memory metadata = nftMetadata[tokenId];
            emit NFTTransferred(tokenId, from, to, metadata.auctionId);
        }
    }
    
    // View functions
    function getAuction(uint256 _auctionId) 
        external 
        view 
        returns (Auction memory) 
    {
        return auctions[_auctionId];
    }
    
    /**
     * @dev Get active auctions with pagination
     */
    function getActiveAuctions(uint256 _limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 limit = _limit > 0 ? _limit : auctionCounter;
        uint256[] memory active = new uint256[](limit);
        uint256 count = 0;
        
        for (uint256 i = auctionCounter; i > 0 && count < limit; i--) {
            if (!auctions[i].ended && block.number < auctions[i].endBlock) {
                active[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = active[i];
        }
        
        return result;
    }
    
    function getPendingReturn(uint256 _auctionId, address _bidder) 
        external 
        view 
        returns (uint256) 
    {
        return pendingReturns[_auctionId][_bidder];
    }
    
    /**
     * @dev Get bidder statistics
     */
    function getBidderStats(address _bidder) 
        external 
        view 
        returns (BidderInfo memory) 
    {
        return bidderStats[_bidder];
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }
    
    /**
     * @dev Emergency withdrawal for owner
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Check contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}