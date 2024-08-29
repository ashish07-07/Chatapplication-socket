import express from "express";
import path from "path";

import { v4 as uuidv4 } from "uuid";

import { Server } from "socket.io";
import http from "http";
import { randomUUID } from "crypto";

import { Socket } from "socket.io";
import { userInfo } from "os";
import router from "./routes/fileupload";

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

io.use((socket: Socket, next) => {
  const customSocket = socket as CustomSocket;

  const sessionID = customSocket.handshake.auth.sessionID;

  const emailid = customSocket.handshake.auth.email;

  const name = customSocket.handshake.auth.name;

  console.log("custom handshake auth details noodu");

  console.log(customSocket.handshake.auth);
  if (sessionID) {
    const session = sessionStore.get(sessionID);

    if (session) {
      console.log("id ede marre ");
      console.log("session id exists");

      customSocket.sessionID = sessionID;
      customSocket.userID = session.userID;

      // socket.emit("idexist", { socket: socket, id: socket.id });

      return next();
    }
  }

  console.log("session id does not exist");
  const newSessionID = uuidv4();
  customSocket.sessionID = newSessionID;
  customSocket.userID = uuidv4();
  console.log(sessionID);
  console.log(customSocket.userID);
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

io.on("connection", function (socket) {
  const customSocket = socket as CustomSocket;
  const existingre = socket.handshake.auth.sessionID;

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
