import hardhat from "hardhat";
const { ethers } = hardhat;
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  //
  // ✅ 1️⃣ Leer variables de entorno
  //
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const ownerKey = process.env.OWNER_PRIVATE_KEY;
  const user1Key = process.env.USER1_PRIVATE_KEY;
  const user2Key = process.env.USER2_PRIVATE_KEY;
  const tokenFarmAddress = process.env.TOKENFARM_ADDRESS;
  const lpTokenAddress = process.env.LPTOKEN_ADDRESS;
  const dappTokenAddress = process.env.DAPPTOKEN_ADDRESS;
  const FEE_PERCENTAGE = 500; // 5% fee
  const REWARD_PER_BLOCK = ethers.parseEther("1"); // 1 DAPP per block

  if (!rpcUrl || !ownerKey || !user1Key || !user2Key) {
    throw new Error("❌ Faltan claves privadas en .env");
  }
  if (!tokenFarmAddress || !lpTokenAddress || !dappTokenAddress) {
    throw new Error("❌ Faltan direcciones de contratos en .env");
  }

  //
  // ✅ 2️⃣ Crear provider y wallets
  //
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const owner = new ethers.Wallet(ownerKey, provider);
  const user1 = new ethers.Wallet(user1Key, provider);
  const user2 = new ethers.Wallet(user2Key, provider);

  console.log(`👑 Owner: ${owner.address}`);
  console.log(`👤 User1: ${user1.address}`);
  console.log(`👤 User2: ${user2.address}`);

  //
  // ✅ 3️⃣ Obtener contratos ya desplegados
  //
  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const LPToken = await ethers.getContractFactory("LPToken");
  const DAppToken = await ethers.getContractFactory("DAppToken");

  const tokenFarmOwner = TokenFarm.attach(tokenFarmAddress).connect(owner);
  const tokenFarmUser1 = TokenFarm.attach(tokenFarmAddress).connect(user1);
  const tokenFarmUser2 = TokenFarm.attach(tokenFarmAddress).connect(user2);

  const lpTokenOwner = LPToken.attach(lpTokenAddress).connect(owner);
  const lpTokenUser1 = LPToken.attach(lpTokenAddress).connect(user1);
  const lpTokenUser2 = LPToken.attach(lpTokenAddress).connect(user2);

  const dappTokenUser1 = DAppToken.attach(dappTokenAddress).connect(user1);
  const dappTokenUser2 = DAppToken.attach(dappTokenAddress).connect(user2);

  //
  // ✅ 4️⃣ OWNER: Configurar rewardPerBlock y feePercentage
  //
  console.log("\n👑 Owner configurando parámetros...");
  await (await tokenFarmOwner.setRewardPerBlock(REWARD_PER_BLOCK)).wait();
  await (await tokenFarmOwner.setFeePercentage(FEE_PERCENTAGE)).wait(); // 5% fee
  console.log("✅ Owner configuró rewardPerBlock y feePercentage.\n");

  //
  // ✅ 5️⃣ USERS: Ver balance LP inicial
  //
  let balanceUser1 = await lpTokenUser1.balanceOf(user1.address);
  let balanceUser2 = await lpTokenUser2.balanceOf(user2.address);

  console.log(`💰 User1 LP balance antes de transferir: ${ethers.formatEther(balanceUser1)} LP`);
  console.log(`💰 User2 LP balance antes de transferir: ${ethers.formatEther(balanceUser2)} LP`);

  //
  // ✅ 6️⃣ OWNER: Transferir LP tokens solo si faltan
  //
  const desiredUser1 = ethers.parseEther("100");
  const desiredUser2 = ethers.parseEther("50");

  if (balanceUser1 < desiredUser1) {
    const diff = desiredUser1 - balanceUser1;
    console.log(`\n👑 Owner transfiriendo ${ethers.formatEther(diff)} LP a User1...`);
    await (await lpTokenOwner.transfer(user1.address, diff)).wait();
  }

  if (balanceUser2 < desiredUser2) {
    const diff = desiredUser2 - balanceUser2;
    console.log(`\n👑 Owner transfiriendo ${ethers.formatEther(diff)} LP a User2...`);
    await (await lpTokenOwner.transfer(user2.address, diff)).wait();
  }

  //
  // ✅ 7️⃣ USERS: Ver balances post-transferencia
  //
  balanceUser1 = await lpTokenUser1.balanceOf(user1.address);
  balanceUser2 = await lpTokenUser2.balanceOf(user2.address);

  console.log(`💰 User1 LP balance después de transferir: ${ethers.formatEther(balanceUser1)} LP`);
  console.log(`💰 User2 LP balance después de transferir: ${ethers.formatEther(balanceUser2)} LP\n`);

  //
  // ✅ 8️⃣ USERS: Aprobar LP tokens al TokenFarm
  //
  console.log("✍️  Users aprobando LP tokens al TokenFarm...");
  await (await lpTokenUser1.approve(tokenFarmAddress, balanceUser1)).wait();
  await (await lpTokenUser2.approve(tokenFarmAddress, balanceUser2)).wait();
  console.log("✅ Approvals realizados.\n");

  //
  // ✅ 9️⃣ USERS: Depositar LP tokens en staking
  //
  console.log("✍️  Users depositando en staking...");
  await (await tokenFarmUser1.deposit(balanceUser1)).wait();
  await (await tokenFarmUser2.deposit(balanceUser2)).wait();
  console.log("✅ Depósitos completados.\n");

  //
  // ✅ 🔟 Ver balances de staking
  //
  const staker1 = await tokenFarmUser1.stakers(user1.address);
  const staker2 = await tokenFarmUser2.stakers(user2.address);

  console.log(`📈 User1 staking balance: ${ethers.formatEther(staker1.stakingBalance)} LP`);
  console.log(`📈 User2 staking balance: ${ethers.formatEther(staker2.stakingBalance)} LP\n`);

  //
  // ✅ 11️⃣ OWNER: Distribuir recompensas a todos los stakers
  //

  console.log("⏳ Esperando 15 segundos para el siguiente bloque en Sepolia...");
  await new Promise((resolve) => setTimeout(resolve, 15000));

  console.log("👑 Owner distribuyendo recompensas...");
  await (await tokenFarmOwner.distributeRewardsAll()).wait();
  console.log("✅ Recompensas distribuidas.\n");

  //
  // ✅ 12️⃣ USERS: Consultar recompensas pendientes
  //
  console.log("⏳ Esperando 15 segundos antes de claimRewards para el siguiente bloque en Sepolia...");
  await new Promise((resolve) => setTimeout(resolve, 15000));

  const pending1 = await tokenFarmUser1.getPendingRewards(user1.address);
  const pending2 = await tokenFarmUser2.getPendingRewards(user2.address);

  console.log(`🎁 User1 recompensas pendientes: ${ethers.formatEther(pending1)} DAPP`);
  console.log(`🎁 User2 recompensas pendientes: ${ethers.formatEther(pending2)} DAPP\n`);

  //
  // ✅ 13️⃣ USERS: Reclamar recompensas
  //
  console.log("✍️  Users reclamando recompensas...");
  await (await tokenFarmUser1.claimRewards()).wait();
  await (await tokenFarmUser2.claimRewards()).wait();
  console.log("✅ Recompensas reclamadas.\n");

  //
  // ✅ 14️⃣ Ver balances de DAPP
  //
  const dappBalanceUser1 = await dappTokenUser1.balanceOf(user1.address);
  const dappBalanceUser2 = await dappTokenUser2.balanceOf(user2.address);

  console.log(`💰 User1 DAPP balance: ${ethers.formatEther(dappBalanceUser1)} DAPP`);
  console.log(`💰 User2 DAPP balance: ${ethers.formatEther(dappBalanceUser2)} DAPP\n`);

  //
  // ✅ 15️⃣ USERS: Retirar staking
  //
  console.log("✍️  Users retirando staking...");
  await (await tokenFarmUser1.withdraw()).wait();
  await (await tokenFarmUser2.withdraw()).wait();
  console.log("✅ Retiros completados.\n");

  //
  // ✅ 16️⃣ Ver balances LP finales
  //
  console.log(`💰 User1 LP final: ${ethers.formatEther(await lpTokenUser1.balanceOf(user1.address))} LP`);
  console.log(`💰 User2 LP final: ${ethers.formatEther(await lpTokenUser2.balanceOf(user2.address))} LP\n`);

  //
  // ✅ 17️⃣ OWNER: Ver y retirar fees acumulados
  //
  const fees = await tokenFarmOwner.accumulatedFees();
  console.log(`🏦 Fees acumulados en el contrato: ${ethers.formatEther(fees)} DAPP`);

  if (fees > 0n) {
    console.log("👑 Owner retirando fees...");
    await (await tokenFarmOwner.withdrawAccumulatedFees(owner.address)).wait();
    console.log("✅ Fees retirados al owner.");
  }

  console.log("\n🎯 ✅ Interacción COMPLETA con TokenFarm en SEPOLIA!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
