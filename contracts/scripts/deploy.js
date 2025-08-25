const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const MeetingAuction = await hre.ethers.getContractFactory("MeetingAuction");
  const meetingAuction = await MeetingAuction.deploy();

  await meetingAuction.deployed();

  console.log("MeetingAuction deployed to:", meetingAuction.address);
  console.log("Deployment transaction hash:", meetingAuction.deployTransaction.hash);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    address: meetingAuction.address,
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: meetingAuction.deployTransaction.hash
  };
  
  fs.writeFileSync(
    './deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
