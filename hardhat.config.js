import "@nomicfoundation/hardhat-ignition";
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from "dotenv";
dotenv.config();

const {
  SEPOLIA_RPC_URL,
  OWNER_PRIVATE_KEY,
  ETHERSCAN_API_KEY
} = process.env;

if (!SEPOLIA_RPC_URL || !OWNER_PRIVATE_KEY || !ETHERSCAN_API_KEY) {
  console.error(
    "❌ Variables de entorno faltantes. Define SEPOLIA_RPC_URL, OWNER_PRIVATE_KEY, ETHERSCAN_API_KEY."
  );
  process.exit(1);
}

const config = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [process.env.OWNER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: true,
    excludeContracts: [],
    src: "./contracts",
  },
};

export default config;