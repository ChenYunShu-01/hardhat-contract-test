/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-waffle');
require('solidity-coverage');

const INFURA_URL = 'https://rinkeby.infura.io/v3/73f0ab2741974136a696cf8e7672d385';
const PRIVATE_KEY = '9981f37b8896752ec4f7e528474e70eebff03e4b63ada919455dd2521bd3bb0a';

module.exports = {
  solidity: "0.8.9",
  mocha: {
    timeout: 400000,
  },
  networks: {
    hardhat:{
      accounts: {
        count: 500,
      }
    },
    rinkeby: {
      url: INFURA_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};
