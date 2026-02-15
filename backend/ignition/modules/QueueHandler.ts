import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";
import deployed_addresses_sepolia from "../deployments/sepolia_v0-9-8/deployed_addresses.json";

const QueueHandlerModule = buildModule("QueueHandlerModule", (m) => {
  console.log("network.name:", network.name);

  let sponsorshipQueueAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    sponsorshipQueueAddress = deployed_addresses_sepolia["SponsorshipQueueModule#SponsorshipQueue"];
  } else if (network.name == "mainnet") {
    // TODO: ./ignition/deployments/mainnet-v?-?-?/deployed_addresses.json
  }
  console.log("sponsorshipQueueAddress:", sponsorshipQueueAddress);

  let distributionQueueAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    distributionQueueAddress = deployed_addresses_sepolia["DistributionQueueModule#DistributionQueue"];
  } else if (network.name == "mainnet") {
    // TODO: ./ignition/deployments/mainnet-v?-?-?/deployed_addresses.json
  }
  console.log("distributionQueueAddress:", distributionQueueAddress);

  let distributionVerifierAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    distributionVerifierAddress = deployed_addresses_sepolia["DistributionVerifierModule#DistributionVerifier"];
  } else if (network.name == "mainnet") {
    // TODO: ./ignition/deployments/mainnet-v?-?-?/deployed_addresses.json
  }
  console.log("distributionVerifierAddress:", distributionVerifierAddress);
  
  const queueHandler = m.contract("QueueHandler", [
    sponsorshipQueueAddress,
    distributionQueueAddress,
    distributionVerifierAddress
  ]);

  return { queueHandler };
});

export default QueueHandlerModule;
