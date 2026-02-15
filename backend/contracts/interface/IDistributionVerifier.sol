// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

interface IDistributionVerifier {
    function isDistributionApproved(uint24 queueNumber) external view returns (bool);
    function isDistributionRejected(uint24 queueNumber) external view returns (bool);
}
