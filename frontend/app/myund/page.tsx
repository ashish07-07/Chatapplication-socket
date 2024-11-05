"use client";
import { error } from "console";
import { useEffect, useReducer, useRef, useState } from "react";
import { Socket } from "socket.io";
import io from "socket.io-client";
import { Stream } from "stream";

interface socketdetails {
  socketid: string;
}

export default function Myvideore() {
  const videoref = useRef<HTMLVideoElement | null>(null);

  const [socket, setsocket] = useState<any>(null);

  const [params, setParams] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 },
    videoTrack: null,
    audioTrack: null,
  });

  async function startvideocall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const videotrackre = stream.getVideoTracks()[0];
      const audiotrackre = stream.getAudioTracks()[0];

      console.log(`video track is ${videotrackre}`);
      console.log(`the audio track is ${audiotrackre}`);

      if (!videoref.current) {
        return;
      }
      videoref.current.srcObject = stream;

      setParams(function (current) {
        console.log(current);
        return {
          ...current,
          videotrack: videotrackre,
          audiotrack: audiotrackre,
        };
      });
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const socket = io("http://localhost:3000/mediasoup");

    setsocket(Socket);

    socket?.on(
      "connection-success",
      async function ({ socketid }: socketdetails) {
        console.log(
          `i recieved the socket is back from server and the id is ${socketid}`
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <button onClick={startvideocall}> Press me to make a video call</button>
    </div>
  );
}
