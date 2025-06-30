import chai from "chai";
const { expect } = chai;

import hardhat from "hardhat";
const { ethers } = hardhat;


describe("TokenFarm", function () {
  let owner, user1, user2;
  let lpToken, dappToken, tokenFarm;
  const initialSupply = ethers.parseEther("10000");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Desplegar el contrato LPToken
    const LPToken = await ethers.getContractFactory("LPToken");
    lpToken = await LPToken.deploy(owner.address);
    await lpToken.waitForDeployment();

    // Desplegar el contrato DAppToken (temporalmente propiedad del owner)
    const DAppToken = await ethers.getContractFactory("DAppToken");
    dappToken = await DAppToken.deploy(owner.address);
    await dappToken.waitForDeployment();

    // Desplegar el contrato TokenFarm con las direcciones de DAppToken y LPToken
    const TokenFarm = await ethers.getContractFactory("TokenFarm");
    tokenFarm = await TokenFarm.deploy(dappToken.target, lpToken.target);
    await tokenFarm.waitForDeployment();

    // Transferir la propiedad de DAppToken al TokenFarm para que pueda mintear recompensas
    await dappToken.connect(owner).transferOwnership(tokenFarm.target);

    // Avanzar un bloque para confirmar las transacciones previas
    await network.provider.send("evm_mine");

    // Transferir tokens LP al user1 y al user2 para que tengan saldo suficiente para stakear
    await lpToken.connect(owner).transfer(user1.address, initialSupply);
    await lpToken.connect(owner).transfer(user2.address, initialSupply);

    // Aprobar al contrato TokenFarm para que pueda mover los tokens LP de user1
    await lpToken.connect(user1).approve(tokenFarm.target, initialSupply);

    // Aprobar al contrato TokenFarm para que pueda mover los tokens LP de user2
    await lpToken.connect(user2).approve(tokenFarm.target, initialSupply);
  });


  it("debería permitir al usuario depositar tokens LP", async function () {
    const depositAmount = ethers.parseEther("100");

    // Forzar un nuevo bloque antes del depósito
    await network.provider.send("evm_mine");

    await expect(tokenFarm.connect(user1).deposit(depositAmount))
      .to.emit(tokenFarm, "Deposit")
      .withArgs(user1.address, depositAmount);

    const staker = await tokenFarm.stakers(user1.address);
    expect(staker.stakingBalance).to.equal(depositAmount);

    expect(await lpToken.balanceOf(tokenFarm.target)).to.equal(depositAmount);
  });

  it("debería distribuir recompensas y permitir que el usuario las reclame", async function () {
    const depositAmount = ethers.parseEther("100");
    const depositAmount2 = ethers.parseEther("50");

    // Forzar un nuevo bloque antes del depósito de user1
    await network.provider.send("evm_mine");
    await tokenFarm.connect(user1).deposit(depositAmount);

    // Forzar un nuevo bloque antes del depósito de user2
    await network.provider.send("evm_mine");
    await tokenFarm.connect(user2).deposit(depositAmount2);

    // Avanzar varios bloques para simular tiempo de staking y generar checkpoints
    await network.provider.send("evm_mine");
    await network.provider.send("evm_mine");
    await network.provider.send("evm_mine");

    // El owner distribuye las recompensas a todos los stakers
    await tokenFarm.connect(owner).distributeRewardsAll();

    // Avanzar un bloque antes de consultar las recompensas pendientes
    await network.provider.send("evm_mine");

    // Consultar cuántas recompensas pendientes tiene user1
    const pending = await tokenFarm.getPendingRewards(user1.address);
    expect(pending).to.be.gt(0);

    // El usuario reclama sus recompensas
    await expect(tokenFarm.connect(user1).claimRewards())
      .to.emit(tokenFarm, "RewardsClaimed");

    // Verificar que el usuario haya recibido al menos la cantidad de tokens DAPP calculada previamente
    const userBalance = await dappToken.balanceOf(user1.address);
    expect(userBalance).to.be.gte(pending);
  });

  it("debería permitir al usuario retirar su balance en staking", async function () {
    const depositAmount = ethers.parseEther("100");

    // Forzar un nuevo bloque antes del depósito
    await network.provider.send("evm_mine");
    await tokenFarm.connect(user1).deposit(depositAmount);

    // Avanzar bloques para acumular recompensas
    await network.provider.send("evm_mine");
    await network.provider.send("evm_mine");

    // El owner distribuye recompensas
    await tokenFarm.connect(owner).distributeRewardsAll();

    // Forzar un bloque antes de retirar
    await network.provider.send("evm_mine");

    // Retiro
    await expect(tokenFarm.connect(user1).withdraw())
      .to.emit(tokenFarm, "Withdraw")
      .withArgs(user1.address, depositAmount);

    // Verificar que el balance en staking sea cero
    const staker = await tokenFarm.stakers(user1.address);
    expect(staker.stakingBalance).to.equal(0);

    // Tokens LP devueltos al usuario
    expect(await lpToken.balanceOf(user1.address)).to.equal(initialSupply);
  });
});
