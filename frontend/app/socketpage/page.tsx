// "use client";
// import { useRef, useState, useEffect } from "react";
// import io from "socket.io-client";
// import axios from "axios";
// import { useSession } from "next-auth/react";

// function App() {
//   const usersocket = useRef<SocketIOClient.Socket | null>(null);
//   const [message, setMessage] = useState<string>("");
//   const [sessionID, setSessionID] = useState<string | null>(
//     localStorage.getItem("sessionID") || null
//   );

//   interface Signuserdetails {
//     name: string;
//     email: string;
//     id: string;
//     phonenumber: string;
//   }

//   const [socketiamge, setimage] = useState<File | null>(null);
//   const [userdetails, setuserdetsils] = useState<Signuserdetails | null>(null);

//   const { data: session, status } = useSession();
//   console.log(`the returned session is present here ${session?.user?.name}`);
//   console.log(session?.user.phonenumber);

//   useEffect(() => {
//     if (
//       session &&
//       session.user &&
//       status === "authenticated" &&
//       !usersocket.current
//     ) {
//       console.log("i am making a connection now ");
//       const socket = io("http://localhost:3000", {
//         auth: {
//           sessionID: sessionID || null,
//           email: session.user?.email,
//           name: session?.user?.name,
//           phonenumber: session.user.phonenumber,
//         },
//       });

//       usersocket.current = socket;

//       socket.on("session", ({ sessionID }: { sessionID: string }) => {
//         setSessionID(sessionID);
//         localStorage.setItem("sessionID", sessionID);
//       });

//       socket.on("connect", () => {
//         console.log(
//           `A client with socket ID ${socket.id} connected to server with session ID ${sessionID}`
//         );
//         Getuserdetails();
//       });

//       const Getuserdetails = async () => {
//         const response = await axios.get(
//           "http://localhost:3000/user/getuserdetails"
//         );

//         console.log(response.data);
//       };

//       socket.on(
//         "sendimages",
//         function ({ imageUrl, from }: { imageUrl: string; from: string }) {
//           console.log(
//             `i got a image url from ${from} and the url is ${imageUrl}`
//           );
//         }
//       );

//       socket.on("disconnect", () => {
//         console.log("Disconnected");

//         usersocket.current = null;
//       });

//       socket.on(
//         "privatemessages",
//         function ({ from, message }: { from: string; message: string }) {
//           console.log(`From: ${from}, Message: ${message}`);
//         }
//       );
//     }
//   }, [sessionID]);

//   const handleSendMessage = async (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     const socket = usersocket.current;

//     if (socket) {
//       try {
//         socket.emit("privatemessages", {
//           to: "hNi0LXRqr8KHcgBPAAAF",
//           message: message,
//         });
//       } catch (e) {
//         console.log(e);
//       }

//       console.log(`Message sent: ${message}`);
//     } else {
//       console.log("Socket is not connected");
//     }
//   };

//   return (
//     <div>
//       WebSocket Connection
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//       />
//       <button onClick={handleSendMessage}>Send Message</button>
//       <h2> Send Images </h2>
//       <input
//         type="file"
//         name="image"
//         accept="image/**"
//         onChange={function (e) {
//           if (e.target.files && e.target.files[0]) {
//             setimage(e.target.files[0]);
//           }
//         }}
//       />
//       <button
//         onClick={async (e) => {
//           e.preventDefault();

//           if (!socketiamge) {
//             console.log("No image selected");
//             return;
//           }

//           try {
//             const formData = new FormData();
//             formData.append("image", socketiamge);

//             const response = await axios.post(
//               "http://localhost:3000/uploads/images",
//               formData,
//               {
//                 headers: {
//                   "Content-Type": "multipart/form-data",
//                 },
//               }
//             );

//             console.log(response.data);
//             if (
//               response.data &&
//               (response.data as { imageUrl: string }).imageUrl
//             ) {
//               console.log(
//                 "Image sent successfully:",
//                 (response.data as { imageUrl: string }).imageUrl
//               );
//             }

//             const socket = usersocket.current;

//             if (socket) {
//               socket.emit("sendimages", {
//                 from: socket.id,
//                 to: "hNi0LXRqr8KHcgBPAAAF",
//                 imageUrl: (response.data as { imageUrl: string }).imageUrl,
//               });
//             }
//           } catch (error) {
//             console.error("Error uploading image:", error);
//           }
//         }}
//       >
//         Send the image
//       </button>
//     </div>
//   );
// }

// export default App;

///////////////////////////

"use client";
import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { json } from "stream/consumers";

function App() {
  const usersocket = useRef<SocketIOClient.Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sessionID, setSessionID] = useState<string | null>(
    localStorage.getItem("sessionID") || null
  );

  const [allusers, setallusers] = useState<userdetails[]>([]);

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

  function userinfo(e: any) {
    console.log("i got clicked now");
  }

  const [socketImage, setImage] = useState<File | null>(null);
  // const [userDetails, setUserDetails] = useState<Signuserdetails | null>(null);

  // Use the session hook to get the session data

  const [cursockid, setcursockid] = useState<SocketIOClient.Socket | null>(
    null
  );

  const { data: session, status } = useSession();

  useEffect(() => {
    // Only proceed if session is available and not loading
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
        function ({ from, message }: { from: string; message: string }) {
          console.log(`From: ${from}, Message: ${message}`);
        }
      );
    }
  }, [sessionID, session, status]);

  const handleSendMessage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const socket = usersocket.current;

    if (socket) {
      try {
        socket.emit("privatemessages", {
          to: "hNi0LXRqr8KHcgBPAAAF",
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
    <div>
      WebSocket Connection
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
      {/* {JSON.stringify(allusers)} */}
      {allusers && (
        <button onClick={userinfo}>
          {allusers.map(function (val: any) {
            const userdetails = JSON.parse(val.userdetails); // Parse the userdetails string
            return (
              <div key={val.keyssid} className="">
                <h2>Socketid:{userdetails.socketid}</h2>
                <h2> Name{userdetails.name}</h2>
                <h2>phonenumber:{userdetails.phonenumber}</h2>
              </div>
            );
          })}
        </button>
      )}
    </div>
  );
}

export default App;
