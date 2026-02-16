import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("SponsorshipQueue", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [account1, account2] = await hre.ethers.getSigners();

    const estimatedCost = hre.ethers.parseUnits("0.02");

    const SponsorshipQueue = await hre.ethers.getContractFactory("SponsorshipQueue");
    const sponsorshipQueue = await SponsorshipQueue.deploy(estimatedCost);

    return { sponsorshipQueue, account1, account2 };
  }

  describe("Deployment", function () {
    it("Should set the right estimated cost", async function () {
      const { sponsorshipQueue } = await loadFixture(deployFixture);

      const expectedValue = hre.ethers.parseUnits("0.02");
      console.log("expectedValue:", expectedValue);
      expect(await sponsorshipQueue.estimatedCost()).to.equal(expectedValue);
    });

    it("Should set the right owner", async function () {
      const { sponsorshipQueue, account1 } = await loadFixture(deployFixture);

      expect(await sponsorshipQueue.owner()).to.equal(account1.address);
    });

    it("Should set the correct protocol version", async function () {
      const { sponsorshipQueue } = await loadFixture(deployFixture);
      expect(await sponsorshipQueue.protocolVersion()).to.equal("0.9.8");
    });
  });

  describe("Update owner address", function () {
    it("Should change the owner", async function () {
      const { sponsorshipQueue, account1, account2 } = await loadFixture(deployFixture);

      expect(await sponsorshipQueue.owner()).to.equal(account1.address);
      await sponsorshipQueue.transferOwnership(account2.address);
      expect(await sponsorshipQueue.owner()).to.equal(account2.address);
    });
  });

  describe("EstimatedCost", function () {
    it("Should emit an event on update", async function () {
      const { sponsorshipQueue } = await loadFixture(deployFixture);

      const newEstimatedCost = hre.ethers.parseUnits("0.03");
      console.log("newEstimatedCost:", newEstimatedCost);
      await expect(sponsorshipQueue.updateEstimatedCost(newEstimatedCost))
        .to.emit(sponsorshipQueue, "EstimatedCostUpdated")
        .withArgs(newEstimatedCost);
    });
  });

  describe("Sponsorships", function () {
    it("addSponsorship should be rejected if mismatching ETH amount", async function () {
      const { sponsorshipQueue } = await loadFixture(deployFixture);

      await expect(sponsorshipQueue.addSponsorship({ value: hre.ethers.parseUnits("0.0222") }))
        .to.be.rejectedWith("Must send exactly the estimated cost");
    });

    it("Should emit an event on addSponsorship", async function () {
      const { sponsorshipQueue, account1 } = await loadFixture(deployFixture);

      const tx = await sponsorshipQueue.addSponsorship({ value: hre.ethers.parseUnits("0.02") });
      await expect(tx).to.emit(sponsorshipQueue, "SponsorshipAdded");

      // Ensure that the indexed `sponsor` parameter gets added to the event logs
      //   event SponsorshipAdded(uint256 timestamp, address indexed sponsor);
      const receipt = await tx.wait();
      const eventLog = receipt?.logs[0];
      const topics = eventLog?.topics;
      expect(topics?.length).to.equal(2);
      const addressAsHex = topics?.at(1);
      const address = "0x" + addressAsHex?.slice(-40);
      expect(address).to.equal(account1.address.toLowerCase());
    });

    it("Should increase contract balance on addSponsorship", async function () {
      const { sponsorshipQueue } = await loadFixture(deployFixture);

      console.log("sponsorshipQueue.target:", sponsorshipQueue.target);

      await sponsorshipQueue.addSponsorship({ value: hre.ethers.parseUnits("0.02") });
      const contractBalance = await hre.ethers.provider.getBalance(sponsorshipQueue.target);
      console.log("contractBalance:", contractBalance);
      expect(contractBalance).to.equal(hre.ethers.parseUnits("0.02"));
    });

    it("Should increase queue length on addSponsorship", async function () {
      const { sponsorshipQueue, account1 } = await loadFixture(deployFixture);

      const queueLengthBefore = await sponsorshipQueue.getLength();
      console.log("queueLengthBefore:", queueLengthBefore);
      expect(queueLengthBefore).to.equal(0);

      await sponsorshipQueue.addSponsorship({ value: hre.ethers.parseUnits("0.02") });
      
      const queueLengthAfter = await sponsorshipQueue.getLength();
      console.log("queueLengthAfter:", queueLengthAfter);
      expect(queueLengthAfter).to.equal(1);

      const sponsorshipAtQueueNumber1After = await sponsorshipQueue.queue(1);
      console.log("sponsorshipAtQueueNumber1After:", sponsorshipAtQueueNumber1After);
      expect(sponsorshipAtQueueNumber1After.sponsor).to.equal(account1.address);
    });
  });
});
