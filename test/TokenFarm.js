const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFarm", function () {
  let owner, user1, user2;
  let lpToken, dappToken, tokenFarm;
  const initialSupply = ethers.parseEther("10000");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock LPToken
    const LPToken = await ethers.getContractFactory("LPToken");
    lpToken = await LPToken.deploy(owner.address);
    await lpToken.waitForDeployment();

    // Deploy DAppToken
    const DAppToken = await ethers.getContractFactory("DAppToken");
    dappToken = await DAppToken.deploy(owner.address);
    await dappToken.waitForDeployment();

    // Deploy TokenFarm
    const TokenFarm = await ethers.getContractFactory("TokenFarm");
    tokenFarm = await TokenFarm.deploy(dappToken.target, lpToken.target);
    await tokenFarm.waitForDeployment();

    // Mint LP tokens to user1
    await lpToken.connect(owner).mint(user1.address, initialSupply);

    // Approve the farm to spend LP tokens
    await lpToken.connect(user1).approve(tokenFarm.target, initialSupply);
  });

  it("should allow user to deposit LP tokens", async function () {
    const depositAmount = ethers.parseEther("100");

    // Advance 1 block before deposit to avoid same-block checkpoint error
    await network.provider.send("evm_mine");

    await expect(tokenFarm.connect(user1).deposit(depositAmount))
      .to.emit(tokenFarm, "Deposit")
      .withArgs(user1.address, depositAmount);

    const staker = await tokenFarm.stakers(user1.address);
    expect(staker.stakingBalance).to.equal(depositAmount);

    expect(await lpToken.balanceOf(tokenFarm.target)).to.equal(depositAmount);
  });

  it("should distribute rewards and let user claim them", async function () {
    const depositAmount = ethers.parseEther("100");

    // Advance 1 block before deposit
    await network.provider.send("evm_mine");
    await tokenFarm.connect(user1).deposit(depositAmount);

    // Simulate passage of time (advance blocks)
    await network.provider.send("evm_mine");
    await network.provider.send("evm_mine");
    await network.provider.send("evm_mine");

    // Owner calls distributeRewardsAll
    await tokenFarm.connect(owner).distributeRewardsAll();

    // Check pending rewards
    const pending = await tokenFarm.getPendingRewards(user1.address);
    expect(pending).to.be.gt(0);

    // Advance 1 block before claiming (optional, good practice)
    await network.provider.send("evm_mine");

    // User claims rewards
    await expect(tokenFarm.connect(user1).claimRewards())
      .to.emit(tokenFarm, "RewardsClaimed")
      .withArgs(user1.address, pending);

    // User should now have DAPP tokens
    expect(await dappToken.balanceOf(user1.address)).to.be.gt(0);
  });

  it("should allow user to withdraw staking balance", async function () {
    const depositAmount = ethers.parseEther("100");

    // Advance 1 block before deposit
    await network.provider.send("evm_mine");
    await tokenFarm.connect(user1).deposit(depositAmount);

    // Advance blocks to accrue rewards
    await network.provider.send("evm_mine");
    await network.provider.send("evm_mine");
    await tokenFarm.connect(owner).distributeRewardsAll();

    // Advance 1 block before withdraw
    await network.provider.send("evm_mine");

    // Withdraw
    await expect(tokenFarm.connect(user1).withdraw())
      .to.emit(tokenFarm, "Withdraw")
      .withArgs(user1.address, depositAmount);

    // Check staking balance is zero
    const staker = await tokenFarm.stakers(user1.address);
    expect(staker.stakingBalance).to.equal(0);

    // LP tokens returned
    expect(await lpToken.balanceOf(user1.address)).to.equal(initialSupply);
  });
});
