import { ethers } from 'ethers';

// Contract configuration
export const CONTRACT_CONFIG = {
  // Avalanche Fuji Testnet
  FUJI: {
    address: '0xA514E844fe0a671D07d35B2897F6523C09cD9ecC',
    chainId: 43113,
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorer: 'https://testnet.snowtrace.io'
  },
  // Avalanche Mainnet
  AVALANCHE: {
    address: '', // Will be set after mainnet deployment
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io'
  }
};

// Contract ABI (simplified for frontend)
export const CONTRACT_ABI = [
  // Events
  "event AuctionCreated(uint256 indexed auctionId, address indexed host, string twitterId, uint256 reservePrice, uint256 endBlock, string metadataIPFS)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount, uint256 newEndBlock)",
  "event AuctionEnded(uint256 indexed auctionId, address indexed winner, address indexed host, uint256 winningBid)",
  "event MeetingScheduled(uint256 indexed auctionId, string meetingAccessHash)",
  "event FundsWithdrawn(uint256 indexed auctionId, address indexed recipient, uint256 amount)",
  
  // View functions
  "function getAuction(uint256 _auctionId) external view returns (tuple(uint256 id, address host, uint256 startBlock, uint256 endBlock, uint256 reservePrice, uint256 highestBid, address highestBidder, string meetingMetadataIPFS, string hostTwitterId, bool ended, bool meetingScheduled, uint256 duration, uint256 nftTokenId))",
  "function getActiveAuctions(uint256 _limit) external view returns (uint256[])",
  "function getPendingReturn(uint256 _auctionId, address _bidder) external view returns (uint256)",
  "function auctionCounter() external view returns (uint256)",
  "function platformFee() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function getNFTsOwnedByUser(address _user) external view returns (uint256[], uint256[])",
  "function canAccessMeeting(uint256 _auctionId, address _user) external view returns (bool)",
  "function canBurnForMeeting(uint256 _tokenId, address _user) external view returns (bool)",
  "function getNFTMetadata(uint256 tokenId) external view returns (tuple(uint256 auctionId, address host, string hostTwitterId, string meetingMetadataIPFS, uint256 meetingDuration, uint256 mintTimestamp))",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function getBidderStats(address _bidder) external view returns (tuple(uint128 totalBids, uint64 bidCount, uint64 lastBidBlock))",
  
  // State-changing functions
  "function createAuction(address _host, string memory _twitterId, uint256 _duration, uint256 _reservePrice, string memory _metadataIPFS, uint256 _meetingDuration) external returns (uint256)",
  "function placeBid(uint256 _auctionId) external payable",
  "function endAuction(uint256 _auctionId) external",
  "function scheduleMeeting(uint256 _auctionId, string memory _meetingAccessHash) external",
  "function withdrawBid(uint256 _auctionId) external",
  "function burnNFTForMeeting(uint256 _tokenId) external returns (uint256)",
  
  // Events
  "event NFTBurnedForMeeting(uint256 indexed tokenId, uint256 indexed auctionId, address indexed user)",
  "event NFTTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 auctionId)"
];

// Contract service class
export class MeetingAuctionService {
  private provider: ethers.providers.Web3Provider | null = null;
  private contract: ethers.Contract | null = null;
  private network: 'FUJI' | 'AVALANCHE' = 'FUJI';

  constructor(network: 'FUJI' | 'AVALANCHE' = 'FUJI') {
    this.network = network;
  }

  // Initialize provider and contract
  async initialize() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = new ethers.providers.Web3Provider((window as any).ethereum as any);
      await this.provider.send("eth_requestAccounts", []);
      
      const signer = this.provider.getSigner();
      const config = CONTRACT_CONFIG[this.network];
      
      this.contract = new ethers.Contract(
        config.address,
        CONTRACT_ABI,
        signer
      );
      
      return true;
    }
    return false;
  }

  // Get contract instance
  getContract() {
    return this.contract;
  }

  // Get provider
  getProvider() {
    return this.provider;
  }

  // Get network configuration
  getNetworkConfig() {
    return CONTRACT_CONFIG[this.network];
  }

  // Create a new auction
  async createAuction(
    host: string,
    twitterId: string,
    duration: number,
    reservePrice: string,
    metadataIPFS: string,
    meetingDuration: number
  ) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const reservePriceWei = ethers.utils.parseEther(reservePrice);
    
    const tx = await this.contract.createAuction(
      host,
      twitterId,
      duration,
      reservePriceWei,
      metadataIPFS,
      meetingDuration
    );
    
    return await tx.wait();
  }

  // Place a bid
  async placeBid(auctionId: number, bidAmount: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const bidAmountWei = ethers.utils.parseEther(bidAmount);
    
    const tx = await this.contract.placeBid(auctionId, {
      value: bidAmountWei
    });
    
    return await tx.wait();
  }

  // End an auction
  async endAuction(auctionId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.endAuction(auctionId);
    return await tx.wait();
  }

  // Get auction details
  async getAuction(auctionId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.getAuction(auctionId);
  }

  // Get active auctions
  async getActiveAuctions(limit: number = 0) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.getActiveAuctions(limit);
  }

  // Get pending returns for a bidder
  async getPendingReturn(auctionId: number, bidder: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.getPendingReturn(auctionId, bidder);
  }

  // Withdraw bid
  async withdrawBid(auctionId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.withdrawBid(auctionId);
    return await tx.wait();
  }

  // Get contract statistics
  async getContractStats() {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const [auctionCounter, platformFee, owner] = await Promise.all([
      this.contract.auctionCounter(),
      this.contract.platformFee(),
      this.contract.owner()
    ]);
    
    return {
      auctionCounter: auctionCounter.toNumber(),
      platformFee: platformFee.toNumber(),
      owner
    };
  }

  // NFT Functions
  async getNFTsOwnedByUser(userAddress: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.getNFTsOwnedByUser(userAddress);
  }

  async canAccessMeeting(auctionId: number, userAddress: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.canAccessMeeting(auctionId, userAddress);
  }

  async canBurnForMeeting(tokenId: number, userAddress: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.canBurnForMeeting(tokenId, userAddress);
  }

  async getNFTMetadata(tokenId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.getNFTMetadata(tokenId);
  }

  async burnNFTForMeeting(tokenId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.burnNFTForMeeting(tokenId);
    return await tx.wait();
  }

  async getBidderStats(bidderAddress: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.getBidderStats(bidderAddress);
  }
}

