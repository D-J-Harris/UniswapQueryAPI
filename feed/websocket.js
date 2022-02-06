import { WebSocketServer } from "ws";
import url from 'url';

import Pools from "./Pools.js"
import Factory from "../resources/factories.js";

/**
 * websocket server hooked into the Express server.
 * client on connection/close actions additionally update a PoolService, tracking clients listening
 * to pool updates for that factory/pool combination
 */
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
        client.send(JSON.stringify({message: `Connected to ${params.factory} with ${params.asset0}/${params.asset1}`}));

        const factory = new Factory(params.factory);
        const pools = new Pools(factory);
        pools.addClientForPool(params.asset0, params.asset1, client);

        client.on("close", () => {
            pools.removeClientForPool(params.asset0, params.asset1, client);
        });
    });

  return websocketServer;
};
