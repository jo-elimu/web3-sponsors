import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const privateKeys = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.33",
    settings: {
      optimizer: {
        enabled: true
      }
    }
  },
  gasReporter: {
    enabled: true,
    outputFile: "hardhat-gas-report.md"
  },
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: privateKeys
    },
    mainnet: {
      url: "https://ethereum-rpc.publicnode.com",
      accounts: privateKeys
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  sourcify: {
    enabled: true
  }
};

export default config;
