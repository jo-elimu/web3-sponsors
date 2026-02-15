// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

interface IDistributionQueue {
    /// @notice Add a new distribution to the queue
    /// @param languageCode The language code of the installed software (e.g. "HIN" for Hindi)
    /// @param androidId The hexadecimal Android ID of the distributed device (e.g. "5b7c682a12ecbe2e")
    function addDistribution(string calldata languageCode, string calldata androidId) external;
}
