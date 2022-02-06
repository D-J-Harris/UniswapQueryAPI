import { createRequire } from "module";
const require = createRequire(import.meta.url);
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");
const IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");
const IUniswapV2ERC20 = require("@uniswap/v2-core/build/IUniswapV2ERC20.json");
const IUniswapV2Router02 = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");

export const token_attrs = {
    "DAI": {
        "decimals": 18,
        "homestead": "0x6b175474e89094c44da98b954eedeac495271d0f",
        "ropsten": "0xaD6D458402F60fD3Bd25163575031ACDce07538D",
        "matic": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
    },
    "USDC": {
        "decimals": 6,
        "homestead": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "ropsten": "0xfe724a829fdf12f7012365db98730eee33742ea2",
        "matic": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
    },
    "WETH": {
        "decimals": 18,
        "homestead": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "ropsten": "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        "matic": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
    }
}

export const keys = {
    "INFURA_ID": "4292f50a8b9d490593bca2eba40a8c4b",
    "PRIVATE_KEY": "0x64f7b5bd012958ddcb04089fe67195ad6fef399a4b71267844b34b5357d4da02"
}

export const abis = {
    IUniswapV2FactoryABI: IUniswapV2Factory.abi,
    IUniswapV2PairABI: IUniswapV2Pair.abi,
    IUniswapV2ERC20ABI: IUniswapV2ERC20.abi,
    IUniswapV2Router02ABI: IUniswapV2Router02.abi
}
