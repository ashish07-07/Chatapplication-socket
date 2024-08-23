"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
const userdetails = new Map();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
const sessionStore = new Map();
io.use((socket, next) => {
    const customSocket = socket;
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
            return next();
        }
    }
    console.log("session id does not exist");
    const newSessionID = (0, uuid_1.v4)();
    customSocket.sessionID = newSessionID;
    customSocket.userID = (0, uuid_1.v4)();
    console.log(sessionID);
    console.log(customSocket.userID);
    sessionStore.set(customSocket.sessionID, {
        userID: customSocket.userID,
        customSocket,
    });
    customSocket.emit("session", {
        sessionID: customSocket.sessionID,
        // userID: customSocket.userID,
    });
    next();
});
io.on("connection", function (socket) {
    const existingre = socket.handshake.auth.sessionID;
    console.log("a user connected");
    console.log(socket.id);
    socket.on("newusers", function (data) {
        console.log(data);
    });
    socket.on("message", function (data, isBinary) {
        console.log(` the message that ${socket.id} sent is ${data.messages}`);
    });
    const userdetails = new Map();
    // userdetails.set("email",{username:name,socket:socket});
    userdetails.set("email", socket);
    // userdetails.set(socket.id,{email:});
    userdetails.set(socket.id, socket);
    socket.on("privatemessages", function ({ to, message }) {
        console.log("someone sent the messages");
        console.log(`messages is ${message}`);
        console.log(to);
        const recipeentuser = userdetails.get(to);
        if (recipeentuser) {
            io.to(to).emit("privatemessages", {
                from: socket.id,
                message,
            });
        }
    });
});
server.listen(3000, function () {
    console.log("server listening on port 30000");
});
