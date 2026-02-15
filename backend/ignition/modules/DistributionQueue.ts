import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";

const DistributionQueueModule = buildModule("DistributionQueueModule", (m) => {
  console.log("network.name:", network.name);

  let languagesAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    // https://github.com/elimu-ai/web3-smart-contracts/blob/main/dao-contracts/ignition/deployments/chain-11155111/deployed_addresses.json
    languagesAddress = "0x427b4855762914EcE8AAD1e4D3B23F543282D3ee";
  } else if (network.name == "mainnet") {
    // https://github.com/elimu-ai/web3-smart-contracts/blob/main/dao-contracts/ignition/deployments/chain-1/deployed_addresses.json
    languagesAddress = "0xba9f3C5ED04a76B613137e7E795F27192C1FF3Be";
  }
  console.log("languagesAddress:", languagesAddress);
  
  const distributionQueue = m.contract("DistributionQueue", [languagesAddress]);

  return { distributionQueue };
});

export default DistributionQueueModule;
