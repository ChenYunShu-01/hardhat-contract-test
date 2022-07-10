pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MTERC20Token is ERC20, Ownable{
    constructor() ERC20('MTERC20Token', 'MTT') Ownable() {
        _mint(msg.sender, 1000000);
    }

}