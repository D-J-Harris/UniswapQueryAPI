import { Trade, TradeType, TokenAmount, Fetcher, Route, ChainId, Percent } from "@uniswap/sdk";
import { ethers } from "ethers";
import { token_attrs } from "../resources/constants.js"

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");
const IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");
const IUniswapV2ERC20 = require("@uniswap/v2-core/build/IUniswapV2ERC20.json");
const IUniswapV2Router02 = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");

class UniswapService {

    constructor(){
        const infuraProjectId = "4292f50a8b9d490593bca2eba40a8c4b";
        const privateKey = "0x64f7b5bd012958ddcb04089fe67195ad6fef399a4b71267844b34b5357d4da02";
        const signer = new ethers.Wallet(privateKey);
        this.chainId = ChainId.MAINNET;
        this.provider = new ethers.providers.getDefaultProvider({ name: 'homestead', chainId: this.chainId });
        this.account = signer.connect(this.provider);

        const factoryAddr = ethers.utils.getAddress("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
        this.router02Addr = ethers.utils.getAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
        this.factoryContract = new ethers.Contract(factoryAddr, IUniswapV2Factory.abi, this.account);
        this.router02Contract = new ethers.Contract(this.router02Addr, IUniswapV2Router02.abi, this.account);
    }

    toHex(amount) {
        return `0x${amount.raw.toString(16)}`;
    }

    async getPairContract(asset0, asset1) {
        const tokenAddr0 = ethers.utils.getAddress(token_attrs[asset0].address);
        const tokenAddr1 = ethers.utils.getAddress(token_attrs[asset1].address);
        const pairAddr = await this.factoryContract.getPair(tokenAddr0, tokenAddr1);
        return new ethers.Contract(pairAddr, IUniswapV2Pair.abi, this.account);
    }

    async getToken(asset) {
        const tokenAddr = ethers.utils.getAddress(token_attrs[asset].address);
        return await Fetcher.fetchTokenData(this.chainId, tokenAddr, this.provider);
    }

    async getPrice(asset0, asset1) {
        console.log(`Running getPrice() for ${asset0}/${asset1}`)

        const pairContract = await this.createPairContract(asset0, asset1);
        const reserves = await pairContract.getReserves();
        const reserve0 = ethers.utils.formatUnits(reserves.reserve0, token_attrs[asset0].decimals);
        const reserve1 = ethers.utils.formatUnits(reserves.reserve1, token_attrs[asset1].decimals)
        return [reserve0, reserve1];
    }

    async trade(asset0, asset1, amountIn, slippage) {
        console.log(`Running trade() for ${amountIn} ${asset0} to ${asset1}, with ${slippage} slippage`);
        const amount0In = ethers.utils.parseUnits(amountIn, token_attrs[asset0].decimals);
        
        const token0 = await this.getToken(asset0);
        const token1 = await this.getToken(asset1);

        const token0Contract = new ethers.Contract(token_attrs[asset0].address, IUniswapV2ERC20.abi, this.account);

        const pair = await Fetcher.fetchPairData(token0, token1, this.provider);
        const route = new Route([pair], token0);
        const trade = new Trade(route, new TokenAmount(token0, amount0In), TradeType.EXACT_INPUT);

        const slippageTolerance = new Percent(slippage, '100');
        const amount1Out = this.toHex(trade.minimumAmountOut(slippageTolerance));
        const path = [token0.address, token1.address];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20  // 20 minutes from the current Unix time
        const feeData = await this.provider.getFeeData();

        const txApprove = await token0Contract.approve(
            this.router02Contract.address,
            amount0In,
            {
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                gasLimit: 7000000
            }
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
            {
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                gasLimit: 7000000
            }
        );     
        const receipt = await tx.wait(); 
        console.log('Transaction receipt');
        console.log(receipt);
        return receipt;
    }
}

export default UniswapService;
