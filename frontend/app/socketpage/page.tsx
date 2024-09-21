"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useSession } from "next-auth/react";

import Image from "next/image";

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

  interface recieveimagetemplate {
    from: string;
    to: string;
    fromphonenumber: string;
    tophonenumber: string;
    imageUrl: string;
  }

  interface SocketEventData {
    messagedetails: socketMessagetemplate;
  }

  interface Message {
    id?: number;
    fromphonenumber: string;
    tophonenumber: string;
    message?: string;
    isread: boolean;
    timestamp: Date;
    imageUrl?: string;
  }

  const [allmessages, setallmessages] = useState<Message[] | null>(null);

  async function Getallmessage() {
    try {
      if (!session?.user) {
        return;
      }

      const response = await axios.get("http://localhost:3000/get/messages", {
        params: {
          fromphonenumber: session.user.phonenumber,
          tophonenumber: tomessage?.phonenumber,
        },
      });

      setallmessages(response.data.response);

      return response.data.response;
    } catch (e) {
      console.log(e);
    }
  }

  interface Userchatinfo {
    name: string;
    ssid: string;
    phonenumber: string;
    email: string;
    socketid: string;
  }

  const userinfo = useCallback(
    async (userdetailss: messagetotemplate) => {
      console.log("User selected:", userdetailss);
      settomessage(userdetailss);
      console.log("here the function i will call now");
      try {
        const response = await Getallmessage();

        console.log("called this function waiting for the sresult");

        if (response) {
          console.log(response);
        } else {
          console.log("i did not get any responses yet");
        }
      } catch (e) {
        console.log(e);
      }
    },
    [setMessage, Getallmessage]
  );

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
      setcursockid(socket);

      socket.on("session", ({ sessionID }: { sessionID: string }) => {
        setSessionID(sessionID);
        localStorage.setItem("sessionID", sessionID);
      });

      socket.on("shownewuser", function () {
        Getuserdetails();
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
        function ({
          from,
          to,
          fromphonenumber,
          tophonenumber,

          imageUrl,
        }: recieveimagetemplate) {
          console.log(`Received image from ${from}: and the  ${imageUrl} is `);
        }
      );

      socket.on("disconnect", () => {
        console.log("Disconnected");
        usersocket.current = null;
      });

      socket.on(
        "privatemessages",
        async function ({
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
          if (!session.user) {
            return;
          }

          if (
            from === session.user.phonenumber &&
            to === tomessage?.phonenumber
          ) {
            const newMessage = {
              fromphonenumber: fromphonenumber,
              tophonenumber: tophonenumber,
              message: message,
              isread: false,
              timestamp: new Date(),
            };

            setallmessages((prevMessages) => {
              if (prevMessages) {
                return [...prevMessages, newMessage];
              } else {
                return [newMessage];
              }
            });
          }
        }
      );
    }
  }, [sessionID, session, status, usersocket.current, allusers]);

  useEffect(() => {
    console.log("touser changed");
  }, [tomessage]);

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
            if (!tomessage) {
              console.log("please select a user to send the images");
              return;
            }
            if (!session?.user) {
              return;
            }

            try {
              const formData = new FormData();
              formData.append("image", socketImage);

              const response = await axios.post(
                "http://localhost:3000/send/images",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              console.log(response);

              const imageUrl = response.data.imageurl;
              console.log("Image sent successfully:", imageUrl);

              const socket = usersocket.current;
              if (socket) {
                socket.emit("sendimages", {
                  from: socket.id,
                  to: tomessage.socketid,
                  fromphonenumber: session.user.phonenumber,
                  tophonenumber: tomessage.phonenumber,

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
        {allmessages && (
          <div>
            {allmessages.map(function (val) {
              return (
                <div key={val.id}>
                  {val.message && <h2>{val.message}</h2>}
                  {val.imageUrl && (
                    <Image
                      src={val.imageUrl}
                      width={200}
                      height={200}
                      alt="Picture loading"
                    ></Image>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
