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

interface customsocket extends Socket {
  sessionID: string;
  userID: string;
}

const userdetails = new Map();
const app = express();

app.use(express.json());

console.log(path.join(__dirname, "..", "images"));
// const imagesDirectory = path.join(__dirname, "..", "..", "images");
const imagesDirectory = "D:/Chatapplication-socket/server/images";

// app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/images", express.static(imagesDirectory));
app.use("/images", express.static(path.join(__dirname, "..", "..", "images")));

app.use("/uploads", router);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const sessionStore = new Map();

interface CustomSocket extends Socket {
  sessionID: string;
  userID: string;
}

// io.use((socket: Socket, next) => {
//   const customSocket = socket as CustomSocket;

//   const sessionID = customSocket.handshake.auth.sessionID;

//   const emailid = customSocket.handshake.auth.email;

//   const name = customSocket.handshake.auth.name;

//   console.log("custom handshake auth details noodu");

//   console.log(customSocket.handshake.auth);
//   if (sessionID) {
//     const session = sessionStore.get(sessionID);

//     if (session) {
//       console.log("id ede marre ");
//       console.log("session id exists");

//       customSocket.sessionID = sessionID;
//       customSocket.userID = session.userID;

//       // socket.emit("idexist", { socket: socket, id: socket.id });

//       return next();
//     }
//   }

//   console.log("session id does not exist");
//   const newSessionID = uuidv4();
//   customSocket.sessionID = newSessionID;
//   customSocket.userID = uuidv4();
//   console.log(sessionID);
//   console.log(customSocket.userID);
//   sessionStore.set(customSocket.sessionID, {
//     userID: customSocket.userID,
//     customSocket,
//   });

//   customSocket.emit("session", {
//     sessionID: customSocket.sessionID,
//     userID: customSocket.userID,
//   });

//   next();
// });

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

  // await redisClient.rPush(socket.id, customSocket);
  // await redisClient.rPush(socket.id, customSocket);

  // await redisClient.rPush(existingre, socket.id);
  // const userdetails = JSON.parse({ name, phonenumber });
  // const userdetails = JSON.stringify({ name, phonenumber });

  // if (ssid) {
  //   // i dont want to push the user to redis insted i need tu update or replace theat session with socket id and the name
  // }
  // await redisClient.rPush(
  //   "new user",
  //   JSON.stringify({ id: socket.id, name, phonenumber, existingre })
  // );

  if (!ssid) {
    console.error("Session ID is missing, cannot set value in Redis.");
    return;
  }

  const userDetailss = JSON.stringify({
    name: name,
    socketid: socket.id,
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
      await redisClient.lRem("newuser", 0, socket.id);
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
