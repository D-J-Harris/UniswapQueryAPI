import { ethers } from "ethers";
import { ChainId } from "@uniswap/sdk";

class Factory {
    constructor(name) {
        this.networkName = name;
        switch (name) {
            case "homestead":
                this.factoryAddr = ethers.utils.getAddress("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
                this.router02Addr = ethers.utils.getAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
                this.chainId = ChainId.MAINNET;
                break;
            case "rinkeby":
                this.factoryAddr = ethers.utils.getAddress("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
                this.router02Addr = ethers.utils.getAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
                this.chainId = ChainId.RINKEBY;
                break;
            case "ropsten":
                this.factoryAddr = ethers.utils.getAddress("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
                this.router02Addr = ethers.utils.getAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
                this.chainId = ChainId.ROPSTEN;
                break;
            default:
                throw Error("Invalid factory name provided");
        }
    }
}

export default Factory;
