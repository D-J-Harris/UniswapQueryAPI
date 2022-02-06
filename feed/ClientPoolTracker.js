import Pool from "./Pool.js";
import UniswapService from "../services/UniswapService.js";

/**
 * class tracking Pool objects, which define client lists that listen to events for a particular pool.
 * constructed with a factory specific to the network, but with a static pools parameter for global pool tracking
 */
class ClientPoolTracker {

    static pools = new Map();

    constructor(factory) {
        this.uniswapService = new UniswapService(factory);
    }

    async addClientForPool(asset0, asset1, client) {
        console.log(`Adding client for pool ${asset0}/${asset1}`)
        const poolKey = this.getPoolKey(asset0, asset1);
        if (ClientPoolTracker.pools.has(poolKey)) {
            ClientPoolTracker.pools.get(poolKey).addClient(client);
        } else {
            try {
                const poolContract = await this.uniswapService.getPairContract(asset0, asset1);
                const pool = new Pool(poolContract);
                pool.addClient(client);
                ClientPoolTracker.pools.set(poolKey, pool);
            } catch (error) {
                client.terminate()
                throw Error(error);
            }
        }
    }

    async removeClientForPool(asset0, asset1, client) {
        console.log(`Removing client for pool ${asset0}/${asset1} client`)
        const poolKey = this.getPoolKey(asset0, asset1);
        ClientPoolTracker.pools.get(poolKey).removeClient(client);
    }

    getPoolKey(asset0, asset1) {
        return this.uniswapService.factory.networkName + ((asset0.localeCompare(asset1) == -1)? `${asset0}/${asset1}`: `${asset1}/${asset0}`);
    }
}

export default ClientPoolTracker;
