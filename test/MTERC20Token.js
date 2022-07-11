const {expect, util} = require('chai');
const { ethers } = require('hardhat');

describe('MTERC20Token contract', ()=> {

    let Token, token, owner, addr1, addr2;

    beforeEach(async () => {
        Token = await hre.ethers.getContractFactory('MTERC20Token');
        token = await Token.deploy();
        await token.deployed();
        [owner, addr1, addr2, _] = await ethers.getSigners();
        
    });

    it('Should successfully deployed', async()=>{
        console.log("deploy success!");
        console.log(owner.address);
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
            console.log(owner.address);
            console.log(addr1.address);
            await token.connect(addr1).approve(owner.address, ethers.utils.parseEther("1000"));
            //const a = await token.allowance(addr1.address, owner.address);
            // console.log(a);
            // const ownerBalance = await token.balanceOf(owner.address);
            // console.log(ownerBalance);
            await token.transfer(addr1.address, ethers.utils.parseEther('1000'));
            await token.transferFrom(addr1.address, addr2.address, ethers.utils.parseEther('1000'));
            expect(await token.balanceOf(addr2.address)).to.equal(ethers.utils.parseEther('1000'));
        });
        it('Should transfer tokens between accounts', async () => {
            await token.transfer(addr1.address, ethers.utils.parseEther('50'));
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(ethers.utils.parseEther('50'));
            
            await token.connect(addr1).transfer(addr2.address, ethers.utils.parseEther('50'));
            const addr2Balance = await token.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(ethers.utils.parseEther('50'));
        });

        it('Should fail if sender doesnt have enough tokens', async () => {
            const initialOwnerBalance = await token.balanceOf(owner.address);
            console.log(initialOwnerBalance);

            await expect(
                token.connect(addr1)
                .transfer(owner.address, ethers.utils.parseEther('1'))
            )
            .to
            .be
            .revertedWith('ERC20: transfer amount exceeds balance');

            expect(
                await token.balanceOf(owner.address)
            )
            .to
            .equal(initialOwnerBalance);
    
        });

        it('Should update balance after transfers', async () => {
            const initialOwnerBalance = await token.balanceOf(owner.address);
            console.log(initialOwnerBalance);

            await token.transfer(addr1.address, ethers.utils.parseEther('100'));
            await token.transfer(addr2.address, ethers.utils.parseEther('50'));

            const finalOwnerBalance = await token.balanceOf(owner.address);
            //use sub to avoid overflow
            expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(ethers.utils.parseEther('150')));

            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(ethers.utils.parseEther('100'));

            const addr2Balance = await token.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(ethers.utils.parseEther('50'));
        });

        it('Should emit transfer event', async ()=> {
            await expect(token.transfer(addr1.address, ethers.utils.parseEther('100')))
                .to.emit(token, 'Transfer')
                .withArgs(owner.address, addr1.address, ethers.utils.parseEther('100'));
        })

        it('Should emit Approval event', async ()=> {
            await expect(token.approve(addr1.address, ethers.utils.parseEther('100')))
                .to.emit(token, 'Approval')
                .withArgs(owner.address, addr1.address, ethers.utils.parseEther('100'));
        })
    });

    
});