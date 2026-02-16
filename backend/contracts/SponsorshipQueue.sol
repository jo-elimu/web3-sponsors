// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import { ISponsorshipQueue } from "./interface/ISponsorshipQueue.sol";
import { ProtocolVersion } from "./util/ProtocolVersion.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

struct Sponsorship {
    uint256 estimatedCost;
    uint256 timestamp;
    address sponsor;
}

/// @title A queue of sponsorships
/// @author Ξlimu DAO
/// @notice A queue of sponsorships for the Ξlimu DAO's education sponsorship program (https://sponsors.elimu.ai)
/// @dev The address of the queue handler smart contract needs to be set after deployment
contract SponsorshipQueue is ISponsorshipQueue, ProtocolVersion, Ownable {
    uint256 public estimatedCost;
    address public queueHandler;
    mapping(uint24 => Sponsorship) public queue;
    uint24 public queueNumberFront = 1;
    uint24 public queueNumberNext = 1;

    event EstimatedCostUpdated(uint256);
    event QueueHandlerUpdated(address);
    event SponsorshipAdded(uint24 queueNumber, address indexed sponsor);

    constructor(uint256 estimatedCost_) Ownable(msg.sender) {
        estimatedCost = estimatedCost_;
    }

    /// @notice Update the amount that a sponsor will have to pay
    /// @param estimatedCost_ The new estimated cost
    function updateEstimatedCost(uint256 estimatedCost_) public onlyOwner {
        estimatedCost = estimatedCost_;
        emit EstimatedCostUpdated(estimatedCost_);
    }

    /// @notice Change the handler of this queue
    /// @param queueHandler_ The address of the new queue handler smart contract
    function updateQueueHandler(address queueHandler_) public onlyOwner {
        queueHandler = queueHandler_;
        emit QueueHandlerUpdated(queueHandler_);
    }

    /// @notice Pay ETH to this smart contract
    /// @dev The amount of ETH to pay can be changed by adjusting the `estimatedCost` variable
    function addSponsorship() external payable {
        require(msg.value == estimatedCost, "Must send exactly the estimated cost");
        Sponsorship memory sponsorship = Sponsorship(
            estimatedCost,
            block.timestamp,
            msg.sender
        );
        enqueue(sponsorship);
        emit SponsorshipAdded(queueNumberNext - 1, msg.sender);
    }

    /// @dev Internal function to add a sponsorship to the queue
    /// @param sponsorship The sponsorship to add
    function enqueue(Sponsorship memory sponsorship) private {
        queue[queueNumberNext] = sponsorship;
        queueNumberNext += 1;
    }

    /// @notice Remove and return the next sponsorship from the queue
    /// @dev Only callable by the queue handler
    /// @return The sponsorship that was removed from the front of the queue
    function dequeue() public returns (Sponsorship memory) {
        require(msg.sender == queueHandler, "Only the queue handler can remove from the queue");
        require(getLength() > 0, "Queue is empty");
        Sponsorship memory sponsorship = queue[queueNumberFront];
        queueNumberFront += 1;
        return sponsorship;
    }

    /// @notice Get the current length of the queue
    /// @return The number of sponsorships in the queue (that have not yet been processed)
    function getLength() public view returns (uint256) {
        return queueNumberNext - queueNumberFront;
    }

    /// @notice Transfer ETH from a sponsorship to a distributor
    /// @dev Only callable by the queue handler
    /// @param distributor The address to receive the ETH
    /// @param sponsorship The sponsorship containing the amount to transfer
    function payDistributor(address distributor, Sponsorship memory sponsorship) public {
        require(msg.sender == queueHandler, "Only the queue handler can process payouts");
        payable(distributor).transfer(sponsorship.estimatedCost);
    }
}
