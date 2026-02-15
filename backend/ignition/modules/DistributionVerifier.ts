import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";

const DistributionVerifierModule = buildModule("DistributionVerifierModule", (m) => {
  console.log("network.name:", network.name);

  let rolesAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    // https://github.com/elimu-ai/web3-smart-contracts/blob/main/dao-contracts/ignition/deployments/chain-11155111/deployed_addresses.json
    rolesAddress = "0xEEEfc85bb17FdCA42C7275a3d843093399505fda";
  } else if (network.name == "mainnet") {
    // https://github.com/elimu-ai/web3-smart-contracts/blob/main/dao-contracts/ignition/deployments/chain-1/deployed_addresses.json
    rolesAddress = "0x51baBDc198d6dC4A8D1144c02748D7E084f770Db";
  }
  console.log("rolesAddress:", rolesAddress);
  
  const distributionQueue = m.contract("DistributionVerifier", [rolesAddress]);

  return { distributionQueue };
});

export default DistributionVerifierModule;
