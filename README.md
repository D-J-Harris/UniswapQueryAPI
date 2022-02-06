# API Service for Uniswap V2 Pools

## Description

This mock rest trading project provides three pieces of functionality for interacting with DEXs (decentralised exchanges) built on the Uniswap V2 protocol. Available DEXs and asset pairs are pre-defined

1) ``GET`` REST endpoint, for querying the price information of asset pair pools. When querying Ethereum mainnet, this additionally returns data queried from the [Uniswap subgraph](https://thegraph.com/hosted-service/subgraph/uniswap/uniswap-v2)
2) ``GET`` Websocket endpoint, for listening to SWAP, BURN and MINT events for a particular asset pair pool. This would return the same datapoints as observing the [Uniswap V2 explorer](https://v2.info.uniswap.org/pairs)
3) ``POST`` REST endpoint, for placing trades to swap between tokens in an available pool (only on Ropsten network)

### Supported Networks

- homestead (ethereum mainnet)
- ropsten (ethereum testnet)
- matic (polygon mainnet)
- can in theory include [these](https://docs.ethers.io/v5/api/providers/api-providers/#InfuraProvider) (supported through Infura)

### Supported Assets

- WETH
- DAI
- USDC

## How to Run

To run this project, you will need [Node and npm installed locally](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
From root of the project, run the following:
``npm install``
``node service.js``
The service will be available on localhost, port 3000

## How to Use

In all cases, functionality can be tested using [Postman](https://www.postman.com/)

### 1 - GET REST endpoint

``GET /price/:factory/:asset1/:asset2``

- factory - defined by supported networks
- asset1 / asset2 - defined by supported asset

#### Challenges

- The data available through the Uniswap V2 contracts for pairs does not give thorough insights into pricing - this could potentially be improved through gathering further data (execution/mid prices) from the [Trade Contract](https://docs.uniswap.org/sdk/2.0.0/reference/trade)
- The endpoint will return an error if the pool does not exist - especially for testnets, this can be common

### 2 - GET Websocket endpoint

``GET /fee?factory=&asset1=&asset2=``

- parameters defined same as GET REST endpoint, but passed in as query parameters rather than defining the path

#### Challenges

- The biggest challenge with this endpoint revolved around the idea of spinning up and managing multiple websocket servers for different endpoints on-demand. Since only one server can be listening on a particular port, I decided to have one server listening to requests, and manage dynamic "client pools" that would be notified by the ``ethers`` [Pair Contract](https://docs.uniswap.org/protocol/V2/reference/smart-contracts/pair)
- For some reason, [``ethers`` contract events](https://docs.ethers.io/v5/api/contract/contract/#Contract--events) would "remember" events in-between ``removeAllListeners`` and subsequent ``on`` hook creation, which is not something I was able to sort out. I'm hoping it's [with reason](https://github.com/ethers-io/ethers.js/issues/391)

### 3 - POST REST endpoint

``POST /trade``

The trade endpoint requires a JSON payload in the request, of the following format

```
{
    path: string[],    e.g. ["WETH", "USDC"]
    amountIn: string,  e.g. "0.5"
    slippage: number   e.g. 20
}
```

- path defines two supported assets, with the first being the asset whose tokens are being swapped into the second asset
- amountIn represents the token amount of the token being swapped (converted behind the scenes into lowest denomination e.g. 1 WETH = 10^18 wrapped wei)
- slippage is a number 0-100 that defines the slippage percentage the user tolerates when defining the minimum number of tokens received

#### Challenges

- The biggest challenge here regarded signing transactions - most crucially, approving tokens to be swapped (which is in itself a transaction). Ideally, a user should approve a "large" amount as being allowed to be swapped for a token contract address - however the approach taken here is to run an approval transaction for the exact amount being swapped. This leads to higher run times and gas fees, however runs no risk of failing a transaction (if number of tokens to swap is very high)
- Due to fees and not wanting to use real money, the endpoint was hardcoded to use the Ropsten test network (which the proejct wallet has funds for from a faucet)
- Ideally the server private key / Infura ID would be in a process environment variable etc., however I am fine in this instance of openly saving keys for a throwaway wallet
