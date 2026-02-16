// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import { IDistributionQueue } from "./interface/IDistributionQueue.sol";
import { ILanguages } from "@elimu-ai/dao-contracts/ILanguages.sol";
import { ProtocolVersion } from "./util/ProtocolVersion.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

struct Distribution {
    string languageCode;
    string androidId;
    uint256 timestamp;
    address distributor;
}

/// @notice A queue of distributions for the Ξlimu DAO's education sponsorship program (https://sponsors.elimu.ai)
contract DistributionQueue is IDistributionQueue, ProtocolVersion, Ownable {
    ILanguages public languages;
    address public queueHandler;
    mapping(uint24 => Distribution) public queue;
    uint24 public queueNumberFront = 1;
    uint24 public queueNumberNext = 1;
    
    event LanguagesUpdated(address);
    event QueueHandlerUpdated(address);
    event DistributionAdded(uint24 queueNumber, address indexed distributor);

    error InvalidLanguageCode();

    constructor(address languages_) Ownable(msg.sender) {
        languages = ILanguages(languages_);
    }

    function updateLanguages(address languages_) public onlyOwner {
        languages = ILanguages(languages_);
        emit LanguagesUpdated(languages_);
    }

    function updateQueueHandler(address queueHandler_) public onlyOwner {
        queueHandler = queueHandler_;
        emit QueueHandlerUpdated(queueHandler_);
    }

    function addDistribution(string calldata languageCode, string calldata androidId) external {
        if (!languages.isSupportedLanguage(languageCode)) {
            revert InvalidLanguageCode();
        }
        Distribution memory distribution = Distribution(
            languageCode,
            androidId,
            block.timestamp,
            msg.sender
        );
        enqueue(distribution);
        emit DistributionAdded(queueNumberNext - 1, msg.sender);
    }

    function enqueue(Distribution memory sponsorship) private {
        queue[queueNumberNext] = sponsorship;
        queueNumberNext += 1;
    }

    function dequeue() public returns (Distribution memory) {
        require(msg.sender == queueHandler, "Only the queue handler can remove from the queue");
        require(getLength() > 0, "Queue is empty");
        Distribution memory distribution = queue[queueNumberFront];
        queueNumberFront += 1;
        return distribution;
    }

    function getLength() public view returns (uint256) {
        return queueNumberNext - queueNumberFront;
    }
}
