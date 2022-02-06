import { WebSocketServer } from "ws";
import url from 'url';

import PoolService from "./PoolService.js"
import Factory from "../resources/factories.js";

export default (expressServer) => {
    const websocketServer = new WebSocketServer({
        noServer: true,
        path: "/feed",
    });

    expressServer.on("upgrade", (request, socket, head) => {
        websocketServer.handleUpgrade(request, socket, head, (websocket) => {
        websocketServer.emit("connection", websocket, request);
        });
    });

    websocketServer.on("connection", (client, req) => {
        const params = url.parse(req.url, true).query;
        client.send(JSON.stringify({message: `Connected with ${params.asset0}/${params.asset1}`}));

        const factory = new Factory(params.factory);
        const poolService = new PoolService(factory);
        poolService.addClientForPool(params.asset0, params.asset1, client);

        client.on("close", () => {
            poolService.removeClientForPool(params.asset0, params.asset1, client);
        });
    });

  return websocketServer;
};
