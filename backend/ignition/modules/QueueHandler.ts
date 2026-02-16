import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";
import deployed_addresses_sepolia from "../deployments/sepolia_v0-9-9/deployed_addresses.json";
import deployed_addresses_mainnet from "../deployments/mainnet_v0-9-9/deployed_addresses.json";

const QueueHandlerModule = buildModule("QueueHandlerModule", (m) => {
  console.log("network.name:", network.name);

  let sponsorshipQueueAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    sponsorshipQueueAddress = deployed_addresses_sepolia["SponsorshipQueueModule#SponsorshipQueue"];
  } else if (network.name == "mainnet") {
    sponsorshipQueueAddress = deployed_addresses_mainnet["SponsorshipQueueModule#SponsorshipQueue"];
  }
  console.log("sponsorshipQueueAddress:", sponsorshipQueueAddress);

  let distributionQueueAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    distributionQueueAddress = deployed_addresses_sepolia["DistributionQueueModule#DistributionQueue"];
  } else if (network.name == "mainnet") {
    distributionQueueAddress = deployed_addresses_mainnet["DistributionQueueModule#DistributionQueue"];
  }
  console.log("distributionQueueAddress:", distributionQueueAddress);

  let distributionVerifierAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    distributionVerifierAddress = deployed_addresses_sepolia["DistributionVerifierModule#DistributionVerifier"];
  } else if (network.name == "mainnet") {
    distributionVerifierAddress = deployed_addresses_mainnet["DistributionVerifierModule#DistributionVerifier"];
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
