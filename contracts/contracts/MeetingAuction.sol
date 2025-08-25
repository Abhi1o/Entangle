// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MeetingAuction is ReentrancyGuard, Ownable, Pausable {
    struct Auction {
        uint256 id;
        address host;
        uint256 startBlock;
        uint256 endBlock;
        uint256 reservePrice;
        uint256 highestBid;
        address highestBidder;
        string meetingMetadataIPFS;
        string hostTwitterId; // Para wallet Twitter ID
        bool ended;
        bool meetingScheduled;
        uint256 duration; // Meeting duration in minutes
    }
    
    // Storage optimization: pack multiple values
    struct BidderInfo {
        uint128 totalBids;     // Total amount bid by user
        uint64 bidCount;       // Number of bids placed
        uint64 lastBidBlock;   // Last bid block number
    }
    
    // Mappings
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;
    mapping(address => BidderInfo) public bidderStats;
    mapping(string => bool) public usedTwitterIds; // Prevent duplicate hosts
    
    // State variables
    uint256 public auctionCounter;
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
        uint256 winningBid
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

    constructor() Ownable() {}
    
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
            duration: _meetingDuration
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
     * @dev End auction and distribute funds
     */
    function endAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.id != 0, "Auction does not exist");
        require(block.number >= auction.endBlock, "Auction still active");
        require(!auction.ended, "Auction already ended");
        
        auction.ended = true;
        
        // Transfer funds if there was a winner
        if (auction.highestBidder != address(0)) {
            uint256 platformAmount = (auction.highestBid * platformFee) / 10000;
            uint256 hostAmount = auction.highestBid - platformAmount;
            
            // Transfer to platform (owner)
            (bool platformSuccess, ) = owner().call{value: platformAmount}("");
            require(platformSuccess, "Platform transfer failed");
            
            // Transfer to host
            (bool hostSuccess, ) = auction.host.call{value: hostAmount}("");
            require(hostSuccess, "Host transfer failed");
        }
        
        emit AuctionEnded(
            _auctionId,
            auction.highestBidder,
            auction.host,
            auction.highestBid
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
    
    // View functions
    function getAuction(uint256 _auctionId) 
        external 
        view 
        returns (Auction memory) 
    {
        return auctions[_auctionId];
    }
    
    function getActiveAuctions() 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory active = new uint256[](auctionCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= auctionCounter; i++) {
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
}
