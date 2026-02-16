// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import { IRoles } from "@elimu-ai/dao-contracts/IRoles.sol";
import { IDistributionVerifier } from "./interface/IDistributionVerifier.sol";
import { ProtocolVersion } from "./util/ProtocolVersion.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Handles approval/rejection of distributions added to `DistributionQueue.sol`
contract DistributionVerifier is IDistributionVerifier, ProtocolVersion, Ownable {
    IRoles public roles;
    mapping(uint24 => uint8) public approvalCount;
    mapping(uint24 => uint8) public rejectionCount;
    mapping(uint24 => mapping(address => bool)) verifications;

    event RolesUpdated(address roles);
    event DistributionApproved(uint24 queueNumber, address indexed operator);
    event DistributionRejected(uint24 queueNumber, address indexed operator);

    constructor(address roles_) Ownable(msg.sender) {
        roles = IRoles(roles_);
    }

    function updateRoles(address roles_) public onlyOwner {
        roles = IRoles(roles_);
        emit RolesUpdated(roles_);
    }

    function verifyDistribution(uint24 queueNumber, bool approved) public {
        require(roles.isDaoOperator(msg.sender), "Only DAO operators can approve/reject distributions");
        require(!verifications[queueNumber][msg.sender], "Verification already exists for this DAO operator");
        if (approved) {
            approvalCount[queueNumber] += 1;
            verifications[queueNumber][msg.sender] = true;
            emit DistributionApproved(queueNumber, msg.sender);
        } else {
            rejectionCount[queueNumber] += 1;
            verifications[queueNumber][msg.sender] = true;
            emit DistributionRejected(queueNumber, msg.sender);
        }
    }

    function isDistributionApproved(uint24 queueNumber) public view returns (bool) {
        return approvalCount[queueNumber] > rejectionCount[queueNumber];
    }

    function isDistributionRejected(uint24 queueNumber) public view returns (bool) {
        return rejectionCount[queueNumber] > approvalCount[queueNumber];
    }
}
