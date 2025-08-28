import { ethers } from 'ethers';

// Contract configuration
export const CONTRACT_CONFIG = {
  // Avalanche Fuji Testnet
  FUJI: {
    address: '0x17199dd9acB0Cf8f6b58c7DB1BDA6f26dF875B00',
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
  "function getAuction(uint256 _auctionId) external view returns (tuple(uint256 id, address host, uint256 startBlock, uint256 endBlock, uint256 reservePrice, uint256 highestBid, address highestBidder, string meetingMetadataIPFS, string hostTwitterId, bool ended, bool meetingScheduled, uint256 duration))",
  "function getActiveAuctions() external view returns (uint256[])",
  "function getPendingReturn(uint256 _auctionId, address _bidder) external view returns (uint256)",
  "function auctionCounter() external view returns (uint256)",
  "function platformFee() external view returns (uint256)",
  "function owner() external view returns (address)",
  
  // State-changing functions
  "function createAuction(address _host, string memory _twitterId, uint256 _duration, uint256 _reservePrice, string memory _metadataIPFS, uint256 _meetingDuration) external returns (uint256)",
  "function placeBid(uint256 _auctionId) external payable",
  "function endAuction(uint256 _auctionId) external",
  "function scheduleMeeting(uint256 _auctionId, string memory _meetingAccessHash) external",
  "function withdrawBid(uint256 _auctionId) external"
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
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
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
  async getActiveAuctions() {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.getActiveAuctions();
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
}

// Hook for using the contract service
export const useMeetingAuction = (network: 'FUJI' | 'AVALANCHE' = 'FUJI') => {
  const [service, setService] = React.useState<MeetingAuctionService | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const initService = async () => {
      const newService = new MeetingAuctionService(network);
      const initialized = await newService.initialize();
      setService(newService);
      setIsInitialized(initialized);
    };

    initService();
  }, [network]);

  return { service, isInitialized };
};

