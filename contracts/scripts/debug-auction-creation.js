const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Debugging auction creation...\n");

  // Check if environment variables are set
  if (!process.env.SEPOLIA_URL) {
    throw new Error("❌ SEPOLIA_URL not set in .env file");
  }
  if (!process.env.PRIVATE_KEY_BIDDER1) {
    throw new Error("❌ PRIVATE_KEY_BIDDER1 not set in .env file");
  }

  // Load deployment info
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("deployment-sepolia.json", "utf8"));
  } catch (error) {
    throw new Error("❌ deployment-sepolia.json not found. Please deploy to Sepolia first.");
  }

  const contractAddress = deploymentInfo.address;
  console.log(`📋 Contract Address: ${contractAddress}\n`);

  // Create signers
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_URL);
  const bidder1 = new ethers.Wallet(process.env.PRIVATE_KEY_BIDDER1, provider);
  
  console.log("👤 Test Account:");
  console.log(`   Bidder 1: ${bidder1.address}\n`);

  // Get contract instance
  const MeetingAuction = await ethers.getContractFactory("MeetingAuction");
  const contract = MeetingAuction.attach(contractAddress);

  try {
    // Check 1: Contract state
    console.log("📊 Check 1: Contract state...");
    const platformFee = await contract.platformFee();
    const auctionCounter = await contract.auctionCounter();
    const owner = await contract.owner();
    
    console.log(`   Platform Fee: ${platformFee.toString()} basis points`);
    console.log(`   Auction Counter: ${auctionCounter.toString()}`);
    console.log(`   Contract Owner: ${owner}`);
    console.log(`   Is Bidder 1 owner? ${owner.toLowerCase() === bidder1.address.toLowerCase()}\n`);

    // Check 2: Twitter ID usage
    console.log("🐦 Check 2: Twitter ID usage...");
    const twitterId = "test_sepolia_host_3";
    const isTwitterIdUsed = await contract.usedTwitterIds(twitterId);
    console.log(`   Twitter ID '${twitterId}' used: ${isTwitterIdUsed}\n`);

    // Check 3: Current block number
    console.log("📦 Check 3: Current block number...");
    const currentBlock = await provider.getBlockNumber();
    console.log(`   Current Block: ${currentBlock}\n`);

    // Check 4: Test auction creation parameters
    console.log("🧪 Check 4: Testing auction creation parameters...");
    const duration = 100;
    const reservePrice = ethers.utils.parseEther("0.0001");
    const meetingDuration = 30;
    
    console.log(`   Duration: ${duration} blocks`);
    console.log(`   Reserve Price: ${ethers.utils.formatEther(reservePrice)} ETH`);
    console.log(`   Meeting Duration: ${meetingDuration} minutes`);
    console.log(`   Host: ${bidder1.address}`);
    console.log(`   Twitter ID: ${twitterId}`);
    console.log(`   Metadata: QmTestSepoliaOwnership\n`);

    // Check 5: Try to estimate gas for auction creation
    console.log("⛽ Check 5: Estimating gas for auction creation...");
    try {
      const estimatedGas = await contract.connect(bidder1).estimateGas.createAuction(
        bidder1.address,
        twitterId,
        duration,
        reservePrice,
        "QmTestSepoliaOwnership",
        meetingDuration
      );
      console.log(`   Estimated gas: ${estimatedGas.toString()}\n`);
    } catch (error) {
      console.log(`   ❌ Gas estimation failed: ${error.message}\n`);
    }

    // Check 6: Check if there are any existing auctions with same Twitter ID
    console.log("🔍 Check 6: Checking existing auctions...");
    const currentCount = auctionCounter.toNumber();
    console.log(`   Current auction count: ${currentCount}`);
    
    for (let i = 1; i <= currentCount; i++) {
      try {
        const auction = await contract.auctions(i);
        console.log(`   Auction ${i}:`);
        console.log(`     Host: ${auction.host}`);
        console.log(`     Twitter ID: ${auction.hostTwitterId}`);
        console.log(`     Status: ${auction.ended ? "Ended" : "Active"}`);
      } catch (error) {
        console.log(`   Auction ${i}: Error reading - ${error.message}`);
      }
    }
    console.log("");

    // Check 7: Try a different Twitter ID
    console.log("🔄 Check 7: Testing with different Twitter ID...");
    const newTwitterId = "test_sepolia_host_4";
    const isNewTwitterIdUsed = await contract.usedTwitterIds(newTwitterId);
    console.log(`   Twitter ID '${newTwitterId}' used: ${isNewTwitterIdUsed}\n`);

    if (!isNewTwitterIdUsed) {
      console.log("💡 Suggestion: Try creating auction with Twitter ID 'test_sepolia_host_4' instead.\n");
    }

  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
