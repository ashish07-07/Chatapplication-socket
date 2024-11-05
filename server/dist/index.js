"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const db_1 = __importDefault(require("./db"));
const imageupload_1 = __importDefault(require("./routes/imageupload"));
const getallmessage_1 = __importDefault(require("./routes/getallmessage"));
const mediasoup = __importStar(require("mediasoup"));
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
app.use("/send", imageupload_1.default);
app.use("/get", getallmessage_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// const startMediaSoup = async () => {
//   try {
//     await initializeMediaSoup();
//     console.log("MediaSoup initialized successfully");
//   } catch (err) {
//     console.error("Failed to initialize MediaSoup:", err);
//   }
// };
// startMediaSoup();
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
            yield client_1.default.SET(ssid, userDetailss);
            console.log("stored in redis");
        }
        catch (e) {
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
        // try {
        //   const transport = await socket.emit("transport-created", {
        //     transport,
        //   });
        // } catch (e) {
        //   console.log(e);
        // }
        console.log(`are ashih beta wts this re beta ${customSocket}`);
        userdetails.set(customSocket.id, socket);
        console.log(`user map details is ${userdetails}`);
        userdetails.forEach(function (val) {
            console.log("each socket id is ");
            console.log(val.id);
        });
        socket.on("privatemessages", function (_a) {
            return __awaiter(this, arguments, void 0, function* ({ from, to, fromphonenumber, tophonenumber, message, }) {
                console.log("someone sent the messages");
                const response = yield db_1.default.message.create({
                    data: {
                        fromsocketid: from,
                        tosocketid: to,
                        fromphonenumber: fromphonenumber,
                        tophonenumber: tophonenumber,
                        message: message,
                    },
                });
                const recipeentuser = userdetails.get(to);
                console.log(`the recipeient socked id is ${to} message is sent from ${from} and the message is ${message}`);
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
            });
        });
        socket.on("sendimages", function (_a) {
            return __awaiter(this, arguments, void 0, function* ({ from, to, fromphonenumber, tophonenumber, 
            // message,
            imageUrl, }) {
                console.log(`recieved message from ${from} and the image url is ${imageUrl}`);
                const response = yield db_1.default.message.create({
                    data: {
                        fromsocketid: from,
                        tosocketid: to,
                        fromphonenumber: fromphonenumber,
                        tophonenumber: tophonenumber,
                        imageUrl: imageUrl,
                    },
                });
                console.log("");
                console.log(`updated the image url in database`);
                io.to(to).emit("sendimages", {
                    from,
                    to,
                    fromphonenumber,
                    tophonenumber,
                    imageUrl,
                });
            });
        });
        socket.on("create-an-offer", function ({ from, to, sdp }) {
            console.log("some one requested for a video call");
            console.log(`who requested the callis  ${from} to is ${to} and the offer is ${sdp}`);
            io.to(to).emit("recievean-offer", {
                from,
                to,
                sdp,
            });
        });
        socket.on("send-answer", function ({ from, to, sdp }) {
            console.log(`recieved the answer from ${from} to is ${to} and the answer is ${sdp}`);
            io.to(to).emit("recieve-answer", {
                from,
                to,
                sdp,
            });
        });
        // recieve-answer
        // ice-candidates
        socket.on("ice-candidates", function ({ from, to, candidate }) {
            console.log("ice canidate came to server now");
            console.log(`the ice candidate is ${candidate}`);
            io.to(to).emit("ice-candidate-arrived", {
                from,
                to,
                candidate,
            });
        });
        socket.on("disconnect", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield client_1.default.del(ssid);
            });
        });
    });
});
const peers = io.of("/mediasoup");
console.log(`the peer object is ${peers}`);
let worker;
let routerr;
let producerTransport;
let consumerTransport;
let producer;
let consumer;
function createworker() {
    return __awaiter(this, void 0, void 0, function* () {
        const newWorker = yield mediasoup.createWorker({
            rtcMinPort: 2000,
            rtcMaxPort: 2020,
        });
        console.log(`worker is created and its id is ${newWorker.pid}`);
        newWorker.on("died", function () {
            console.log("mediasoup wrker has died ");
            setTimeout(() => {
                process.exit();
            }, 2000);
        });
        return newWorker;
    });
}
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        worker = yield createworker();
    });
}
initialize().catch((error) => {
    console.error("Error initializing worker:", error);
});
const mediaCodecs = [
    {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
        preferredPayloadType: 96,
        rtcpFeedback: [{ type: "nack" }, { type: "nack", parameter: "pli" }],
    },
    {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
            "x-google-start-bitrate": 1000,
        },
        preferredPayloadType: 97,
        rtcpFeedback: [
            { type: "nack" },
            { type: "ccm", parameter: "fir" },
            { type: "goog-remb" },
        ],
    },
];
const createWebRtcTransport = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const webRtcTransportOptions = {
            listenIps: [
                {
                    ip: "127.0.0.1",
                },
            ],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        };
        const transport = yield routerr.createWebRtcTransport(webRtcTransportOptions);
        console.log(`Transport created: ${transport.id}`);
        console.log(`are bahi transported created ${JSON.stringify(transport.appData)} and normal ${transport}`);
        transport.on("dtlsstatechange", (dtlsState) => {
            if (dtlsState === "closed") {
                transport.close();
            }
        });
        transport.on("@close", () => {
            console.log("Transport closed");
        });
        callback({
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            },
        });
        return transport;
    }
    catch (error) {
        console.log(error);
        callback({
            params: {
                error,
            },
        });
    }
});
peers.on("connection", function (socket) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`a peer connected to mediasoup server who is having a socketid of ${socket.id}`);
        socket.emit("connection-success", {
            socketid: socket.id,
        });
        routerr = yield worker.createRouter({
            mediaCodecs: mediaCodecs,
        });
        socket.on("getRouterRtpCapabilities", function (callbackfunctionre) {
            return __awaiter(this, void 0, void 0, function* () {
                const routerRtpCapabilities = routerr.rtpCapabilities;
                console.log(`the router rtp capablities is ${routerRtpCapabilities}`);
                callbackfunctionre({ routerRtpCapabilities });
            });
        });
        socket.on("createTransport", function (_a, callbackfunctionre_1) {
            return __awaiter(this, arguments, void 0, function* ({ sender }, callbackfunctionre) {
                if (sender) {
                    producerTransport = yield createWebRtcTransport(callbackfunctionre);
                }
                else {
                    consumerTransport = yield createWebRtcTransport(callbackfunctionre);
                }
            });
        });
        socket.on("connectProducerTransport", function (_a) {
            return __awaiter(this, arguments, void 0, function* ({ dtlsParameters }) {
                yield (producerTransport === null || producerTransport === void 0 ? void 0 : producerTransport.connect({ dtlsParameters }));
            });
        });
        socket.on("transport-produce", function (_a, callbackfunctionre_1) {
            return __awaiter(this, arguments, void 0, function* ({ kind, rtpParameters }, callbackfunctionre) {
                producer = yield (producerTransport === null || producerTransport === void 0 ? void 0 : producerTransport.produce({
                    kind,
                    rtpParameters,
                }));
                producer === null || producer === void 0 ? void 0 : producer.on("transportclose", function () {
                    console.log("Producers transport closed");
                });
                callbackfunctionre({ id: producer === null || producer === void 0 ? void 0 : producer.id });
            });
        });
        socket.on("consumeMedia", function (_a, callbackfunctionre_1) {
            return __awaiter(this, arguments, void 0, function* ({ rtpCapabilities }, callbackfunctionre) {
                try {
                    if (producer) {
                        if (!routerr.canConsume({ producerId: producer === null || producer === void 0 ? void 0 : producer.id, rtpCapabilities })) {
                            console.log("cannot consume");
                            return;
                        }
                        consumer = yield (consumerTransport === null || consumerTransport === void 0 ? void 0 : consumerTransport.consume({
                            producerId: producer.id,
                            rtpCapabilities,
                            paused: (producer === null || producer === void 0 ? void 0 : producer.kind) === "video",
                        }));
                        consumer === null || consumer === void 0 ? void 0 : consumer.on("transportclose", function () {
                            console.log("consumer trsnsport closed ");
                            consumer === null || consumer === void 0 ? void 0 : consumer.close();
                        });
                        consumer === null || consumer === void 0 ? void 0 : consumer.on("producerclose", function () {
                            console.log("producer closed");
                            consumer === null || consumer === void 0 ? void 0 : consumer.close();
                        });
                        callbackfunctionre({
                            params: {
                                producerId: producer === null || producer === void 0 ? void 0 : producer.id,
                                id: consumer === null || consumer === void 0 ? void 0 : consumer.id,
                                kind: consumer === null || consumer === void 0 ? void 0 : consumer.kind,
                                rtpParameters: consumer === null || consumer === void 0 ? void 0 : consumer.rtpParameters,
                            },
                        });
                    }
                }
                catch (error) {
                    console.error("errror is", error);
                    callbackfunctionre({
                        params: {
                            error,
                        },
                    });
                }
            });
        });
        socket.on("resumePausedConsumer", function () {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("consume-resume");
                yield (consumer === null || consumer === void 0 ? void 0 : consumer.resume());
            });
        });
        socket.on("disconnect", function () {
            console.log("the client disconnected the medissoup server");
        });
    });
});
server.listen(3000, function () {
    console.log("server listening on port 30000");
});
