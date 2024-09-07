"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const client_1 = __importDefault(require("./redisclient/client"));
const uuid_1 = require("uuid");
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const fileupload_1 = __importDefault(require("./routes/fileupload"));
const clientdetails_1 = __importDefault(require("./routes/clientdetails"));
const signup_1 = __importDefault(require("./routes/signup"));
const signin_1 = __importDefault(require("./routes/signin"));
const cors_1 = __importDefault(require("cors"));
const userdetails = new Map();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
console.log(path_1.default.join(__dirname, "..", "images"));
// const imagesDirectory = path.join(__dirname, "..", "..", "images");
const imagesDirectory = "D:/Chatapplication-socket/server/images";
// app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/images", express_1.default.static(imagesDirectory));
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "..", "..", "images")));
app.use("/uploads", fileupload_1.default);
app.use("/user", clientdetails_1.default);
app.use("/user", signup_1.default);
app.use("/user", signin_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});
const sessionStore = new Map();
io.use((socket, next) => {
    const customSocket = socket;
    const sessionID = customSocket.handshake.auth.sessionID;
    const name = customSocket.handshake.auth.name;
    if (sessionID && sessionStore.has(sessionID)) {
        const session = sessionStore.get(sessionID);
        customSocket.sessionID = sessionID;
        customSocket.userID = session.userID;
        return next();
    }
    // Only create a new session if the session ID is missing or invalid
    const newSessionID = (0, uuid_1.v4)();
    customSocket.sessionID = newSessionID;
    customSocket.userID = (0, uuid_1.v4)();
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
    return __awaiter(this, void 0, void 0, function* () {
        const customSocket = socket;
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
            yield client_1.default.SET(ssid, userDetailss);
            console.log("stored in redis");
        }
        catch (e) {
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
            socket.on("disconnect", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield client_1.default.del(ssid);
                });
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
        socket.on("sendimages", function ({ from, to, imageUrl, }) {
            console.log(`recieved message from ${from} and the message is ${imageUrl}`);
            io.to(to).emit("sendimages", { imageUrl: imageUrl, from: from });
        });
    });
});
server.listen(3000, function () {
    console.log("server listening on port 30000");
});
