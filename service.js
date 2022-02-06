import express from 'express';

import UniswapService from "./services/UniswapService.js";
import FeedWebsocket from "./feed/websocket.js"

var app = express();
const service = new UniswapService();
const port = 3000;
app.use(express.json());

const server = app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
});
FeedWebsocket(server);

app.get("/price/:asset1/:asset2", async (req, res, next) => {

    try {
        const asset1 = req.params.asset1;
        const asset2 = req.params.asset2;
        const [reserve0, reserve1] = await service.getPrice(asset1, asset2);
        res.send({
            [asset1]: reserve0, 
            [asset2]: reserve1
        });

    } catch (error) {
        return next(error)
    }
});

app.post("/trade", async (req, res, next) => {
    try {
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
