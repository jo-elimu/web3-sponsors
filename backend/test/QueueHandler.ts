import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("QueueHandler", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [account1, account2, account3] = await hre.ethers.getSigners();

    const ElimuToken = await hre.ethers.getContractFactory("DummyERC20");
    const elimuToken = await ElimuToken.deploy("elimu.ai", "ELIMU");

    const GElimuToken = await hre.ethers.getContractFactory("DummyERC20");
    const gElimuToken = await GElimuToken.deploy("Governance elimu.ai", "gELIMU");

    const Roles = await hre.ethers.getContractFactory("DummyRoles");
    const roles = await Roles.deploy(elimuToken.getAddress(), gElimuToken.getAddress());

    const SponsorshipQueue = await hre.ethers.getContractFactory("SponsorshipQueue");
    const estimatedCost = hre.ethers.parseUnits("0.02");
    const sponsorshipQueue = await SponsorshipQueue.deploy(estimatedCost);

    const Languages = await hre.ethers.getContractFactory("DummyLanguages");
    const languages = await Languages.deploy();
    await languages.addSupportedLanguage("HIN");

    const DistributionQueue = await hre.ethers.getContractFactory("DistributionQueue");
    const distributionQueue = await DistributionQueue.deploy(await languages.getAddress());

    const DistributionVerifier = await hre.ethers.getContractFactory("DistributionVerifier");
    const distributionVerifier = await DistributionVerifier.deploy(await roles.getAddress());

    const QueueHandler = await hre.ethers.getContractFactory("QueueHandler");
    const queueHandler = await QueueHandler.deploy(
      await sponsorshipQueue.getAddress(),
      await distributionQueue.getAddress(),
      await distributionVerifier.getAddress()
    );

    await distributionQueue.updateQueueHandler(await queueHandler.getAddress());
    await sponsorshipQueue.updateQueueHandler(await queueHandler.getAddress());

    return { queueHandler, distributionVerifier, distributionQueue, sponsorshipQueue, roles, account1, account2, account3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { queueHandler, account1 } = await loadFixture(deployFixture);

      expect(await queueHandler.owner()).to.equal(account1.address);
    });

    it("Should set the right DistributionVerifier contract", async function () {
      const { queueHandler, distributionVerifier } = await loadFixture(deployFixture);

      expect(await queueHandler.distributionVerifier()).to.equal(await distributionVerifier.getAddress());
    });

    it("Should set the correct protocol version", async function () {
      const { queueHandler } = await loadFixture(deployFixture);
      expect(await queueHandler.protocolVersion()).to.equal("0.9.8");
    });
  });

  describe("Update owner address", function () {
    it("Should change the right owner", async function () {
      const { queueHandler, account1, account2 } = await loadFixture(deployFixture);

      expect(await queueHandler.owner()).to.equal(account1.address);
      await queueHandler.transferOwnership(account2.address);
      expect(await queueHandler.owner()).to.equal(account2.address);
    });
  });

  describe("Update DistributionVerifier contract", function () {
    it("Should change the DistributionVerifier contract", async function () {
      const { queueHandler, distributionVerifier } = await loadFixture(deployFixture);

      expect(await queueHandler.distributionVerifier()).to.equal(await distributionVerifier.getAddress());
      await queueHandler.updateDistributionVerifier(ethers.ZeroAddress);
      expect(await queueHandler.distributionVerifier()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Process Queue Pair", function () {
    it("Transaction should be rejected if distribution queue is empty", async function () {
      const { queueHandler } = await loadFixture(deployFixture);

      await expect(queueHandler.processQueuePair()).to.be.rejectedWith("The distribution queue cannot be empty");
    });

    it("Transaction should be rejected if distribution has 0 approvals, 0 rejections", async function () {
      const { queueHandler, distributionQueue } = await loadFixture(deployFixture);

      await distributionQueue.addDistribution("HIN", "fbc880caac090c43");

      const distributionQueueLengthBefore = await distributionQueue.getLength();
      expect(distributionQueueLengthBefore).to.equal(1);

      await expect(queueHandler.processQueuePair()).to.be.rejectedWith("Only approved distributions can be processed");

      const distributionQueueLengthAfter = await distributionQueue.getLength();
      expect(distributionQueueLengthAfter).to.equal(1);
    });

    it("Transaction should be rejected if distribution has 0 approvals, 1 rejection", async function () {
      const { queueHandler, distributionVerifier, distributionQueue, sponsorshipQueue } = await loadFixture(deployFixture);

      await distributionQueue.addDistribution("HIN", "fbc880caac090c43");
      await distributionVerifier.verifyDistribution(1, false);

      await expect(queueHandler.processQueuePair()).to.be.rejectedWith("Only approved distributions can be processed");
    });

    it("Transaction should be rejected if sponsorship queue is empty", async function () {
      const { queueHandler, distributionVerifier, distributionQueue, sponsorshipQueue } = await loadFixture(deployFixture);

      await distributionQueue.addDistribution("HIN", "fbc880caac090c43");
      await distributionVerifier.verifyDistribution(1, true);

      const distributionQueueLengthBefore = await distributionQueue.getLength();
      expect(distributionQueueLengthBefore).to.equal(1);

      await expect(queueHandler.processQueuePair()).to.be.rejectedWith("The sponsorship queue cannot be empty");

      const distributionQueueLengthAfter = await distributionQueue.getLength();
      expect(distributionQueueLengthAfter).to.equal(1);
    });

    it("Transaction should be processed if distribution has 1 approval, 0 rejections", async function () {
      const { queueHandler, distributionVerifier, distributionQueue, sponsorshipQueue } = await loadFixture(deployFixture);

      await distributionQueue.addDistribution("HIN", "fbc880caac090c43");
      await distributionVerifier.verifyDistribution(1, true);

      await sponsorshipQueue.addSponsorship({ value: hre.ethers.parseUnits("0.02") });

      const distributionQueueLengthBefore = await distributionQueue.getLength();
      expect(distributionQueueLengthBefore).to.equal(1);
      
      const sponsorshipQueueLengthBefore = await sponsorshipQueue.getLength();
      expect(sponsorshipQueueLengthBefore).to.equal(1);

      await queueHandler.processQueuePair();

      const distributionQueueLengthAfter = await distributionQueue.getLength();
      expect(distributionQueueLengthAfter).to.equal(0);

      const sponsorshipQueueLengthAfter = await sponsorshipQueue.getLength();
      expect(sponsorshipQueueLengthAfter).to.equal(0);
    });

    it("Distributor balance should increase after successful queue pair processing", async function () {
      const { queueHandler, distributionVerifier, distributionQueue, sponsorshipQueue, account2 } = await loadFixture(deployFixture);

      await distributionQueue.connect(account2).addDistribution("HIN", "fbc880caac090c43");
      await distributionVerifier.verifyDistribution(1, true);

      await sponsorshipQueue.addSponsorship({ value: hre.ethers.parseUnits("0.02") });

      const sponsorBalanceBefore = await ethers.provider.getBalance(account2);
      console.log("sponsorBalanceBefore:", ethers.formatEther(sponsorBalanceBefore));

      await queueHandler.processQueuePair();

      const sponsorBalanceAfter = await ethers.provider.getBalance(account2);
      console.log("sponsorBalanceAfter:", ethers.formatEther(sponsorBalanceAfter));

      const sponsorBalanceDiff = sponsorBalanceAfter - sponsorBalanceBefore;
      console.log("sponsorBalanceDiff:", ethers.formatEther(sponsorBalanceDiff));
      expect(sponsorBalanceDiff).to.equal(hre.ethers.parseUnits("0.02"));
    });
  });

  describe("Remove Rejected Distribution", function () {
    it("Transaction should be rejected if distribution queue is empty", async function () {
      const { queueHandler } = await loadFixture(deployFixture);

      await expect(queueHandler.removeRejectedDistribution()).to.be.rejectedWith("The distribution queue cannot be empty");
    });

    it("Transaction should be rejected if the distribution has not been rejected", async function () {
      const { queueHandler, distributionQueue } = await loadFixture(deployFixture);

      await distributionQueue.addDistribution("HIN", "fbc880caac090c43");

      await expect(queueHandler.removeRejectedDistribution()).to.be.rejectedWith("Only rejected distributions can be removed from the queue");
    });

    it("Rejected distribution should be removed from queue", async function () {
      const { queueHandler, distributionQueue, distributionVerifier } = await loadFixture(deployFixture);

      await distributionQueue.addDistribution("HIN", "fbc880caac090c43");
      await distributionVerifier.verifyDistribution(1, false);

      const distributionQueueLengthBefore = await distributionQueue.getLength();
      expect(distributionQueueLengthBefore).to.equal(1);

      await queueHandler.removeRejectedDistribution();

      const distributionQueueLengthAfter = await distributionQueue.getLength();
      expect(distributionQueueLengthAfter).to.equal(0);
    });
  });
});
