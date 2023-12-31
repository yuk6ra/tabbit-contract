const { expect } = require("chai");
const { ethers } = require("hardhat");
const giftCardAccountContractABI = require('../contracts/abis/GiftCardAccount.json');

describe("ERC6551Registry", function () {
  let ERC6551Registry, GiftCardAccount, owner, addr1, addr2;
  let giftCardAccount, erc6551Registry;
  let tokenId, chainId, salt
  let deployedAccountTx, deployedAccountReceipt, deployedAccountAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    GiftCard = await ethers.getContractFactory("GiftCard");
    giftCard = await GiftCard.deploy();
    await giftCard.deployed();
    await giftCard.mint(addr1.address,"[INSERT THE IMAGE ADDRESS HERE]");
    tokenId = await giftCard.nextId();

    GiftCardAccount = await ethers.getContractFactory("GiftCardAccount");
    giftCardAccount = await GiftCardAccount.deploy();
    await giftCardAccount.deployed();

    ERC6551Registry = await ethers.getContractFactory("ERC6551Registry");
    erc6551Registry = await ERC6551Registry.deploy();
    await erc6551Registry.deployed();

    chainId = await owner.getChainId();
    salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

    deployedAccountTx = await erc6551Registry.createAccount(giftCardAccount.address, chainId, giftCard.address, tokenId, salt, "0x");
    deployedAccountReceipt = await deployedAccountTx.wait();

    expect(deployedAccountReceipt.events[0].event).to.equal('AccountCreated');
    deployedAccountAddress = deployedAccountReceipt.events[0].args[0];
  
    expect(await ethers.provider.getCode(deployedAccountAddress)).not.to.equal('0x');
  });

  describe("Account", function () {
    it("Should create an account successfully and with the right address", async function () {
      const predictedAccountAddress = await erc6551Registry.account(giftCardAccount.address, chainId, giftCard.address, tokenId, salt);
      expect(deployedAccountAddress).to.be.equal(predictedAccountAddress);
    });

    it("Should have the right owner", async function () {
      const mockGiftCardAccount = await ethers.getContractAt(giftCardAccountContractABI, deployedAccountAddress);
      expect(await mockGiftCardAccount.owner()).to.equal(addr1.address);
    });
  });

  describe("Gift Card", function () {
    let initialBalance, finalBalance, mockGiftCardAccount;

    beforeEach(async function () {
      mockGiftCardAccount = await ethers.getContractAt(giftCardAccountContractABI, deployedAccountAddress);
      expect(await mockGiftCardAccount.owner()).to.equal(addr1.address);

      // Get initial balance of the contract
      initialBalance = await ethers.provider.getBalance(deployedAccountAddress);
      expect(initialBalance).to.equal(0);

      // Send 1 ether to the contract from the owner account
      [owner] = await ethers.getSigners();
      await owner.sendTransaction({
          to: deployedAccountAddress,
          value: ethers.utils.parseEther("1.0")  // Send 1 Ether
      });
      finalBalance = await ethers.provider.getBalance(deployedAccountAddress);
    })
    it("Should load balance", async function () {
      // Get final balance and check that the contract received the ether
      expect(finalBalance).to.equal(initialBalance.add(ethers.utils.parseEther("1.0")));
    });

    it("Should mint & gift a giftcard", async function () {
      const tokenURI = "[INSERT THE IMAGE ADDRESS HERE]";
      let amount = ethers.utils.parseEther("1.0");
      // Mint a new gift card
      const mintTx = await giftCard.mint(addr1.address, tokenURI, {value: amount});
      const receipt = await mintTx.wait();
      const tokenId = receipt.events[0].args.tokenId;
      const tx = await giftCard.connect(addr1).setApprovalForAll(await giftCard.address, true);
      await tx.wait();
      // Gift the card
      await giftCard.connect(addr1).gift(addr2.address);
      expect(await giftCard.ownerOf(tokenId)).to.be.equal(addr2.address);
    });
  });
});
