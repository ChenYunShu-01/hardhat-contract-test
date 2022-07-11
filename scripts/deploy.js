const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account: ${deployer.address}`);
    const balance = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);
    var Token = await ethers.getContractFactory('MTERC20Token');
    var token = await Token.deploy();
    console.log(`MTERC20Token address: ${token.address}`);

    var data = {
        address: token.address,
        abi: JSON.parse(token.interface.format('json'))
    };
    fs.writeFileSync('frontend/src/MTERC20Token.json', JSON.stringify(data));

    Token = await ethers.getContractFactory('MTERC721Token');
    token = await Token.deploy();
    console.log(`MTERC721Token address: ${token.address}`);

    data = {
        address: token.address,
        abi: JSON.parse(token.interface.format('json'))
    };
    fs.writeFileSync('frontend/src/MTERC721Token.json', JSON.stringify(data));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1)
    })