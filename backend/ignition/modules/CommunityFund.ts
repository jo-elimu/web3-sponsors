import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";
import deployed_addresses_sepolia from "../deployments/sepolia_v0-9-9/deployed_addresses.json";

const CommunityFundModule = buildModule("CommunityFundModule", (m) => {
  console.log("network.name:", network.name);

  let sponsorshipQueueAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    sponsorshipQueueAddress = deployed_addresses_sepolia["SponsorshipQueueModule#SponsorshipQueue"];
  } else if (network.name == "mainnet") {
    // TODO: ./ignition/deployments/mainnet-v?-?-?/deployed_addresses.json
  }
  console.log("sponsorshipQueueAddress:", sponsorshipQueueAddress);
  
  const communityFund = m.contract("CommunityFund", [
    sponsorshipQueueAddress
  ]);

  return { communityFund };
});

export default CommunityFundModule;
