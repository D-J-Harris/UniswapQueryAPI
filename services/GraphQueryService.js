import { createClient } from "@urql/core";
import fetch from "node-fetch";

/**
 * service exposing methods for querying the ethereum mainnet Uniswap subgraph
 */
class GraphQueryService {

    constructor() {
        const APIURL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
        this.client = createClient({
            fetch: fetch,
            url: APIURL
        })
    }

    /**
     * 
     * @param {String} asset0Addr : asset address, defined through ethers.utils.getAddress
     * @param {String} asset1Addr : asset address, defined through ethers.utils.getAddress
     * @returns : JSON body response of a query for pair pool prices/volume, and token prices
     */
    async getPriceDataForPair(asset0Addr, asset1Addr) {
        const tokensQuery = `
        query {
            pairs (where: {token0: "${asset0Addr.toLowerCase()}", token1: "${asset1Addr.toLowerCase()}"}) {
                id
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
                token0Price
                token1Price
                reserveUSD
                volumeUSD
            }
        }`
        try {
            const result = await this.client.query(tokensQuery).toPromise();
            console.log(result.data);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    }
}

export default GraphQueryService;
