const {expect, util} = require('chai');
const { ethers } = require('hardhat');

describe('MTERC721Token contract', ()=> {

    let Token, token, owner, addr1, addr2, addr3, addrs;

    beforeEach(async () => {
        Token = await hre.ethers.getContractFactory('MTERC721Token');
        token = await Token.deploy();
        await token.deployed();
        [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
        
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

    describe('setAllowList', ()=> {
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
    });

    it('Should should set _allowList by owner', async ()=> {
        await token.connect(owner).setIsAllowListActive(true)
        const overrides = {
            value: ethers.utils.parseEther('0.123')
        }
        await expect(
            token.connect(addr1).mintAllowList(1, overrides)
        ).to.be.revertedWith('Exceeded max available to purchase');
        await token.connect(owner).setAllowList([addr1.address], 1);
        await token.connect(addr1).mintAllowList(1, overrides);

        expect(await token.ownerOf(0)).to.equal(addr1.address);
        await expect(token.ownerOf(1)).to.be.revertedWith('ERC721: invalid token ID');
    });

    describe('numAvailableToMint', () => {
        it('Should view numAvailableToMint', async ()=> {
            const expectValue = 5;
            await token.connect(owner)
            .setAllowList([addr1.address, addr2.address], expectValue);
            expect(await token.numAvailableToMint(addr1.address)).to.equal(expectValue);
            expect(await token.numAvailableToMint(addr2.address)).to.equal(expectValue);
            expect(await token.numAvailableToMint(addr3.address)).to.equal(0);
        });
    });

    describe('mintAllowList', () => {
        it('Should be reverted because the isAllowListActive is false', async ()=> {
            const overrides = {
                value: ethers.utils.parseEther('0.123')
            }
            await token.connect(owner).setAllowList([addr1.address], 1)
            await expect(
                token.connect(addr1).mintAllowList(1, overrides)
            ).to.be.revertedWith('Allow list is not active');
        });

        //spend long time as mint max_supply tokens
        it('Should be reverted because exceeded max available to purchase', async ()=> {
            await token.connect(owner).setIsAllowListActive(true);
            const overrides = {
                value: ethers.utils.parseEther('24.6')
            }
            for(let i = 0; i < 50; i++){
                await token.connect(owner).setAllowList([addrs[i].address], 200)
                await token.connect(addrs[i]).mintAllowList(200, overrides);
            }
            await token.connect(owner).setAllowList([addrs[50].address], 200)
            await expect(
                token.connect(addrs[50]).mintAllowList(1, overrides)
            ).to.be.revertedWith('Purchase would exceed max tokens');
        });
        
        it('Should be reverted because the caller do not have enough fund', async ()=> {
            await token.connect(owner).setIsAllowListActive(true);
            const overrides = {
                value: ethers.utils.parseEther('0.122')
            }
            await token.connect(owner).setAllowList([addr1.address], 1)
            await expect(
                token.connect(addr1).mintAllowList(1, overrides)
            ).to.be.revertedWith('Ether value sent is not correct');
        });

        it('Should mint token', async ()=> {
            const baseUri = 'ipfs://test.url';
            token.connect(owner).setBaseURI(baseUri);
            await token.connect(owner).setIsAllowListActive(true);
            const overrides = {
                value: ethers.utils.parseEther('0.123')
            }
            await token.connect(owner).setAllowList([addr1.address], 1);
            await token.connect(addr1).mintAllowList(1, overrides);
            
            expect(await token.tokenURI(0)).to.equal(baseUri + '0');
            expect(await token.ownerOf(0)).to.equal(addr1.address);

        });      
    });

    describe('setProvenance', () => {
        it('Should be reverted because the caller is not owner', async ()=> {
            await expect(
                token.connect(addr1).setProvenance('random hash')
            ).to.be.revertedWith('caller is not the owner');
        });
        it('Should should set PROVENANCE by owner', async ()=> {
            const expectValue = 'random hash';
            await token.connect(owner).setProvenance(expectValue);
            expect(await token.PROVENANCE()).to.equal(expectValue);
        })
    });

    describe('reserve', () => {
        it('Should be reverted because the caller is not owner', async ()=> {
            await expect(
                token.connect(addr1).reserve(1)
            ).to.be.revertedWith('caller is not the owner');
        });
        it('Should reserve tokens by owner', async ()=> {
            const baseUri = 'ipfs://test.url/';
            token.connect(owner).setBaseURI(baseUri);
            await token.connect(owner).reserve(5);
            for(let i =0; i < 5; i++){
                expect(await token.tokenURI(i)).to.equal(baseUri + i);
                expect(await token.ownerOf(i)).to.equal(owner.address);
            }
        })
    });

    describe('setSaleState', () => {
        it('Should be reverted because the caller is not owner', async ()=> {
            await expect(
                token.connect(addr1).setSaleState(true)
            ).to.be.revertedWith('caller is not the owner');
        });
        it('Should should set saleIsActive by owner', async ()=> {
            const expectValue = true;
            await token.connect(owner).setSaleState(expectValue);
            expect(await token.saleIsActive()).to.equal(expectValue);
        })
    });

    describe('mint', () => {
        it('Should be reverted because the saleIsActive is false', async ()=> {
            await token.connect(owner).setSaleState(false);
            const overrides = {
                value: ethers.utils.parseEther('0.123')
            }
            await expect(
                token.connect(addr1).mint(1, overrides)
            ).to.be.revertedWith('Sale must be active to mint tokens');
        });

         //spend long time as mint max_supply tokens
         it('Should be reverted because exceeded max token', async ()=> {
            await token.connect(owner).setSaleState(true);
            const overrides = {
                value: ethers.utils.parseEther('0.615')
            }
            // 5 token each time * 2000 = 10000
            for(let i = 0; i < 2000; i++){
                await token.connect(addr1).mint(5, overrides);
            }
            await expect(
                token.connect(addr1).mint(1, overrides)
            ).to.be.revertedWith('Purchase would exceed max tokens');
        });
        
        it('Should be reverted because the caller do not have enough fund', async ()=> {
            await token.connect(owner).setSaleState(true);
            const overrides = {
                value: ethers.utils.parseEther('0.122')
            }
            await token.connect(owner).setAllowList([addr1.address], 1)
            await expect(
                token.connect(addr1).mint(1, overrides)
            ).to.be.revertedWith('Ether value sent is not correct');
        });

        it('Should mint token', async ()=> {
            const baseUri = 'ipfs://test.url';
            token.connect(owner).setBaseURI(baseUri);
            await token.connect(owner).setSaleState(true);
            const overrides = {
                value: ethers.utils.parseEther('0.123')
            }
            await token.connect(addr1).mint(1, overrides);
            
            expect(await token.tokenURI(0)).to.equal(baseUri + '0');
            expect(await token.ownerOf(0)).to.equal(addr1.address);

        });      
    });

    describe('withdraw', ()=> {
        it('Should be reverted because the caller is not owner', async ()=>{
            await expect(
                token.connect(addr1).withdraw()
            ).to.be.revertedWith('caller is not the owner');
        });
        it('Should withdraw fund by the owner', async ()=> {
            await token.connect(owner).setSaleState(true);
            const overrides = {
                value: ethers.utils.parseEther('5')
            }
            await token.connect(addr1).mint(1, overrides);
            const accountBalanceBeforeWithdraw = ethers.utils.formatEther(
                await token.provider.getBalance(owner.address)
            )
            await token.connect(owner).withdraw();
            const accountBalanceAfterWithdraw = ethers.utils.formatEther(
                await token.provider.getBalance(owner.address)
            )
            expect(
                parseInt(accountBalanceAfterWithdraw) > parseInt(accountBalanceBeforeWithdraw)
            ).to.be.true;
        });
    });
});