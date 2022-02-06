import express from 'express';

import UniswapService from "./services/UniswapService.js";
import FeedWebsocket from "./feed/websocket.js"
import Factory from './resources/factories.js';

var app = express();
const port = 3000;
app.use(express.json());

const server = app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
});
FeedWebsocket(server);

/**
 * GET REST endpoint - returns data for pool defined by factory
 */
app.get("/price/:factory/:asset0/:asset1", async (req, res, next) => {
    try {
        const factory = new Factory(req.params.factory);
        const service = new UniswapService(factory);
        const asset0 = req.params.asset0;
        const asset1 = req.params.asset1;
        const data = await service.getPrice(asset0, asset1);
        res.send(data);

    } catch (error) {
        return next(error)
    }
});

/**
 * POST REST endpoint = places a trade for specified asset path (Ropsten network only)
 */
app.post("/trade", async (req, res, next) => {
    try {
        const factory = new Factory("ropsten");
        const service = new UniswapService(factory);
        const path = req.body.path;
        const amountIn = req.body.amountIn;
        const slippage = req.body.slippage;
        const transactionReceipt = await service.trade(path[0], path[1], amountIn, slippage);
        res.send({
            "success": "true",
            "receipt": transactionReceipt
        });

    } catch (error) {
        return next(error)
    }
});
