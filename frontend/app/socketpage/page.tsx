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
  const [tomessage, settomessage] = useState<messagetotemplate | null>(null);

  const { data: session, status } = useSession();
  const [allmessages, setallmessages] = useState<Message[] | null>(null);
  const [socketImage, setImage] = useState<File | null>(null);
  const [cursockid, setcursockid] = useState<SocketIOClient.Socket | null>(
    null
  );

  const tomessagere = useRef<messagetotemplate | null>(null);
  interface userdetails {
    keyssid: string;
    userdetails: {
      name: string;
      socketid: string;
      phonenumber: string;
    };
    unreadcount?: number;
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

  interface Message {
    id?: number;
    fromphonenumber: string;
    tophonenumber: string;
    message?: string;
    isread: boolean;
    timestamp: Date;
    imageUrl?: string;
  }

  async function Getallmessage() {
    try {
      if (!session?.user || !tomessage?.phonenumber) return;
      const response = await axios.get("http://localhost:3000/get/messages", {
        params: {
          fromphonenumber: session.user.phonenumber,
          tophonenumber: tomessage.phonenumber,
        },
      });
      setallmessages(response.data.response || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }

  const userinfo = useCallback((userdetailss: messagetotemplate) => {
    settomessage(userdetailss);

    tomessagere.current = userdetailss;
    console.log(tomessagere.current);

    setallusers((previoususer) => {
      return previoususer.map(function (user) {
        if (user.userdetails.phonenumber === userdetailss.phonenumber) {
          return {
            ...user,
            unreadcount: 0,
          };
        }

        return user;
      });
    });
  }, []);

  useEffect(() => {
    if (tomessage) {
      console.log(
        `  the selected users phonenumber is ${tomessage.phonenumber}`
      );

      Getallmessage();
    }
  }, [tomessage]);

  useEffect(() => {
    if (status === "authenticated" && session?.user && !usersocket.current) {
      const socket = io("http://localhost:3000", {
        auth: {
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

      const Getuserdetails = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3000/user/getuserdetails"
          );
          const details = response.data.userdetails.filter(
            (val: any) => val.keyssid !== sessionID
          );

          const parsedDetails = details.map((user: any) => ({
            ...user,
            userdetails: JSON.parse(user.userdetails),
          }));
          setallusers(parsedDetails);
          console.log("Fetched Users:", parsedDetails);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      socket.on("connect", () => {
        console.log(`Connected with socket ID ${socket.id}`);
        Getuserdetails();
      });

      socket.on("shownewuser", Getuserdetails);

      socket.on(
        "privatemessages",
        function ({
          from,
          to,
          fromphonenumber,
          tophonenumber,
          message,
        }: socketMessagetemplate) {
          console.log(`the recieved message is ${message}`);
          if (to === socket.id) {
            console.log(`the tomeesae is ${tomessage?.name}`);
            console.log(
              `the ref useref tomessage is ${tomessagere.current} wts up man`
            );
            if (
              tomessagere.current?.phonenumber &&
              tomessagere.current.phonenumber === fromphonenumber
            ) {
              console.log(
                "to message is selected i just need to update the message only"
              );
              setallmessages((prevMessages) => [
                ...(prevMessages || []),
                {
                  fromphonenumber,
                  tophonenumber,
                  message,
                  isread: true,
                  timestamp: new Date(),
                },
              ]);
            } else {
              console.log(
                "inside the lese check its ither user or user is not seleced"
              );

              setallusers((prevUsers) =>
                prevUsers.map((user) =>
                  user.userdetails.phonenumber === fromphonenumber
                    ? { ...user, unreadcount: (user.unreadcount ?? 0) + 1 }
                    : user
                )
              );
            }
          }
        }
      );

      socket.on(
        "sendimages",
        ({
          from,
          to,
          fromphonenumber,
          tophonenumber,
          imageUrl,
        }: recieveimagetemplate) => {
          if (tomessagere.current?.phonenumber === fromphonenumber) {
            setallmessages((prevMessages) => [
              ...(prevMessages || []),
              {
                fromphonenumber,
                tophonenumber,
                imageUrl,
                isread: true,
                timestamp: new Date(),
              },
            ]);
          } else {
            setallusers((prevUsers) =>
              prevUsers.map((user) =>
                user.userdetails.phonenumber === fromphonenumber
                  ? { ...user, unreadcount: (user.unreadcount ?? 0) + 1 }
                  : user
              )
            );
          }
          console.log(`Received image from ${from}: ${imageUrl}`);
        }
      );

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        usersocket.current = null;
      });
    }
  }, [sessionID, session, status, usersocket.current]);

  const handleSendMessage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const socket = usersocket.current;
    if (!socket || !tomessage || !session?.user || !message) return;

    if (!session.user) {
      return;
    }

    console.log(
      `the tomessage name is ${tomessage.name} ${tomessage.phonenumber} and the socket id is ${tomessage.socketid}`
    );

    try {
      socket.emit("privatemessages", {
        from: socket.id,
        to: tomessage.socketid,
        fromphonenumber: session.user.phonenumber,
        tophonenumber: tomessage.phonenumber,
        message,
      });

      setallmessages((prevMessages) => [
        ...(prevMessages || []),
        {
          fromphonenumber: session.user?.phonenumber,
          tophonenumber: tomessage.phonenumber,
          message,
          isread: false,
          timestamp: new Date(),
        },
      ]);

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!socketImage || !tomessage || !session?.user) return;

    try {
      const formData = new FormData();
      formData.append("image", socketImage);
      const response = await axios.post(
        "http://localhost:3000/send/images",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const imageUrl = response.data.imageurl;
      const socket = usersocket.current;

      if (socket) {
        socket.emit("sendimages", {
          from: socket.id,
          to: tomessage.socketid,
          fromphonenumber: session.user.phonenumber,
          tophonenumber: tomessage.phonenumber,
          imageUrl,
        });

        console.log("i have sent a image man");
        setallmessages((prevMessages) => [
          ...(prevMessages || []),
          {
            fromphonenumber: session.user?.phonenumber,
            tophonenumber: tomessage.phonenumber,
            imageUrl,
            isread: false,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen bg-white">
      <div className="grid grid-cols-2 h-screen bg-white">
        <div className="text-black">
          {allusers && (
            <div>
              {allusers.map((val: any) => {
                const userdetails = val.userdetails;
                return (
                  <div key={val.keyssid}>
                    <button onClick={() => userinfo(userdetails)}>
                      <h2>Name: {userdetails.name}</h2>
                      <h2>Phonenumber: {userdetails.phonenumber}</h2>
                      <h2>Socketid: {userdetails.socketid}</h2>
                      <h2>Unread Messages: {val.unreadcount}</h2>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
          accept="image/*"
          onChange={(e) => e.target.files && setImage(e.target.files[0])}
        />
        <button onClick={handleSendImage}>Send the image</button>
        {allmessages && (
          <div>
            {allmessages.map((val, index) => (
              <div key={index}>
                {val.message && <h2>{val.message}</h2>}
                {val.imageUrl && (
                  <Image
                    src={val.imageUrl}
                    alt="Received Image"
                    width={200}
                    height={200}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
