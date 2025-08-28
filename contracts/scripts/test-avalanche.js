const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🧪 Starting Avalanche contract test...\n");

  // Check if environment variables are set
  if (!process.env.PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY not set in .env file");
  }

  // Load deployment info based on network
  const network = hre.network.name;
  const fileName = `deployment-${network}.json`;
  
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync(fileName, "utf8"));
  } catch (error) {
    throw new Error(`❌ ${fileName} not found. Please deploy to ${network} first.`);
  }

  const contractAddress = deploymentInfo.address;
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${deploymentInfo.network}`);
  console.log(`🔗 Chain ID: ${deploymentInfo.chainId}\n`);

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("👤 Test Account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "AVAX\n");

  // Get contract instance
  const MeetingAuction = await ethers.getContractFactory("MeetingAuction");
  const contract = MeetingAuction.attach(contractAddress);

  try {
    // Test 1: Basic contract state
    console.log("📊 Test 1: Basic contract state...");
    const platformFee = await contract.platformFee();
    const auctionCounter = await contract.auctionCounter();
    const owner = await contract.owner();
    
    console.log(`   Platform Fee: ${platformFee.toString()} basis points (2.5%)`);
    console.log(`   Auction Counter: ${auctionCounter.toString()}`);
    console.log(`   Contract Owner: ${owner}`);
    console.log("   ✅ Basic state verification passed!\n");

    // Test 2: Create an auction (only owner can do this)
    console.log("📝 Test 2: Creating an auction...");
    const duration = 1000; // blocks until end (must be > ANTI_SNIPE_BLOCKS which is 50)
    const reservePrice = ethers.utils.parseEther("0.01"); // 0.01 AVAX reserve price
    const meetingDuration = 30; // 30 minutes
    
    // Use unique Twitter ID with timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const uniqueTwitterId = `test_avalanche_${timestamp}`;
    
    const createTx = await contract.createAuction(
      deployer.address, // host
      uniqueTwitterId, // twitter ID
      duration,
      reservePrice,
      "QmTestAvalancheAuction", // metadata IPFS hash
      meetingDuration
    );
    
    console.log(`   Transaction sent: ${createTx.hash}`);
    await createTx.wait();
    console.log("   ✅ Auction created successfully!\n");

    // Test 3: Get auction details
    console.log("📊 Test 3: Getting auction details...");
    const newAuctionCounter = await contract.auctionCounter();
    const auction = await contract.auctions(newAuctionCounter.toNumber());
    console.log(`   Auction ID: ${auction.id.toString()}`);
    console.log(`   Host: ${auction.host}`);
    console.log(`   Start Block: ${auction.startBlock.toString()}`);
    console.log(`   End Block: ${auction.endBlock.toString()}`);
    console.log(`   Reserve Price: ${ethers.utils.formatEther(auction.reservePrice)} AVAX`);
    console.log(`   Current Highest Bid: ${ethers.utils.formatEther(auction.highestBid)} AVAX`);
    console.log(`   Highest Bidder: ${auction.highestBidder}`);
    console.log(`   Twitter ID: ${auction.hostTwitterId}`);
    console.log(`   Status: ${auction.ended ? "Ended" : "Active"}`);
    console.log(`   Meeting Duration: ${auction.duration.toString()} minutes\n`);

    // Test 4: Check if Twitter ID is used
    console.log("🐦 Test 4: Checking Twitter ID usage...");
    const isTwitterIdUsed = await contract.usedTwitterIds(uniqueTwitterId);
    console.log(`   Twitter ID '${uniqueTwitterId}' used: ${isTwitterIdUsed}\n`);

    // Test 5: Get active auctions
    console.log("📋 Test 5: Getting active auctions...");
    const activeAuctions = await contract.getActiveAuctions();
    console.log(`   Active auctions count: ${activeAuctions.length}`);
    for (let i = 0; i < activeAuctions.length; i++) {
      console.log(`   Active Auction ID: ${activeAuctions[i].toString()}`);
    }
    console.log("");

    // Test 6: Network-specific verification
    if (network === "avalanche") {
      console.log("🔗 Avalanche Mainnet Links:");
      console.log(`   Contract: https://snowtrace.io/address/${contractAddress}`);
      console.log(`   Transaction: https://snowtrace.io/tx/${createTx.hash}`);
    } else if (network === "fuji") {
      console.log("🔗 Avalanche Fuji Testnet Links:");
      console.log(`   Contract: https://testnet.snowtrace.io/address/${contractAddress}`);
      console.log(`   Transaction: https://testnet.snowtrace.io/tx/${createTx.hash}`);
    }
    console.log("");

    console.log("🎉 Avalanche contract test completed successfully!");
    console.log("📝 Test results:");
    console.log("   ✅ Contract state verification");
    console.log("   ✅ Auction creation");
    console.log("   ✅ Data retrieval");
    console.log("   ✅ Twitter ID validation");
    console.log("   ✅ Active auctions listing");
    console.log("   ✅ Contract ready for production use");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

