// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  GiftCard = await ethers.getContractFactory("GiftCard");
  console.log("@Gift1");
  giftCard = await GiftCard.deploy();
  console.log("@Gift11");
  await giftCard.deployed();
  console.log("@Gift2");
  GiftCardAccount = await ethers.getContractFactory("GiftCardAccount");
  giftCardAccount = await GiftCardAccount.deploy();
  await giftCardAccount.deployed();
  console.log("GiftCard contract deployed at:", giftCard.address);
  
  // If you user Astar, you must prepare the erc6551Registry contract
  // ERC6551Registry = await ethers.getContractFactory("ERC6551Registry");
  // erc6551Registry = await ERC6551Registry.deploy();
  // await erc6551Registry.deployed();
  // console.log("erc6551Registry contract deployed at:", erc6551Registry.address);

  const entrypoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
  const erc6551Registry = "0x02101dfB77FDE026414827Fdc604ddAF224F0921"
  TokenBoundAccount = await ethers.getContractFactory("TokenBoundAccount");
  tokenBoundAccount = await TokenBoundAccount.deploy(entrypoint, erc6551Registry);
  await tokenBoundAccount.deployed();
  console.log("tokenBoundAccount contract deployed at:", tokenBoundAccount.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
