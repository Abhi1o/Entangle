const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Starting ownership transfer...");

  // Contract address
  const CONTRACT_ADDRESS = "0xA514E844fe0a671D07d35B2897F6523C09cD9ecC";
  
  // New owner address (your Para wallet)
  const NEW_OWNER = "0x19e4aF5ddf305d5b3783071D18d6dc99807F92ee";

  // Get the signer (current owner)
  const [deployer] = await ethers.getSigners();
  console.log("👤 Current owner:", deployer.address);
  console.log("🎯 New owner:", NEW_OWNER);

  // Get contract instance
  const MeetingAuction = await ethers.getContractFactory("MeetingAuction");
  const contract = MeetingAuction.attach(CONTRACT_ADDRESS);

  try {
    // Transfer ownership
    console.log("📝 Transferring ownership...");
    const tx = await contract.transferOwnership(NEW_OWNER);
    await tx.wait();
    
    console.log("✅ Ownership transferred successfully!");
    console.log("🔗 Transaction:", tx.hash);
    console.log("🌐 View on Snowtrace: https://testnet.snowtrace.io/tx/" + tx.hash);
    
    // Verify ownership
    const newOwner = await contract.owner();
    console.log("👑 New contract owner:", newOwner);
    
    if (newOwner.toLowerCase() === NEW_OWNER.toLowerCase()) {
      console.log("✅ Ownership verification successful!");
    } else {
      console.log("❌ Ownership verification failed!");
    }
    
  } catch (error) {
    console.error("❌ Failed to transfer ownership:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
