const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ConfidentialMedicalResearch contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Check account balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  // Get the contract factory
  const ConfidentialMedicalResearch = await ethers.getContractFactory("ConfidentialMedicalResearch");

  // Deploy the contract
  const contract = await ConfidentialMedicalResearch.deploy();

  // Wait for deployment to be mined
  await contract.deployed();

  console.log("ConfidentialMedicalResearch deployed to:", contract.address);
  console.log("Transaction hash:", contract.deployTransaction.hash);

  // Verify deployment
  console.log("Verifying deployment...");
  const researchCoordinator = await contract.researchCoordinator();
  const currentStudyId = await contract.currentStudyId();

  console.log("Research Coordinator:", researchCoordinator);
  console.log("Current Study ID:", currentStudyId.toString());

  // Save deployment info
  const deploymentInfo = {
    contract: "ConfidentialMedicalResearch",
    address: contract.address,
    deployer: deployer.address,
    network: await ethers.provider.getNetwork(),
    deploymentTime: new Date().toISOString(),
    txHash: contract.deployTransaction.hash
  };

  console.log("\nDeployment completed successfully!");
  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:");
    console.error(error);
    process.exit(1);
  });