import PoolHelper from "./PoolHelper.js";
import UniswapService from "../services/UniswapService.js";

class PoolService {

    constructor(factory) {
        this.pools = new Map();
        this.uniswapService = new UniswapService(factory);
    }

    async addClientForPool(asset0, asset1, client) {
        console.log(`Adding client for pool ${asset0}/${asset1}`)
        const poolKey = this.getPoolKey(asset0, asset1);
        if (this.pools.has(poolKey)) {
            this.pools.get(poolKey).addClient(client);
        } else {
            const poolContract = await this.uniswapService.getPairContract(asset0, asset1);
            let poolHelper = new PoolHelper(poolContract);
            poolHelper.addClient(client);
            this.pools.set(poolKey, poolHelper);
        }
    }

    async removeClientForPool(asset0, asset1, client) {
        console.log(`Removing client for pool ${asset0}/${asset1} client`)
        const poolKey = this.getPoolKey(asset0, asset1);
        this.pools.get(poolKey).removeClient(client);
    }

    getPoolKey(asset0, asset1) {
        return this.uniswapService.factory.networkName + ((asset0.localeCompare(asset1) == -1)? `${asset0}/${asset1}`: `${asset1}/${asset0}`);
    }
}

export default PoolService;
