// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

abstract contract ProtocolVersion {
    function protocolVersion() public pure returns (string memory) {
        return "0.9.8";
    }
}
