"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { json } from "stream/consumers";

import { Userdetails } from "../components/userdeatils";
import { userInfo } from "os";

function App() {
  const usersocket = useRef<SocketIOClient.Socket | null>(null);

  const [message, setMessage] = useState<string>("");
  const [sessionID, setSessionID] = useState<string | null>(
    localStorage.getItem("sessionID") || null
  );

  const [allusers, setallusers] = useState<userdetails[]>([]);

  const [tomessage, settomessage] = useState<messagetotemplate>();

  interface Signuserdetails {
    name: string;
    email: string;
    id: string;
    phonenumber: string;
  }
  interface userdetails {
    keyssid: string;
    userdetails: {
      name: string;
      socketid: string;
      phonenumber: string;
    };
  }

  interface messagetotemplate {
    name: string;
    socketid: string;
    phonenumber: string;
    email: string;
  }

  interface socketMessagetemplate {
    from: string;
    to: string;
    fromphonenumber: string;
    tophonenumber: string;
    message: string;
  }

  interface SocketEventData {
    messagedetails: socketMessagetemplate;
  }

  const userinfo = useCallback((userdetailss: messagetotemplate) => {
    console.log("User selected:", userdetailss);
    settomessage(userdetailss);
  }, []);

  const [socketImage, setImage] = useState<File | null>(null);

  const [cursockid, setcursockid] = useState<SocketIOClient.Socket | null>(
    null
  );

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user && !usersocket.current) {
      const SessionID = localStorage.getItem("sessionID");
      console.log(`BEFORE ACTULALY connecting the session id is ${SessionID}`);
      const socket = io("http://localhost:3000", {
        auth: {
          // sessionID: sessionID || null,
          sessionID: sessionID || null,
          email: session.user.email,
          name: session.user.name,
          phonenumber: session.user.phonenumber,
        },
      });

      usersocket.current = socket;
      setcursockid(socket); // here i have the current socket id

      socket.on("session", ({ sessionID }: { sessionID: string }) => {
        setSessionID(sessionID);
        localStorage.setItem("sessionID", sessionID);
      });

      socket.on("connect", () => {
        console.log(
          `A client with socket ID ${socket.id} connected to server with session ID ${sessionID}`
        );
        Getuserdetails();
      });

      const Getuserdetails = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3000/user/getuserdetails"
          );
          console.log(response.data);
          console.log(response.data.userdetails);

          // console.log(`the respose i get is ${response.data.keyssid}`);
          const details = response.data.userdetails;

          const Allotherusers = details.filter(function (val: any) {
            return val.keyssid != sessionID;
          });

          console.log(Allotherusers);
          setallusers(Allotherusers);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      socket.on(
        "sendimages",
        function ({ imageUrl, from }: { imageUrl: string; from: string }) {
          console.log(`Received image from ${from}: ${imageUrl}`);
        }
      );

      socket.on("disconnect", () => {
        console.log("Disconnected");
        usersocket.current = null;
      });

      socket.on(
        "privatemessages",
        function ({
          from,
          to,
          fromphonenumber,
          tophonenumber,
          message,
        }: socketMessagetemplate) {
          console.log("receieved message re");

          console.log(
            `Received message from ${from} and the message was ${message}`
          );
        }
      );
    }
  }, [sessionID, session, status]);

  const handleSendMessage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("i M GOING TO SEND THE IAMGE NOW");
    const socket = usersocket.current;

    if (!tomessage) {
      console.log("no reciepient selected here");
      return;
    }
    if (!session?.user) {
      return;
    }
    if (!message) {
      return;
    }
    if (socket) {
      try {
        socket.emit("privatemessages", {
          from: socket.id,
          to: tomessage.socketid,
          fromphonenumber: session?.user.phonenumber,
          tophonenumber: tomessage.phonenumber,
          message: message,
        });
        console.log(`Message sent: ${message}`);
      } catch (e) {
        console.error("Error sending message:", e);
      }
    } else {
      console.log("Socket is not connected");
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen bg-white">
      <div className="text-black">
        {allusers && (
          <div>
            {allusers.map(function (val: any) {
              const userdetails =
                typeof val.userdetails === "string"
                  ? JSON.parse(val.userdetails)
                  : val.userdetails;

              return (
                <div key={val.keyssid} className="">
                  <button onClick={() => userinfo(userdetails)}>
                    <h2>Name: {userdetails.name}</h2>
                    <h2>Phonenumber: {userdetails.phonenumber}</h2>
                    <h2>Phonenumber: {userdetails.socketid}</h2>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-black">
        Socket Project
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send Message</button>
        <h2> Send Images </h2>
        <input
          type="file"
          name="image"
          accept="image/**"
          onChange={function (e) {
            if (e.target.files && e.target.files[0]) {
              setImage(e.target.files[0]);
            }
          }}
        />
        <button
          onClick={async (e) => {
            e.preventDefault();

            if (!socketImage) {
              console.log("No image selected");
              return;
            }

            try {
              const formData = new FormData();
              formData.append("image", socketImage);

              const response = await axios.post(
                "http://localhost:3000/uploads/images",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              const { imageUrl } = response.data;
              console.log("Image sent successfully:", imageUrl);

              const socket = usersocket.current;
              if (socket) {
                socket.emit("sendimages", {
                  from: socket.id,
                  to: "hNi0LXRqr8KHcgBPAAAF",
                  imageUrl: imageUrl,
                });
              }
            } catch (error) {
              console.error("Error uploading image:", error);
            }
          }}
        >
          Send the image
        </button>
      </div>
    </div>
  );
}

export default App;
