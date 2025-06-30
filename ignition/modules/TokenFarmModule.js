import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import * as dotenv from "dotenv";
dotenv.config()

export default buildModule("TokenFarmModule", (m) => {
  const ownerAddress = process.env.OWNER_ADDRESS;

  if (!ownerAddress) {
    throw new Error("❌ Falta OWNER_ADDRESS en .env");
  }

  // LPToken y DAppToken solo si sus constructores realmente reciben owner
  const lpToken = m.contract("LPToken", [ownerAddress]);
  const dappToken = m.contract("DAppToken", [ownerAddress]);

  // IMPORTANTÍSIMO: usar .future() para pasar direcciones al constructor
  const tokenFarm = m.contract("TokenFarm", [dappToken, lpToken]);

  // También aquí .future()
  m.call(dappToken, "transferOwnership", [tokenFarm]);

  return { lpToken, dappToken, tokenFarm };
});
