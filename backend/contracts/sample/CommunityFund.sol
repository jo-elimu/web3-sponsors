// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import { ISponsorshipQueue } from "@elimu-ai/sponsors/ISponsorshipQueue.sol";

contract CommunityFund {
    ISponsorshipQueue public immutable sponsorshipQueue;

    event Received(address, uint256);

    error InsufficientFunds(uint256);

    constructor(address sponsorshipQueue_) {
        sponsorshipQueue = ISponsorshipQueue(sponsorshipQueue_);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function fundSponsorship() public {
        uint256 cost = sponsorshipQueue.estimatedCost();
        if (address(this).balance < cost) {
            revert InsufficientFunds(address(this).balance);
        }
        sponsorshipQueue.addSponsorship{value: cost}();
    }
}
