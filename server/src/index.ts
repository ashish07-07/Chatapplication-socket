import express from "express";
import path from "path";
import redisClient from "./redisclient/client";

import { v4 as uuidv4 } from "uuid";

import { Server } from "socket.io";
import http from "http";
import { randomUUID } from "crypto";

import { Socket } from "socket.io";
import { userInfo } from "os";
import router from "./routes/fileupload";
import { disconnect } from "process";
import user from "./routes/clientdetails";
import signuproute from "./routes/signup";
import signin from "./routes/signin";
import cors from "cors";

interface customsocket extends Socket {
  sessionID: string;
  userID: string;
}

const userdetails = new Map();
const app = express();

app.use(cors());

app.use(express.json());

console.log(path.join(__dirname, "..", "images"));
// const imagesDirectory = path.join(__dirname, "..", "..", "images");
const imagesDirectory = "D:/Chatapplication-socket/server/images";

// app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/images", express.static(imagesDirectory));
app.use("/images", express.static(path.join(__dirname, "..", "..", "images")));

app.use("/uploads", router);

app.use("/user", user);

app.use("/user", signuproute);

app.use("/user", signin);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const sessionStore = new Map();

interface CustomSocket extends Socket {
  sessionID: string;
  userID: string;
}

io.use((socket: Socket, next) => {
  const customSocket = socket as CustomSocket;
  const sessionID = customSocket.handshake.auth.sessionID;
  const name = customSocket.handshake.auth.name;

  if (sessionID && sessionStore.has(sessionID)) {
    const session = sessionStore.get(sessionID);
    customSocket.sessionID = sessionID;
    customSocket.userID = session.userID;
    return next();
  }

  // Only create a new session if the session ID is missing or invalid
  const newSessionID = uuidv4();
  customSocket.sessionID = newSessionID;
  customSocket.userID = uuidv4();
  sessionStore.set(customSocket.sessionID, {
    userID: customSocket.userID,
    customSocket,
  });

  customSocket.emit("session", {
    sessionID: customSocket.sessionID,
    userID: customSocket.userID,
  });

  next();
});

io.on("connection", async function (socket) {
  const customSocket = socket as CustomSocket;
  const existingre = socket.handshake.auth.sessionID;
  const ssid = socket.handshake.auth.sessionID;
  const name = socket.handshake.auth.name;
  const phonenumber = socket.handshake.auth.phonenumber;
  console.log(`name is ${name}`);
  console.log(`my phonenumber is ${phonenumber}`);

  if (!ssid) {
    console.error("Session ID is missing, cannot set value in Redis.");
    return;
  }

  const userDetailss = JSON.stringify({
    name: name,
    socketid: customSocket.id,
    phonenumber: phonenumber,
  });

  try {
    await redisClient.SET(ssid, userDetailss);

    console.log("stored in redis");
  } catch (e) {
    console.log(e);
  }

  console.log("a user connected");
  console.log(socket.id);

  socket.on("newusers", function (data) {
    console.log(data);
  });

  socket.on("message", function (data, isBinary) {
    console.log(` the message that ${socket.id} sent is ${data.messages}`);
  });

  // socket.emit("userdetails",)

  // userdetails.set("email",{username:name,socket:socket});

  console.log(`are ashih beta wts this re beta ${customSocket}`);
  userdetails.set(customSocket.id, socket);
  console.log(`user map details is ${userdetails}`);

  userdetails.forEach(function (val) {
    console.log("each socket id is ");
    console.log(val.id);
  });

  // userdetails.set(socket.id,{email:});

  socket.on("privatemessages", function ({ to, message }) {
    console.log("someone sent the messages");
    console.log(`messages is ${message}`);
    console.log(to);

    socket.on("disconnect", async function () {
      await redisClient.del(ssid);
    });

    const recipeentuser = userdetails.get(to);

    if (!recipeentuser) {
      console.log("not found a to user re ");
    }

    if (recipeentuser) {
      io.to(to).emit("privatemessages", {
        from: socket.id,
        message,
      });
    }
  });

  socket.on(
    "sendimages",
    function ({
      from,
      to,
      imageUrl,
    }: {
      from: string;
      to: string;
      imageUrl: string;
    }) {
      console.log(
        `recieved message from ${from} and the message is ${imageUrl}`
      );

      io.to(to).emit("sendimages", { imageUrl: imageUrl, from: from });
    }
  );
});

server.listen(3000, function () {
  console.log("server listening on port 30000");
});
