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
            case "ropsten":
                this.factoryAddr = ethers.utils.getAddress("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
                this.router02Addr = ethers.utils.getAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
                this.chainId = ChainId.ROPSTEN;
                break;
            case "matic":
                this.factoryAddr = ethers.utils.getAddress("0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32");
                this.router02Addr = ethers.utils.getAddress("0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff");
                this.chainId = 137;
                break;
            default:
                throw Error("Invalid factory name provided");
        }
    }
}

export default Factory;
