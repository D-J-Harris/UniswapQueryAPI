import { createClient } from "@urql/core";
import fetch from "node-fetch";

class GraphQueryService {

    constructor() {
        const APIURL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
        this.client = createClient({
            fetch: fetch,
            url: APIURL
        })
    }

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
            }
        }`
        console.log(tokensQuery);
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
