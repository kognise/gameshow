import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

import { SerialPort } from "serialport";
const ports = await SerialPort.list()
const device = ports.find(device => device.vendorId === '2a03' && device.productId == '0042').path
const port = new SerialPort({ path: device, baudRate: 9600 });

// setInterval(() => {
//   port.write(Buffer.from([0x01]));
// }, 100);

port.on("data", (e) => {
  if (e[0] == 0x07) {
    io.emit("btn", 1);
  } else if (e[0] == 0x06) {
    io.emit("btn", 2);
  } else if (e[0] == 0x05) {
    io.emit("btn", 3);
  } else if (e[0] == 0x04) {
    io.emit("btn", 4);
  }
});

app.use(express.static("static"));

httpServer.listen(3000);