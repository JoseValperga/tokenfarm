import hardhat from "hardhat";
const { ethers } = hardhat;
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  //
  // ✅ 1️⃣ Leer direcciones de contratos desde .env
  //
  const tokenFarmAddress = process.env.TOKENFARM_ADDRESS;
  const lpTokenAddress = process.env.LPTOKEN_ADDRESS;
  const dappTokenAddress = process.env.DAPPTOKEN_ADDRESS;

  if (!tokenFarmAddress || !lpTokenAddress || !dappTokenAddress) {
    throw new Error("❌ Faltan direcciones de contratos en .env");
  }

  //
  // ✅ 2️⃣ Obtener signers locales
  //
  const [owner, user1, user2] = await ethers.getSigners();

  console.log(`👑 Owner: ${owner.address}`);
  console.log(`👤 User1: ${user1.address}`);
  console.log(`👤 User2: ${user2.address}`);

  //
  // ✅ 3️⃣ Conectar contratos
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
  await tokenFarmOwner.setRewardPerBlock(ethers.parseEther("1"));
  await tokenFarmOwner.setFeePercentage(500); // 5% fee
  console.log("✅ Owner configuró rewardPerBlock y feePercentage.\n");

  //
  // ✅ 5️⃣ Ver balances LP iniciales
  //
  console.log(`💰 LP Owner balance: ${ethers.formatEther(await lpTokenOwner.balanceOf(owner.address))} LP`);
  console.log(`💰 User1 LP balance: ${ethers.formatEther(await lpTokenUser1.balanceOf(user1.address))} LP`);
  console.log(`💰 User2 LP balance: ${ethers.formatEther(await lpTokenUser2.balanceOf(user2.address))} LP`);

  //
  // ✅ 6️⃣ Transferencia inicial de LP del owner a los users
  //
  console.log("\n👑 Owner transfiriendo LP tokens a User1 y User2...");
  await lpTokenOwner.transfer(user1.address, ethers.parseEther("100"));
  await lpTokenOwner.transfer(user2.address, ethers.parseEther("50"));
  console.log("✅ Transferencias realizadas.\n");

  //
  // ✅ 7️⃣ Ver balances LP después de transferir
  //
  console.log(`💰 User1 LP balance: ${ethers.formatEther(await lpTokenUser1.balanceOf(user1.address))} LP`);
  console.log(`💰 User2 LP balance: ${ethers.formatEther(await lpTokenUser2.balanceOf(user2.address))} LP`);

  //
  // ✅ 8️⃣ Aprobar LP tokens al TokenFarm
  //
  const depositAmountUser1 = ethers.parseEther("100");
  const depositAmountUser2 = ethers.parseEther("50");

  console.log("\n✍️  Users aprobando LP tokens al TokenFarm...");
  await lpTokenUser1.approve(tokenFarmAddress, depositAmountUser1);
  await lpTokenUser2.approve(tokenFarmAddress, depositAmountUser2);
  console.log("✅ Approvals realizados.\n");

  //
  // ✅ 9️⃣ Depositar LP tokens en staking
  //
  console.log("✍️  Users depositando en staking...");
  await tokenFarmUser1.deposit(depositAmountUser1);
  await tokenFarmUser2.deposit(depositAmountUser2);
  console.log("✅ Depósitos completados.\n");

  //
  // ✅ 🔟 Ver balances de staking
  //
  const staker1 = await tokenFarmUser1.stakers(user1.address);
  const staker2 = await tokenFarmUser2.stakers(user2.address);

  console.log(`📈 User1 staking balance: ${ethers.formatEther(staker1.stakingBalance)} LP`);
  console.log(`📈 User2 staking balance: ${ethers.formatEther(staker2.stakingBalance)} LP\n`);

  //
  // ✅ 11️⃣ OWNER: Distribuir recompensas
  //
  console.log("👑 Owner distribuyendo recompensas...");
  await tokenFarmOwner.distributeRewardsAll();
  console.log("✅ Recompensas distribuidas.\n");

  //
  // ✅ 12️⃣ Consultar recompensas pendientes
  //
  const pending1 = await tokenFarmUser1.getPendingRewards(user1.address);
  const pending2 = await tokenFarmUser2.getPendingRewards(user2.address);

  console.log(`🎁 User1 recompensas pendientes: ${ethers.formatEther(pending1)} DAPP`);
  console.log(`🎁 User2 recompensas pendientes: ${ethers.formatEther(pending2)} DAPP\n`);

  //
  // ✅ 13️⃣ Reclamar recompensas
  //
  console.log("✍️  Users reclamando recompensas...");
  await tokenFarmUser1.claimRewards();
  await tokenFarmUser2.claimRewards();
  console.log("✅ Recompensas reclamadas.\n");

  //
  // ✅ 14️⃣ Ver balances de DAPP
  //
  const dappBalanceUser1 = await dappTokenUser1.balanceOf(user1.address);
  const dappBalanceUser2 = await dappTokenUser2.balanceOf(user2.address);

  console.log(`💰 User1 DAPP balance: ${ethers.formatEther(dappBalanceUser1)} DAPP`);
  console.log(`💰 User2 DAPP balance: ${ethers.formatEther(dappBalanceUser2)} DAPP\n`);

  //
  // ✅ 15️⃣ Retirar staking
  //
  console.log("✍️  Users retirando staking...");
  await tokenFarmUser1.withdraw();
  await tokenFarmUser2.withdraw();
  console.log("✅ Retiros completados.\n");

  //
  // ✅ 16️⃣ Ver balances LP finales
  //
  console.log(`💰 User1 LP final: ${ethers.formatEther(await lpTokenUser1.balanceOf(user1.address))} LP`);
  console.log(`💰 User2 LP final: ${ethers.formatEther(await lpTokenUser2.balanceOf(user2.address))} LP\n`);

  //
  // ✅ 17️⃣ OWNER: Retirar fees acumulados
  //
  const fees = await tokenFarmOwner.accumulatedFees();
  console.log(`🏦 Fees acumulados en el contrato: ${ethers.formatEther(fees)} DAPP`);

  if (fees > 0n) {
    console.log("👑 Owner retirando fees...");
    await tokenFarmOwner.withdrawAccumulatedFees(owner.address);
    console.log("✅ Fees retirados al owner.");
  }

  console.log("\n🎯 ✅ Interacción COMPLETA con TokenFarm en LOCALHOST!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

