const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting MeetingAuction deployment to Avalanche...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("👤 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString(), "wei");
  console.log("🌐 Network:", hre.network.name);
  console.log("🔗 Chain ID:", hre.network.config.chainId);
  console.log("");

  // Deploy the MeetingAuction contract
  console.log("📦 Deploying MeetingAuction contract...");
  const MeetingAuction = await hre.ethers.getContractFactory("MeetingAuction");
  const meetingAuction = await MeetingAuction.deploy();

  console.log("⏳ Waiting for deployment to be mined...");
  await meetingAuction.deployed();

  console.log("✅ MeetingAuction deployed to:", meetingAuction.address);
  console.log("📝 Deployment transaction hash:", meetingAuction.deployTransaction.hash);
  
  // Wait for a few block confirmations
  console.log("⏳ Waiting for confirmations...");
  await meetingAuction.deployTransaction.wait(5);
  console.log("✅ Deployment confirmed!\n");

  // Verify contract state
  console.log("🔍 Verifying contract state...");
  const platformFee = await meetingAuction.platformFee();
  const auctionCounter = await meetingAuction.auctionCounter();
  const owner = await meetingAuction.owner();
  
  console.log("   Platform Fee:", platformFee.toString(), "basis points (2.5%)");
  console.log("   Auction Counter:", auctionCounter.toString());
  console.log("   Contract Owner:", owner);
  console.log("   ✅ Contract state verified!\n");
  
  // Save deployment info
  const deploymentInfo = {
    address: meetingAuction.address,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: meetingAuction.deployTransaction.hash,
    platformFee: platformFee.toString(),
    contractName: "MeetingAuction"
  };
  
  const fileName = `deployment-${hre.network.name}.json`;
  fs.writeFileSync(fileName, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${fileName}`);
  
  // Network-specific information
  if (hre.network.name === "avalanche") {
    console.log("\n🔗 Avalanche Mainnet Links:");
    console.log(`   Contract: https://snowtrace.io/address/${meetingAuction.address}`);
    console.log(`   Transaction: https://snowtrace.io/tx/${meetingAuction.deployTransaction.hash}`);
  } else if (hre.network.name === "fuji") {
    console.log("\n🔗 Avalanche Fuji Testnet Links:");
    console.log(`   Contract: https://testnet.snowtrace.io/address/${meetingAuction.address}`);
    console.log(`   Transaction: https://testnet.snowtrace.io/tx/${meetingAuction.deployTransaction.hash}`);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Next steps:");
  console.log("   1. Verify contract on Snowtrace (if needed)");
  console.log("   2. Test contract functions");
  console.log("   3. Integrate with frontend/backend");
  console.log("   4. Set up monitoring and alerts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

