// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import { ILanguages } from "@elimu-ai/dao-contracts/ILanguages.sol";

contract DummyLanguages is ILanguages {
    mapping(string => bool) private languageCodes;

    function addSupportedLanguage(string calldata languageCode) external {
        languageCodes[languageCode] = true;
    }

    function removeSupportedLanguage(string calldata languageCode) external {
        languageCodes[languageCode] = false;
    }

    function isSupportedLanguage(string calldata languageCode) external view returns (bool) {
        return languageCodes[languageCode];
    }
}
