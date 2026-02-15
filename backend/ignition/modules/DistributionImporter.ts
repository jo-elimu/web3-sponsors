import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";
import deployed_addresses_sepolia from "../deployments/sepolia_v0-9-8/deployed_addresses.json";

const DistributionImporterModule = buildModule("DistributionImporterModule", (m) => {
  console.log("network.name:", network.name);

  let distributionQueueAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    distributionQueueAddress = deployed_addresses_sepolia["DistributionQueueModule#DistributionQueue"];
  } else if (network.name == "mainnet") {
    // TODO: ./ignition/deployments/mainnet-v?-?-?/deployed_addresses.json
  }
  console.log("distributionQueueAddress:", distributionQueueAddress);
  
  const distributionImporter = m.contract("DistributionImporter", [
    distributionQueueAddress
  ]);

  return { distributionImporter };
});

export default DistributionImporterModule;
