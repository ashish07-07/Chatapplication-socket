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

import * as mediasoup from "mediasoup";

// import { initializeMediaSoup } from "./mediasoup-config";
// import { createtransport } from "./mediasoup-config";

import { Particularmessage } from "./interfaces/interfaces";
interface customsocket extends Socket {
  sessionID: string;
  userID: string;
}

import { CreateWebRtcTransportRequestT } from "mediasoup/node/lib/fbs/router";

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

      console.log("");

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

  interface Offer {
    from: string;
    to: string;
    sdp: RTCSessionDescriptionInit;
  }
  socket.on("create-an-offer", function ({ from, to, sdp }: Offer) {
    console.log("some one requested for a video call");
    console.log(
      `who requested the callis  ${from} to is ${to} and the offer is ${sdp}`
    );
    io.to(to).emit("recievean-offer", {
      from,
      to,
      sdp,
    });
  });

  socket.on("send-answer", function ({ from, to, sdp }: Offer) {
    console.log(
      `recieved the answer from ${from} to is ${to} and the answer is ${sdp}`
    );

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
  socket.on("disconnect", async function () {
    await redisClient.del(ssid);
  });
});

const peers = io.of("/mediasoup");

console.log(`the peer object is ${peers}`);

let worker: mediasoup.types.Worker<mediasoup.types.AppData>;
let routerr: mediasoup.types.Router<mediasoup.types.AppData>;
let producerTransport:
  | mediasoup.types.WebRtcTransport<mediasoup.types.AppData>
  | undefined;
let consumerTransport:
  | mediasoup.types.WebRtcTransport<mediasoup.types.AppData>
  | undefined;
let producer: mediasoup.types.Producer<mediasoup.types.AppData> | undefined;
let consumer: mediasoup.types.Consumer<mediasoup.types.AppData> | undefined;

async function createworker(): Promise<
  mediasoup.types.Worker<mediasoup.types.AppData>
> {
  const newWorker = await mediasoup.createWorker({
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
}

async function initialize() {
  worker = await createworker();
}

initialize().catch((error) => {
  console.error("Error initializing worker:", error);
});

const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
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

const createWebRtcTransport = async (callback: any) => {
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

    const transport = await routerr.createWebRtcTransport(
      webRtcTransportOptions
    );

    console.log(`Transport created: ${transport.id}`);

    console.log(
      `are bahi transported created ${JSON.stringify(
        transport.appData
      )} and normal ${transport}`
    );

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
  } catch (error) {
    console.log(error);
    callback({
      params: {
        error,
      },
    });
  }
};

peers.on("connection", async function (socket) {
  console.log(
    `a peer connected to mediasoup server who is having a socketid of ${socket.id}`
  );

  socket.emit("connection-success", {
    socketid: socket.id,
  });

  routerr = await worker.createRouter({
    mediaCodecs: mediaCodecs,
  });

  socket.on("getRouterRtpCapabilities", async function (callbackfunctionre) {
    const routerRtpCapabilities = routerr.rtpCapabilities;
    console.log(`the router rtp capablities is ${routerRtpCapabilities}`);
    callbackfunctionre({ routerRtpCapabilities });
  });

  socket.on("createTransport", async function ({ sender }, callbackfunctionre) {
    if (sender) {
      producerTransport = await createWebRtcTransport(callbackfunctionre);
    } else {
      consumerTransport = await createWebRtcTransport(callbackfunctionre);
    }
  });

  socket.on("connectProducerTransport", async function ({ dtlsParameters }) {
    await producerTransport?.connect({ dtlsParameters });
  });

  socket.on(
    "transport-produce",
    async function ({ kind, rtpParameters }, callbackfunctionre) {
      producer = await producerTransport?.produce({
        kind,
        rtpParameters,
      });

      producer?.on("transportclose", function () {
        console.log("Producers transport closed");
      });

      callbackfunctionre({ id: producer?.id });
    }
  );

  socket.on(
    "consumeMedia",
    async function ({ rtpCapabilities }, callbackfunctionre) {
      try {
        if (producer) {
          if (
            !routerr.canConsume({ producerId: producer?.id, rtpCapabilities })
          ) {
            console.log("cannot consume");
            return;
          }

          consumer = await consumerTransport?.consume({
            producerId: producer.id,
            rtpCapabilities,

            paused: producer?.kind === "video",
          });

          consumer?.on("transportclose", function () {
            console.log("consumer trsnsport closed ");

            consumer?.close();
          });

          consumer?.on("producerclose", function () {
            console.log("producer closed");

            consumer?.close();
          });

          callbackfunctionre({
            params: {
              producerId: producer?.id,
              id: consumer?.id,
              kind: consumer?.kind,
              rtpParameters: consumer?.rtpParameters,
            },
          });
        }
      } catch (error) {
        console.error("errror is", error);

        callbackfunctionre({
          params: {
            error,
          },
        });
      }
    }
  );

  socket.on("resumePausedConsumer", async function () {
    console.log("consume-resume");
    await consumer?.resume();
  });

  socket.on("disconnect", function () {
    console.log("the client disconnected the medissoup server");
  });
});

server.listen(3000, function () {
  console.log("server listening on port 30000");
});
