const {expect, util} = require('chai');
const { ethers } = require('hardhat');

describe('MTERC721Token contract', ()=> {

    let Token, token, owner, addr1, addr2, addr3;

    beforeEach(async () => {
        Token = await hre.ethers.getContractFactory('MTERC721Token');
        token = await Token.deploy();
        await token.deployed();
        [owner, addr1, addr2, addr3, _] = await ethers.getSigners();
        
    });

    it('Should successfully deployed', async()=>{
        console.log("deploy success!");
        console.log(owner.address);
    });

    describe('Deployment', async () => {
        it ('Should set the right owner', async() => {
            expect(await token.owner()).to.equal(owner.address);
        });
    });

    describe('setIsAllowListActive', ()=> {
        it('Should be reverted because the caller is not owner', async ()=> {
            await expect(
                token.connect(addr1).setIsAllowListActive(true)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        });
        it('Should set isAllowListActive by owner', async ()=> {
            const expectValue = true;
            await token.connect(owner).setIsAllowListActive(expectValue);
            expect(await token.isAllowListActive()).to.equal(expectValue);
        })
    });

    //THIS IS NOT WORKING SINCE _allowList IS PRIVATE
    // describe.only('setAllowList', ()=> {
    //     it('Should be reverted because the caller is not owner', async ()=> {
    //         await expect(
    //             token.connect(addr1).setAllowList(addr1.address, 10)
    //         ).to.be.revertedWith('caller is not the owner');
    //     });
    //     it('Should should set allowList by owner', async ()=>{
    //         const expectValue = 10;
    //         await token.connect(owner)
    //         .setAllowList([addr1.address, addr2.address], expectValue);
    //         expect(
    //             await token.connect(owner)._allowList(addr1.address),
    //         ).to.equal(expectValue);
    //         expect(
    //             await token.connect(owner)._allowList(addr2.address),
    //         ).to.equal(expectValue);
    //     });
    // })

    describe.only('setAllowList', ()=> {
        it('Should be reverted because the caller is not owner', async ()=> {
            await expect(
                token.connect(addr1).setAllowList([addr1.address], 10)
            ).to.be.revertedWith('caller is not the owner');
        });
        it('Should should set allowList by owner', async ()=>{
            const expectValue = 10;
            await token.connect(owner)
            .setAllowList([addr1.address, addr2.address], expectValue);
            expect(
                await token.numAvailableToMint(addr1.address),
            ).to.equal(expectValue);
            expect(
                await token.numAvailableToMint(addr2.address),
            ).to.equal(expectValue);
        });
    })

    it('Should should set _allowList by owner', async ()=> {
        await token.connect(owner).setIsAllowListActive(true)
        const overrides = {
            value: ethers.utils.parseEther('0.1231')
        }
        await expect(
            token.connect(addr1).mintAllowList(1, overrides)
        ).to.be.revertedWith('Exceeded max available to purchase');
        await token.connect(owner).setAllowList([addr1.address], 1);
        await token.connect(addr1).mintAllowList(1, overrides);

        expect(await token.ownerOf(0)).to.equal(addr1.address);
        await expect(token.ownerOf(1)).to.be.revertedWith('ERC721: invalid token ID');
    });

    describe.only('numAvailableToMint', () => {
        it('Should view numAvailableToMint', async ()=> {
            const expectValue = 5;
            await token.connect(owner)
            .setAllowList([addr1.address, addr2.address], expectValue);
            expect(await token.numAvailableToMint(addr1.address)).to.equal(expectValue);
            expect(await token.numAvailableToMint(addr2.address)).to.equal(expectValue);
            expect(await token.numAvailableToMint(addr3.address)).to.equal(0);
        });
    });

    
});