
/**
 * object tracking clients and invoking start/stop listen commands on Pair Contracts
 * when the Pool is initially filled / empty respectively
 */
class Pool {

    constructor(contract) {
        this.contract = contract;
        this.clients = new Set();
    }

    addClient(client) {
        if (this.clients.size == 0) {
            this.listenForEvents();
        }
        this.clients.add(client);
    }

    removeClient(client) {
        this.clients.delete(client);
        if (this.clients.size == 0) {
            this.stopListenForEvents();
        }
    }

    // hook a listener onto various Pair events and transmit to all listening clients
    listenForEvents() {
        console.log("Started listening for events");
        this.contract.on("Swap", (sender, amount0In, amount1In, amount0Out, amount1Out, to) => {
            console.log("Swap happened");
            this.clients.forEach(client => {
                client.send(JSON.stringify({
                    action: "Swap",
                    sender: sender,
                    amount0In: amount0In.toString(),
                    amount1In: amount1In.toString(),
                    amount0Out: amount0Out.toString(),
                    amount1Out: amount1Out.toString(),
                    to: to
                }));
            })
        })
        this.contract.on("Mint", (sender, amount0, amount1) => {
            console.log("Mint happened");
            this.clients.forEach(client => {
                client.send(JSON.stringify({
                    action: "Mint",
                    sender: sender,
                    amount0: amount0.toString(),
                    amount1: amount1.toString()
                }));
            })
        })
        this.contract.on("Burn", (sender, amount0, amount1, to) => {
            console.log("Burn happened");
            this.clients.forEach(client => {
                client.send(JSON.stringify({
                    action: "Burn",
                    sender: sender,
                    amount0: amount0.toString(),
                    amount1: amount1.toString(),
                    to: to
                }));
            })
        })
    }

    // pool is empty, remove all listeners on contract
    stopListenForEvents() {
        console.log("Stopped listening for events");
        this.contract.removeAllListeners();
    }
}

export default Pool;
