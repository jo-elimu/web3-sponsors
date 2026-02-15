// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import { IDistributionQueue } from "@elimu-ai/sponsors/IDistributionQueue.sol";

contract DistributionImporter {
    IDistributionQueue public immutable distributionQueue;

    string[] public languageCodes;
    string[] public androidIds;

    event DistributionImported(address indexed importer, string languageCode, string androidId);
    event DistributionsProcessed(address indexed processor, uint256 count);

    constructor(address distributionQueue_) {
        distributionQueue = IDistributionQueue(distributionQueue_);
    }

    function importDistribution(string calldata languageCode, string calldata androidId) public {
        languageCodes.push(languageCode);
        androidIds.push(androidId);
        emit DistributionImported(msg.sender, languageCode, androidId);
    }

    function processDistributions() public {
        for (uint256 i = 0; i <= languageCodes.length - 1; i++) {
            distributionQueue.addDistribution(languageCodes[i], androidIds[i]);
        }
        emit DistributionsProcessed(msg.sender, languageCodes.length);
        delete languageCodes;
        delete androidIds;
    }
}
