import { Trade, TradeType, TokenAmount, Fetcher, Route, ChainId, Percent } from "@uniswap/sdk";
import { ethers } from "ethers";
import { token_attrs, keys } from "../resources/constants.js"
import GraphQueryService from "./GraphQueryService.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");
const IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");
const IUniswapV2ERC20 = require("@uniswap/v2-core/build/IUniswapV2ERC20.json");
const IUniswapV2Router02 = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");

class UniswapService {

    constructor(factory){
        this.factory = factory;

        const signer = new ethers.Wallet(keys.PRIVATE_KEY);
        this.provider = new ethers.providers.InfuraProvider(factory.networkName, keys.INFURA_ID);
        this.account = signer.connect(this.provider);

        this.factoryContract = new ethers.Contract(factory.factoryAddr, IUniswapV2Factory.abi, this.account);
        this.router02Contract = new ethers.Contract(factory.router02Addr, IUniswapV2Router02.abi, this.account);
        this.graphQueryService = new GraphQueryService();
    }

    toHex(amount) {
        return `0x${amount.raw.toString(16)}`;
    }

    getTokenAddress(asset) {
        try {
            return ethers.utils.getAddress(token_attrs[asset][this.factory.networkName]);
        } catch (error) {
            throw Error(`Could not get token address for ${asset} on network ${this.factory.networkName}: ` + error);
        }
    }

    async getToken(asset) {
        const tokenAddr = this.getTokenAddress(asset)
        return await Fetcher.fetchTokenData(this.factory.chainId, tokenAddr, this.provider);
    }

    async getPair(asset0, asset1) {
        const token0 = await this.getToken(asset0);
        const token1 = await this.getToken(asset1);
        try {
            return await Fetcher.fetchPairData(token0, token1, this.provider);
        } catch (error) {
            throw Error(`Could not get pair data for ${asset0}/${asset1} - perhaps no pool exists: ` + error);
        }
    }

    async getPairContract(asset0, asset1) {
        const token0 = await this.getToken(asset0);
        const token1 = await this.getToken(asset1);
        const pairAddr = await this.factoryContract.getPair(token0.address, token1.address);
        return new ethers.Contract(pairAddr, IUniswapV2Pair.abi, this.account);
    }

    /**
     * 
     * @param {String} asset0 : string representation of asset e.g. WETH
     * @param {String} asset1 : string representation of asset e.g. USDC
     * @returns : [always] basic pair data from Uniswap SDK; [mainnet] data queried from Uniswap subgraph
     */
    async getPrice(asset0, asset1) {
        console.log(`Running getPrice() for ${asset0}/${asset1} on network ${this.factory.networkName}`)

        const pair = await this.getPair(asset0, asset1);
        const basicData = {
            reserve0: pair.reserve0,
            reserve1: pair.reserve1
        }

        const data = await this.graphQueryService.getPriceDataForPair(pair.token0.address, pair.token1.address);
        return {
            basicData: basicData,
            subgraphData: (this.factory.networkName == "homestead")? data : "not mainnet"
        };
    }

    /**
     * 
     * @param {*} asset0 : string representation of asset e.g. WETH
     * @param {*} asset1 : string representation of asset e.g. USDC
     * @param {*} amountIn : exact amount (in tokens) of asset0 to be swapped for asset1
     * @param {*} slippage : slippage percentage (whole number 0-100) used to calculate minimumAmountOut
     * @returns : transaction receipt of trade
     */
    async trade(asset0, asset1, amountIn, slippage) {
        if (slippage > 100 || slippage < 0) throw Error("slippage must be in range 0-100");
        console.log(`Running trade() for ${amountIn} ${asset0} to ${asset1}, with ${slippage} slippage (on network ${this.factory.networkName})`);
        const amount0In = ethers.utils.parseUnits(amountIn, token_attrs[asset0].decimals);
        
        const token0 = await this.getToken(asset0);
        const token1 = await this.getToken(asset1);
        const token0Contract = new ethers.Contract(token0.address, IUniswapV2ERC20.abi, this.account);

        const pair = await this.getPair(asset0, asset1);
        const route = new Route([pair], token0);
        const trade = new Trade(route, new TokenAmount(token0, amount0In), TradeType.EXACT_INPUT);

        const slippageTolerance = new Percent(slippage, '100');
        const amount1Out = this.toHex(trade.minimumAmountOut(slippageTolerance));
        const path = [token0.address, token1.address];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20  // 20 minutes from the current Unix time
        const feeData = await this.provider.getFeeData();
        const fees = {
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            gasLimit: 7000000
        };

        const txApprove = await token0Contract.approve(
            this.router02Contract.address,
            amount0In,
            fees
        );
        const receiptApprove = await txApprove.wait(); 
        console.log('Transaction receipt');
        console.log(receiptApprove);

        const tx = await this.router02Contract.swapExactTokensForTokens(
            amount0In,
            amount1Out,
            path,
            "0x3B97C814eF9328F9a79085944AC2F7a24b2A2267",
            deadline,
            fees
        );     
        const receipt = await tx.wait(); 
        console.log('Transaction receipt');
        console.log(receipt);
        return receipt;
    }
}

export default UniswapService;
