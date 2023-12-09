import { WebSocketServer } from "ws";

const wss = new WebSocketServer(
  {
    port: 5000,
  },
  () => console.log(`WS Server started on 5000`)
);

function privateMessage(message, from, to, wss) {
  wss.clients.forEach((client) => {
    if (client.id === to || client.id === from) {
      client.send(JSON.stringify(message));
    }
  });
}

wss.on("connection", function connection(ws) {
  ws.on("message", async function (message) {
    try {
      message = JSON.parse(message);

      ws.id = message.login

      console.log(message)

      switch (message.event) {
        case "private-connection":
          break;
        case "private-message":
          privateMessage(message, ws.id, message.to, wss);
          break;
      }
    } catch (error) {
      ws.close();
      throw new Error(error.message);
    }
  });
});