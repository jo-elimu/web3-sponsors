// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import { Sponsorship, SponsorshipQueue } from "./SponsorshipQueue.sol";
import { Distribution, DistributionQueue } from "./DistributionQueue.sol";
import { IDistributionVerifier } from "./interface/IDistributionVerifier.sol";
import { ProtocolVersion } from "./util/ProtocolVersion.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Handles pairing of sponsorships with distributions
contract QueueHandler is ProtocolVersion, Ownable {
    SponsorshipQueue public immutable sponsorshipQueue;
    DistributionQueue public immutable distributionQueue;
    IDistributionVerifier public distributionVerifier;

    event RolesUpdated(address);
    event DistributionVerifierUpdated(address);
    event QueuePairProcessed(uint24 distributionQueueNumber, uint24 sponsorshipQueueNumber, address indexed operator);
    event RejectedDistributionRemoved(uint24 queueNumber, address indexed operator);

    constructor(address sponsorshipQueue_, address distributionQueue_, address distributionVerifier_) Ownable(msg.sender){
        sponsorshipQueue = SponsorshipQueue(sponsorshipQueue_);
        distributionQueue = DistributionQueue(distributionQueue_);
        distributionVerifier = IDistributionVerifier(distributionVerifier_);
    }

    function updateDistributionVerifier(address distributionVerifier_) public onlyOwner {
        distributionVerifier = IDistributionVerifier(distributionVerifier_);
        emit DistributionVerifierUpdated(distributionVerifier_);
    }

    /// @notice Pair the next distribution (if approved) with the next sponsorship
    function processQueuePair() public {
        // Verify that the queue of distributions is not empty
        require(distributionQueue.getLength() > 0, "The distribution queue cannot be empty");

        // Get the next distribution in the queue
        uint24 distributionQueueNumber = distributionQueue.queueNumberFront();

        // Verify that the distribution has been approved
        require(distributionVerifier.isDistributionApproved(distributionQueueNumber), "Only approved distributions can be processed");

        // Verify that the queue of sponsorships is not empty
        require(sponsorshipQueue.getLength() > 0, "The sponsorship queue cannot be empty");

        // Remove the distribution from the queue
        Distribution memory distribution = distributionQueue.dequeue();

        // Remove the sponsorship from the queue
        uint24 sponsorshipQueueNumber = sponsorshipQueue.queueNumberFront();
        Sponsorship memory sponsorship = sponsorshipQueue.dequeue();

        // Transfer ETH from the sponsorship to the distributor
        sponsorshipQueue.payDistributor(distribution.distributor, sponsorship);

        // Emit event
        emit QueuePairProcessed(distributionQueueNumber, sponsorshipQueueNumber, msg.sender);
    }

    /// @notice Remove rejected distribution from the queue
    function removeRejectedDistribution() public {
        // Verify that the queue of distributions is not empty
        require(distributionQueue.getLength() > 0, "The distribution queue cannot be empty");

        // Verify that the next distribution in the queue has been rejected
        uint24 distributionQueueNumber = distributionQueue.queueNumberFront();
        bool isDistributionRejected = distributionVerifier.isDistributionRejected(distributionQueueNumber);
        require(isDistributionRejected, "Only rejected distributions can be removed from the queue");

        // Remove the distribution from the queue
        distributionQueue.dequeue();

        // Emit event
        emit RejectedDistributionRemoved(distributionQueueNumber, msg.sender);
    }
}
