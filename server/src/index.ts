import express from "express";
import path from "path";
import redisClient from "./redisclient/client";
import { Messagetemplate } from "./interfaces/interfaces";

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
import prisma from "./db";
import fileupload from "express-fileupload";
import imageupload from "./routes/imageupload";
import getallmessage from "./routes/getallmessage";

import { Particularmessage } from "./interfaces/interfaces";
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

app.use("/send", imageupload);

app.use("/get", getallmessage);

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
  const email = socket.handshake.auth.email;
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
    email: email,
  });

  const socketid = socket.id;

  try {
    await redisClient.SET(ssid, userDetailss);

    console.log("stored in redis");
  } catch (e) {
    console.log(e);
  }

  console.log("a user connected");
  console.log(socket.id);

  socket.broadcast.emit("shownewuser", "hello");

  socket.on("newusers", function (data) {
    console.log(data);
    console.log("are new user connected");
  });

  socket.on("message", function (data, isBinary) {
    console.log(` the message that ${socket.id} sent is ${data.messages}`);
  });

  console.log(`are ashih beta wts this re beta ${customSocket}`);
  userdetails.set(customSocket.id, socket);
  console.log(`user map details is ${userdetails}`);

  userdetails.forEach(function (val) {
    console.log("each socket id is ");
    console.log(val.id);
  });

  interface Messagetemplate {
    from: string;
    to: string;
    fromphonenumber: string;
    tophonenumber: string;
    message: string;
  }

  interface Sendiamgetemplate {
    from: string;
    to: string;
    fromphonenumber: string;
    tophonenumber: string;
    message: string;
    imageUrl: string;
  }
  socket.on(
    "privatemessages",
    async function ({
      from,
      to,
      fromphonenumber,
      tophonenumber,
      message,
    }: Messagetemplate) {
      console.log("someone sent the messages");
      const response = await prisma.message.create({
        data: {
          fromsocketid: from,
          tosocketid: to,
          fromphonenumber: fromphonenumber,
          tophonenumber: tophonenumber,
          message: message,
        },
      });

      const recipeentuser = userdetails.get(to);
      console.log(
        `the recipeient socked id is ${to} message is sent from ${from} and the message is ${message}`
      );

      if (!recipeentuser) {
        console.log("not found a to user re ");
        return;
      }

      if (recipeentuser) {
        io.to(to).emit("privatemessages", {
          from,
          to,
          fromphonenumber,
          tophonenumber,
          message,
        });
      }
    }
  );

  socket.on(
    "sendimages",
    async function ({
      from,
      to,
      fromphonenumber,
      tophonenumber,
      // message,
      imageUrl,
    }: Sendiamgetemplate) {
      console.log(
        `recieved message from ${from} and the image url is ${imageUrl}`
      );

      const response = await prisma.message.create({
        data: {
          fromsocketid: from,
          tosocketid: to,
          fromphonenumber: fromphonenumber,
          tophonenumber: tophonenumber,
          imageUrl: imageUrl,
        },
      });

      console.log(`updated the image url in database`);

      io.to(to).emit("sendimages", {
        from,
        to,
        fromphonenumber,
        tophonenumber,

        imageUrl,
      });
    }
  );

  socket.on("disconnect", async function () {
    await redisClient.del(ssid);
  });
});

server.listen(3000, function () {
  console.log("server listening on port 30000");
});
