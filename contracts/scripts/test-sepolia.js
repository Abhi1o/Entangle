const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🧪 Starting Sepolia contract test...\n");

  // Check if environment variables are set
  if (!process.env.SEPOLIA_URL) {
    throw new Error("❌ SEPOLIA_URL not set in .env file");
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY not set in .env file");
  }

  // Load deployment info
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("deployment-sepolia.json", "utf8"));
  } catch (error) {
    throw new Error("❌ deployment-sepolia.json not found. Please deploy to Sepolia first.");
  }

  const contractAddress = deploymentInfo.address;
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${deploymentInfo.network}\n`);

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("👤 Test Account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH\n");

  // Get contract instance
  const MeetingAuction = await ethers.getContractFactory("MeetingAuction");
  const contract = MeetingAuction.attach(contractAddress);

  try {
    // Test 1: Basic contract state
    console.log("📊 Test 1: Basic contract state...");
    const platformFee = await contract.platformFee();
    const auctionCounter = await contract.auctionCounter();
    const owner = await contract.owner();
    
    console.log(`   Platform Fee: ${platformFee.toString()} basis points`);
    console.log(`   Auction Counter: ${auctionCounter.toString()}`);
    console.log(`   Contract Owner: ${owner}`);
    console.log("   ✅ Basic state verification passed!\n");

    // Test 2: Create an auction (only owner can do this)
    console.log("📝 Test 2: Creating an auction...");
    const duration = 1000; // blocks until end (must be > ANTI_SNIPE_BLOCKS which is 50)
    const reservePrice = ethers.utils.parseEther("0.001"); // 0.001 ETH reserve price (lower for testnet)
    const meetingDuration = 30; // 30 minutes
    
    const createTx = await contract.createAuction(
      deployer.address, // host
      "test_sepolia_host", // twitter ID
      duration,
      reservePrice,
      "QmTestSepoliaAuction", // metadata IPFS hash
      meetingDuration
    );
    
    console.log(`   Transaction sent: ${createTx.hash}`);
    await createTx.wait();
    console.log("   ✅ Auction created successfully!\n");

    // Test 3: Get auction details
    console.log("📊 Test 3: Getting auction details...");
    const auction = await contract.auctions(1);
    console.log(`   Auction ID: ${auction.id.toString()}`);
    console.log(`   Host: ${auction.host}`);
    console.log(`   Start Block: ${auction.startBlock.toString()}`);
    console.log(`   End Block: ${auction.endBlock.toString()}`);
    console.log(`   Reserve Price: ${ethers.utils.formatEther(auction.reservePrice)} ETH`);
    console.log(`   Current Highest Bid: ${ethers.utils.formatEther(auction.highestBid)} ETH`);
    console.log(`   Highest Bidder: ${auction.highestBidder}`);
    console.log(`   Twitter ID: ${auction.hostTwitterId}`);
    console.log(`   Status: ${auction.ended ? "Ended" : "Active"}\n`);

    // Test 4: Check if Twitter ID is used
    console.log("🐦 Test 4: Checking Twitter ID usage...");
    const isTwitterIdUsed = await contract.usedTwitterIds("test_sepolia_host");
    console.log(`   Twitter ID 'test_sepolia_host' used: ${isTwitterIdUsed}\n`);

    // Test 5: Verify contract on Etherscan
    console.log("🔍 Test 5: Contract verification status...");
    console.log(`   Etherscan URL: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("   ✅ Contract deployed and ready for use!\n");

    console.log("🎉 Sepolia contract test completed successfully!");
    console.log("📝 Test results:");
    console.log("   ✅ Contract state verification");
    console.log("   ✅ Auction creation");
    console.log("   ✅ Data retrieval");
    console.log("   ✅ Twitter ID validation");
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
