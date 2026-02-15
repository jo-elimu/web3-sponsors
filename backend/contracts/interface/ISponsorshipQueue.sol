// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

interface ISponsorshipQueue {
    function estimatedCost() external view returns (uint256);
    function addSponsorship() external payable;
}
