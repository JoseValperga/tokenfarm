const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenFarmModule", (m) => {
  const deployer = m.getAccount(0);

  // Deploy DAppToken
  const dappToken = m.contract("DAppToken", [deployer]);

  // Deploy LPToken
  const lpToken = m.contract("LPToken", [deployer]);

  // Deploy TokenFarm with addresses
  const tokenFarm = m.contract("TokenFarm", [dappToken, lpToken]);

  return { dappToken, lpToken, tokenFarm };
});
