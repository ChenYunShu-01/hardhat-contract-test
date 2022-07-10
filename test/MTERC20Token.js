const {expect} = require('chai');
const { ethers } = require('hardhat');

describe('Token contract', ()=> {

    let Token, token, owner, addr1, addr2;

    beforeEach(async () => {
        Token = await hre.ethers.getContractFactory('MTERC20Token');
        token = await Token.deploy();
        await token.deployed();
        [owner, addr1, addr2, _] = await ethers.getSigners();
    });

    it('Should successfully deployed', async()=>{
        console.log("deploy success!")
    });

    describe('Deployment', () => {
        it('Should deploy with 1M of supply for the owner of the contract', async()=>{
            const balance = await token.balanceOf(owner.address);
            expect(ethers.utils.formatEther(balance) == 1000000);
        });
        it ('Should set the right owner', async() => {
            expect(await token.owner()).to.equal(owner.address);
        });
        it ('should assign the total supply of tokens to the owner', async() => {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(await token.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe('Transactions', () => {
        it('Should let you give another address the approval to transfer tokens', async ()=>{ 
            //change the default owner address to addr1
            await token.connect(addr1).approve(owner.address, "1000");
        });
        it('Should transfer tokens between accounts', async () => {
            await token.transfer(addr1.address, 50);
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);
            
            await token.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await token.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        // it('Should fail if sender doesnt have enough tokens', async () => {
        //     const initialOwnerBalance = await token.balanceOf(owner.address);
        //     console.log(initialOwnerBalance);

        //     await expect(
        //         token.connect(addr1)
        //         .transfer(owner.address, 1)
        //     )
        //     .to
        //     .be
        //     .revertedWith('Not enough tokens');

        //     expect(
        //         await token.balanceOf(owner.address)
        //     )
        //     .to
        //     .equal(initialOwnerBalance);
    
        // });

        it('Should update balance after transfers', async () => {
            const initialOwnerBalance = await token.balanceOf(owner.address);

            await token.transfer(addr1.address, 100);
            await token.transfer(addr2.address, 50);

            const finalOwnerBalance = await token.balanceOf(owner.address);
            expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            const addr2Balance = await token.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });
    });

    
});