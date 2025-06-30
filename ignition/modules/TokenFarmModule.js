import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import * as dotenv from "dotenv";
dotenv.config()

export default buildModule("TokenFarmModule", (m) => {
  const ownerAddress = process.env.OWNER_ADDRESS;

  if (!ownerAddress) {
    throw new Error("❌ Falta OWNER_ADDRESS en .env");
  }

  const lpToken = m.contract("LPToken", [ownerAddress]);
  const dappToken = m.contract("DAppToken", [ownerAddress]);
  const tokenFarm = m.contract("TokenFarm", [dappToken, lpToken]);
  
  m.call(dappToken, "transferOwnership", [tokenFarm]);

  return { lpToken, dappToken, tokenFarm };
});
