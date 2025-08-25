const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting contract interaction test...\n");

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json", "utf8"));
  const contractAddress = deploymentInfo.address;
  
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${deploymentInfo.network}\n`);

  // Get signers
  const [deployer, bidder1, bidder2, bidder3] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Bidder 1: ${bidder1.address}`);
  console.log(`   Bidder 2: ${bidder2.address}`);
  console.log(`   Bidder 3: ${bidder3.address}\n`);

  // Get contract instance
  const MeetingAuction = await ethers.getContractFactory("MeetingAuction");
  const contract = MeetingAuction.attach(contractAddress);

  console.log("📊 Contract State:");
  console.log(`   Auction Counter: ${await contract.auctionCounter()}\n`);

  // Set up event listeners
  console.log("🎧 Setting up event listeners...\n");
  
  contract.on("AuctionCreated", (auctionId, host, twitterId, reservePrice, endBlock, metadataIPFS, event) => {
    console.log(`🎉 Auction Created Event:`);
    console.log(`   Auction ID: ${auctionId.toString()}`);
    console.log(`   Host: ${host}`);
    console.log(`   Twitter ID: ${twitterId}`);
    console.log(`   Reserve Price: ${ethers.utils.formatEther(reservePrice)} ETH`);
    console.log(`   End Block: ${endBlock.toString()}`);
    console.log(`   Metadata IPFS: ${metadataIPFS}`);
    console.log(`   Transaction Hash: ${event.transactionHash}\n`);
  });

  contract.on("BidPlaced", (auctionId, bidder, amount, newEndBlock, event) => {
    console.log(`💰 Bid Placed Event:`);
    console.log(`   Auction ID: ${auctionId.toString()}`);
    console.log(`   Bidder: ${bidder}`);
    console.log(`   Amount: ${ethers.utils.formatEther(amount)} ETH`);
    console.log(`   New End Block: ${newEndBlock.toString()}`);
    console.log(`   Transaction Hash: ${event.transactionHash}\n`);
  });

  contract.on("AuctionEnded", (auctionId, winner, host, winningBid, event) => {
    console.log(`🏆 Auction Ended Event:`);
    console.log(`   Auction ID: ${auctionId.toString()}`);
    console.log(`   Winner: ${winner}`);
    console.log(`   Host: ${host}`);
    console.log(`   Winning Bid: ${ethers.utils.formatEther(winningBid)} ETH`);
    console.log(`   Transaction Hash: ${event.transactionHash}\n`);
  });

  // Wait a moment for event listeners to be set up
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Test 1: Create an auction (only owner can do this)
    console.log("📝 Test 1: Creating an auction...");
    const duration = 1000; // blocks until end
    const reservePrice = ethers.utils.parseEther("0.01"); // 0.01 ETH reserve price
    const meetingDuration = 30; // 30 minutes
    
    const createTx = await contract.createAuction(
      deployer.address, // host
      "elon_musk_123", // twitter ID
      duration,
      reservePrice,
      "QmTestMetadataIPFS", // metadata IPFS hash
      meetingDuration
    );
    
    console.log(`   Transaction sent: ${createTx.hash}`);
    await createTx.wait();
    console.log("   ✅ Auction created successfully!\n");

    // Test 2: Place bids
    console.log("💰 Test 2: Placing bids...");
    
    // Bidder 1 places a bid
    const bid1 = ethers.utils.parseEther("0.05");
    console.log(`   Bidder 1 bidding ${ethers.utils.formatEther(bid1)} ETH...`);
    const bidTx1 = await contract.connect(bidder1).placeBid(1, { value: bid1 });
    await bidTx1.wait();
    console.log("   ✅ Bidder 1 bid successful!\n");

    // Bidder 2 places a higher bid
    const bid2 = ethers.utils.parseEther("0.1");
    console.log(`   Bidder 2 bidding ${ethers.utils.formatEther(bid2)} ETH...`);
    const bidTx2 = await contract.connect(bidder2).placeBid(1, { value: bid2 });
    await bidTx2.wait();
    console.log("   ✅ Bidder 2 bid successful!\n");

    // Bidder 3 places an even higher bid
    const bid3 = ethers.utils.parseEther("0.15");
    console.log(`   Bidder 3 bidding ${ethers.utils.formatEther(bid3)} ETH...`);
    const bidTx3 = await contract.connect(bidder3).placeBid(1, { value: bid3 });
    await bidTx3.wait();
    console.log("   ✅ Bidder 3 bid successful!\n");

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

    // Test 4: Check pending returns
    console.log("💸 Test 4: Checking pending returns...");
    const pendingReturn1 = await contract.pendingReturns(1, bidder1.address);
    const pendingReturn2 = await contract.pendingReturns(1, bidder2.address);
    console.log(`   Bidder 1 pending return: ${ethers.utils.formatEther(pendingReturn1)} ETH`);
    console.log(`   Bidder 2 pending return: ${ethers.utils.formatEther(pendingReturn2)} ETH\n`);

    // Test 5: Check bidder statistics
    console.log("📈 Test 5: Checking bidder statistics...");
    const bidderStats1 = await contract.bidderStats(bidder1.address);
    const bidderStats2 = await contract.bidderStats(bidder2.address);
    const bidderStats3 = await contract.bidderStats(bidder3.address);
    
    console.log(`   Bidder 1 stats:`);
    console.log(`     Total Bids: ${ethers.utils.formatEther(bidderStats1.totalBids)} ETH`);
    console.log(`     Bid Count: ${bidderStats1.bidCount.toString()}`);
    console.log(`     Last Bid Block: ${bidderStats1.lastBidBlock.toString()}`);
    
    console.log(`   Bidder 2 stats:`);
    console.log(`     Total Bids: ${ethers.utils.formatEther(bidderStats2.totalBids)} ETH`);
    console.log(`     Bid Count: ${bidderStats2.bidCount.toString()}`);
    console.log(`     Last Bid Block: ${bidderStats2.lastBidBlock.toString()}`);
    
    console.log(`   Bidder 3 stats:`);
    console.log(`     Total Bids: ${ethers.utils.formatEther(bidderStats3.totalBids)} ETH`);
    console.log(`     Bid Count: ${bidderStats3.bidCount.toString()}`);
    console.log(`     Last Bid Block: ${bidderStats3.lastBidBlock.toString()}\n`);

    // Test 6: Check if Twitter ID is used
    console.log("🐦 Test 6: Checking Twitter ID usage...");
    const isTwitterIdUsed = await contract.usedTwitterIds("elon_musk_123");
    console.log(`   Twitter ID 'elon_musk_123' used: ${isTwitterIdUsed}\n`);

    // Test 7: End auction (after some time)
    console.log("⏰ Test 7: Ending auction...");
    console.log("   Waiting for auction to end...");
    
    // Fast forward time (in a real scenario, we'd wait for the actual time)
    // For testing, we'll just call endAuction directly
    const endTx = await contract.endAuction(1);
    await endTx.wait();
    console.log("   ✅ Auction ended successfully!\n");

    // Test 8: Final auction state
    console.log("📊 Test 8: Final auction state...");
    const finalAuction = await contract.auctions(1);
    console.log(`   Auction ID: ${finalAuction.id.toString()}`);
    console.log(`   Winner: ${finalAuction.highestBidder}`);
    console.log(`   Winning Bid: ${ethers.utils.formatEther(finalAuction.highestBid)} ETH`);
    console.log(`   Status: ${finalAuction.ended ? "Ended" : "Active"}\n`);

    console.log("🎉 All tests completed successfully!");
    console.log("📝 Events captured during the interaction:");
    console.log("   - AuctionCreated");
    console.log("   - BidPlaced (3 times)");
    console.log("   - AuctionEnded");

  } catch (error) {
    console.error("❌ Error during interaction:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
