import { WebSocketServer } from "ws";
import url from 'url';

import UniswapService from "../services/UniswapService.js";
import PoolService from "./PoolService.js"

export default (expressServer) => {
    const websocketServer = new WebSocketServer({
        noServer: true,
        path: "/feed",
    });

    const uniswapService = new UniswapService();
    const poolService = new PoolService();

    expressServer.on("upgrade", (request, socket, head) => {
        websocketServer.handleUpgrade(request, socket, head, (websocket) => {
        websocketServer.emit("connection", websocket, request);
        });
    });

    websocketServer.on("connection", (client, req) => {
        const params = url.parse(req.url, true).query;

        client.send(JSON.stringify({message: `Connected with ${params.asset0}/${params.asset1}`}));
        poolService.addClientForPool(params.asset0, params.asset1, client);

        client.on("close", () => {
            poolService.removeClientForPool(params.asset0, params.asset1, client);
        });
    });

  return websocketServer;
};
