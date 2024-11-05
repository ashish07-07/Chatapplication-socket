"use strict";
// import mediasoup from "mediasoup";
// import {
//   RtpCodecCapability,
//   RouterOptions,
//   Router,
//   WebRtcTransportOptions,
//   WebRtcTransport,
// } from "mediasoup/node/lib/types";
// let worker;
// let router: Router | undefined; // Initialize as undefined
// const workerSettings: mediasoup.types.WorkerSettings = {
//   logLevel: "warn" as mediasoup.types.WorkerLogLevel,
//   rtcMinPort: 10000,
//   rtcMaxPort: 10100,
// };
// const routerOptions: RouterOptions = {
//   mediaCodecs: [
//     {
//       kind: "audio",
//       mimeType: "audio/opus",
//       clockRate: 48000,
//       channels: 2,
//     },
//     {
//       kind: "video",
//       mimeType: "video/VP8",
//       clockRate: 90000,
//     },
//   ],
// };
// const createWorker = async () => {
//   worker = await mediasoup.createWorker(workerSettings);
//   console.log("setting up worker is done right now ");
//   worker.on("died", () => {
//     console.error("MediaSoup worker has died");
//   });
//   router = await worker.createRouter(routerOptions);
//   console.log("setting router is also done now ");
// };
// const webRtcTransportOptions: WebRtcTransportOptions = {
//   listenIps: [{ ip:"0.0.0.0", announcedIp: "103.89.235.238" }],
//   enableUdp: true,
//   enableTcp: true,
//   preferUdp: true,
// };
// // Modify createtransport to ensure router is initialized
// export const createtransport = async () => {
//   if (!router) {
//     throw new Error(
//       "Router is not initialized. Ensure createWorker is called first."
//     );
//   }
//   const transport = await router.createWebRtcTransport(webRtcTransportOptions);
//   console.log(`Transport created with ID: ${transport.id}`);
//   return transport;
// };
// // Export a function to initialize everything
// export const initializeMediaSoup = async () => {
//   await createWorker(); // Ensure the worker and router are created first
// };
// export default {
//   createWorker,
//   worker,
//   router,
//   createtransport,
//   initializeMediaSoup,
// };
