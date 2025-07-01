import "@nomicfoundation/hardhat-ignition";
import "@nomicfoundation/hardhat-toolbox";

const config = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
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