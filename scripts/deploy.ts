import { ethers } from "hardhat";
import { ConfidentialMedicalResearch } from "../typechain-types";

/**
 * # Deployment Script for Confidential Medical Research
 *
 * This script deploys the ConfidentialMedicalResearch contract to the specified network.
 *
 * ## Usage:
 * ```bash
 * npx hardhat run scripts/deploy.ts --network localhost
 * npx hardhat run scripts/deploy.ts --network sepolia
 * ```
 *
 * ## Environment Variables:
 * - SEPOLIA_RPC_URL: RPC endpoint for Sepolia testnet
 * - PRIVATE_KEY: Private key of the deployer account
 *
 * chapter: deployment
 */
async function main() {
  console.log("🏥 Deploying ConfidentialMedicalResearch contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);

  // Check account balance
  const balance = await deployer.getBalance();
  console.log(
    "💰 Account balance:",
    ethers.formatEther(balance),
    "ETH\n"
  );

  // Get the contract factory
  const ContractFactory =
    await ethers.getContractFactory("ConfidentialMedicalResearch");

  // Deploy the contract
  console.log("⏳ Deploying ConfidentialMedicalResearch...");
  const contract =
    (await ContractFactory.deploy()) as ConfidentialMedicalResearch;

  // Wait for deployment to be mined
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ ConfidentialMedicalResearch deployed to:", contractAddress);
  console.log(
    "📝 Transaction hash:",
    contract.deploymentTransaction()?.hash
  );

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const researchCoordinator = await contract.researchCoordinator();
  const currentStudyId = await contract.currentStudyId();

  console.log("🔬 Research Coordinator:", researchCoordinator);
  console.log("📊 Current Study ID:", currentStudyId.toString());

  // Save deployment info
  const deploymentInfo = {
    contract: "ConfidentialMedicalResearch",
    address: contractAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deploymentTime: new Date().toISOString(),
    txHash: contract.deploymentTransaction()?.hash,
  };

  console.log("\n✨ Deployment completed successfully!");
  console.log("📦 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

  // Save to file for reference
  const fs = require("fs");
  const deploymentPath = "./deployments/latest.json";
  const deploymentsDir = "./deployments";

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to ${deploymentPath}`);

  return deploymentInfo;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
