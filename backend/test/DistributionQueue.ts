import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("DistributionQueue", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [account1, account2] = await hre.ethers.getSigners();

    const Languages = await hre.ethers.getContractFactory("DummyLanguages");
    const languages = await Languages.deploy();
    await languages.addSupportedLanguage("HIN");

    const DistributionQueue = await hre.ethers.getContractFactory("DistributionQueue");
    const distributionQueue = await DistributionQueue.deploy(await languages.getAddress());

    return { distributionQueue, languages, account1, account2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { distributionQueue, account1 } = await loadFixture(deployFixture);

      expect(await distributionQueue.owner()).to.equal(account1.address);
    });

    it("Should set the correct protocol version", async function () {
      const { distributionQueue } = await loadFixture(deployFixture);
      expect(await distributionQueue.protocolVersion()).to.equal("0.9.9");
    });
  });

  describe("Update owner address", function () {
    it("Should change the owner", async function () {
      const { distributionQueue, account1, account2 } = await loadFixture(deployFixture);

      expect(await distributionQueue.owner()).to.equal(account1.address);
      await distributionQueue.transferOwnership(account2.address);
      expect(await distributionQueue.owner()).to.equal(account2.address);
    });
  });

  describe("Update Languages address", function () {
    it("Should change the Languages contract", async function () {
      const { distributionQueue, languages, account2 } = await loadFixture(deployFixture);

      expect(await distributionQueue.languages()).to.equal(await languages.getAddress());
      await distributionQueue.updateLanguages(account2.address);
      expect(await distributionQueue.languages()).to.equal(account2.address);
    });
  });

  describe("Update QueueHandler address", function () {
    it("Should change the queue handler", async function () {
      const { distributionQueue, account2 } = await loadFixture(deployFixture);

      expect(await distributionQueue.queueHandler()).to.equal(ethers.ZeroAddress);
      await distributionQueue.updateQueueHandler(account2.address);
      expect(await distributionQueue.queueHandler()).to.equal(account2.address);
    });
  });

  describe("Distributions", function () {
    it ("Should revert with an error if invalid language code", async function () {
      const { distributionQueue } = await loadFixture(deployFixture);

      await expect(distributionQueue.addDistribution("SWA", "fbc880caac090c43"))
        .to.be.revertedWithCustomError(distributionQueue, "InvalidLanguageCode");
    });

    it ("Should revert with an error if duplicate Android ID", async function () {
      const { distributionQueue } = await loadFixture(deployFixture);

      await distributionQueue.addDistribution("HIN", "fbc880caac090c43");
      await expect(distributionQueue.addDistribution("HIN", "fbc880caac090c43"))
        .to.be.revertedWithCustomError(distributionQueue, "DuplicateAndroidId");
    });

    it("Should emit an event on addDistribution", async function () {
      const { distributionQueue } = await loadFixture(deployFixture);

      await expect(distributionQueue.addDistribution("HIN", "fbc880caac090c43"))
        .to.emit(distributionQueue, "DistributionAdded");
    });

    it("Should increase queue count on addDistribution", async function () {
      const { distributionQueue, account1 } = await loadFixture(deployFixture);

      const queueLengthBefore = await distributionQueue.getLength();
      console.log("queueLengthBefore:", queueLengthBefore);
      expect(queueLengthBefore).to.equal(0);

      const distributionAtQueueNumber1Before = await distributionQueue.queue(1);
      console.log("distributionAtQueueNumber1Before:", distributionAtQueueNumber1Before);
      expect(distributionAtQueueNumber1Before.distributor).to.equal(ethers.ZeroAddress);

      const queueNumberFrontBefore = await distributionQueue.queueNumberFront();
      console.log("queueNumberFrontBefore:", queueNumberFrontBefore);
      expect(queueNumberFrontBefore).to.equal(1);

      const queueNumberNextBefore = await distributionQueue.queueNumberNext();
      console.log("queueNumberNextBefore:", queueNumberNextBefore);
      expect(queueNumberNextBefore).to.equal(1);

      await distributionQueue.addDistribution("HIN", "fbc880caac090c43");
      
      const queueLengthAfter = await distributionQueue.getLength();
      console.log("queueLengthAfter:", queueLengthAfter);
      expect(queueLengthAfter).to.equal(1);

      const distributionAtQueueNumber1After = await distributionQueue.queue(1);
      console.log("distributionAtQueueNumber1After:", distributionAtQueueNumber1After);
      expect(distributionAtQueueNumber1After.distributor).to.equal(account1.address);

      const queueNumberFrontAfter = await distributionQueue.queueNumberFront();
      console.log("queueNumberFrontAfter:", queueNumberFrontAfter);
      expect(queueNumberFrontAfter).to.equal(1);

      const queueNumberNextAfter = await distributionQueue.queueNumberNext();
      console.log("queueNumberNextAfter:", queueNumberNextAfter);
      expect(queueNumberNextAfter).to.equal(2);
    });
  });
});
