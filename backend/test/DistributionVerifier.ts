import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("DistributionVerifier", function () {
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

    const DistributionVerifier = await hre.ethers.getContractFactory("DistributionVerifier");
    const distributionVerifier = await DistributionVerifier.deploy(await roles.getAddress());

    return { distributionVerifier, roles, elimuToken, account1, account2, account3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { distributionVerifier, account1 } = await loadFixture(deployFixture);

      expect(await distributionVerifier.owner()).to.equal(account1.address);
    });

    it("Should set the right Roles contract", async function () {
      const { distributionVerifier, roles } = await loadFixture(deployFixture);

      expect(await distributionVerifier.roles()).to.equal(await roles.getAddress());
    });

    it("Should set the correct protocol version", async function () {
      const { distributionVerifier } = await loadFixture(deployFixture);
      expect(await distributionVerifier.protocolVersion()).to.equal("0.9.9");
    });
  });

  describe("Update owner address", function () {
    it("Should change the owner", async function () {
      const { distributionVerifier, account1, account2 } = await loadFixture(deployFixture);

      expect(await distributionVerifier.owner()).to.equal(account1.address);
      await distributionVerifier.transferOwnership(account2.address);
      expect(await distributionVerifier.owner()).to.equal(account2.address);
    });
  });

  describe("Update Roles contract", function () {
    it("Should change the Roles contract", async function () {
      const { distributionVerifier, roles } = await loadFixture(deployFixture);

      expect(await distributionVerifier.roles()).to.equal(await roles.getAddress());
      await distributionVerifier.updateRoles(ethers.ZeroAddress);
      expect(await distributionVerifier.roles()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Verify distribution", function () {
    it("Transaction should be rejected if not operator", async function () {
      const { distributionVerifier, account2 } = await loadFixture(deployFixture);

      await expect(distributionVerifier.connect(account2).verifyDistribution(1, true)).to.be.rejected;
    });

    it("Transaction should go through if operator", async function () {
      const { distributionVerifier } = await loadFixture(deployFixture);

      expect(await distributionVerifier.isDistributionApproved(1)).to.equal(false);
      await distributionVerifier.verifyDistribution(1, true);
      expect(await distributionVerifier.isDistributionApproved(1)).to.equal(true);
    });

    it("Transaction should be rejected if duplicate", async function () {
      const { distributionVerifier } = await loadFixture(deployFixture);

      expect(await distributionVerifier.approvalCount(1)).to.equal(0);

      // 1st verification
      await distributionVerifier.verifyDistribution(1, true);
      expect(await distributionVerifier.approvalCount(1)).to.equal(1);

      // 2nd verification
      await expect(distributionVerifier.verifyDistribution(1, true)).to.be.rejectedWith("Verification already exists for this DAO operator");
      expect(await distributionVerifier.approvalCount(1)).to.equal(1);
    });
  });

  describe("Is approved", function () {
    it("Should be `false` if 0 approvals, 0 rejections", async function () {
      const { distributionVerifier } = await loadFixture(deployFixture);

      expect(await distributionVerifier.isDistributionApproved(1)).to.equal(false);
    });

    it("Should be `false` if 0 approvals, 1 rejection", async function () {
      const { distributionVerifier } = await loadFixture(deployFixture);

      await distributionVerifier.verifyDistribution(1, false);
      expect(await distributionVerifier.isDistributionApproved(1)).to.equal(false);
    });

    it("Should be `false` if 1 approval, 1 rejection", async function () {
      const { distributionVerifier, elimuToken, account2 } = await loadFixture(deployFixture);

      await distributionVerifier.verifyDistribution(1, true);

      await elimuToken.transfer(account2.address, ethers.parseEther("1935000"));
      await distributionVerifier.connect(account2).verifyDistribution(1, false);
      
      expect(await distributionVerifier.isDistributionApproved(1)).to.equal(false);
    });

    it("Should be `false` if 1 approval, 2 rejections", async function () {
      const { distributionVerifier, elimuToken, account2, account3 } = await loadFixture(deployFixture);

      await distributionVerifier.verifyDistribution(1, true);
      
      await elimuToken.transfer(account2.address, ethers.parseEther("1935000"));
      await distributionVerifier.connect(account2).verifyDistribution(1, false);

      await elimuToken.transfer(account3.address, ethers.parseEther("1935000"));
      await distributionVerifier.connect(account3).verifyDistribution(1, false);

      expect(await distributionVerifier.isDistributionApproved(1)).to.equal(false);
    });

    it("Should be `true` if 2 approvals, 1 rejection", async function () {
      const { distributionVerifier, elimuToken, account2, account3 } = await loadFixture(deployFixture);

      await distributionVerifier.verifyDistribution(1, true);
      
      await elimuToken.transfer(account2.address, ethers.parseEther("1935000"));
      await distributionVerifier.connect(account2).verifyDistribution(1, true);

      await elimuToken.transfer(account3.address, ethers.parseEther("1935000"));
      await distributionVerifier.connect(account3).verifyDistribution(1, false);

      expect(await distributionVerifier.isDistributionApproved(1)).to.equal(true);
    });
  });
});
