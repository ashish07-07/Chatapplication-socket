// "use client";
// import { useRef, useState, useEffect, useCallback } from "react";
// import io from "socket.io-client";
// import axios from "axios";
// import { useSession } from "next-auth/react";
// import { json } from "stream/consumers";

// import { Userdetails } from "../components/userdeatils";
// import { userInfo } from "os";

// function App() {
//   const usersocket = useRef<SocketIOClient.Socket | null>(null);

//   const [message, setMessage] = useState<string>("");
//   const [sessionID, setSessionID] = useState<string | null>(
//     localStorage.getItem("sessionID") || null
//   );

//   const [allusers, setallusers] = useState<userdetails[]>([]);

//   const [tomessage, settomessage] = useState<messagetotemplate>();

//   interface Signuserdetails {
//     name: string;
//     email: string;
//     id: string;
//     phonenumber: string;
//   }
//   interface userdetails {
//     keyssid: string;
//     userdetails: {
//       name: string;
//       socketid: string;
//       phonenumber: string;
//     };
//   }

//   interface messagetotemplate {
//     name: string;
//     socketid: string;
//     phonenumber: string;
//     email: string;
//   }

//   // const  userinfo= useCallback((userdetails: any) {
//   //   console.log("i got clicked now");
//   //   console.log(userdetails);
//   //   // settomessage(userdetails);
//   //   //messagetotemplate
//   // }

//   const userinfo = useCallback(
//     (userdetails: messagetotemplate) => {
//       console.log("i got clicked now");
//       settomessage(userdetails);
//     },
//     [tomessage]
//   );

//   const [socketImage, setImage] = useState<File | null>(null);
//   // const [userDetails, setUserDetails] = useState<Signuserdetails | null>(null);

//   // Use the session hook to get the session data

//   const [cursockid, setcursockid] = useState<SocketIOClient.Socket | null>(
//     null
//   );

//   const { data: session, status } = useSession();

//   useEffect(() => {
//     if (status === "authenticated" && session?.user && !usersocket.current) {
//       const socket = io("http://localhost:3000", {
//         auth: {
//           sessionID: sessionID || null,
//           email: session.user.email,
//           name: session.user.name,
//           phonenumber: session.user.phonenumber,
//         },
//       });

//       usersocket.current = socket;
//       setcursockid(socket); // here i have the current socket id

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
//         try {
//           const response = await axios.get(
//             "http://localhost:3000/user/getuserdetails"
//           );
//           console.log(response.data);
//           console.log(response.data.userdetails);

//           // console.log(`the respose i get is ${response.data.keyssid}`);
//           const details = response.data.userdetails;

//           const Allotherusers = details.filter(function (val: any) {
//             return val.keyssid != sessionID;
//           });

//           console.log(Allotherusers);
//           setallusers(Allotherusers);
//         } catch (error) {
//           console.error("Error fetching user details:", error);
//         }
//       };

//       socket.on(
//         "sendimages",
//         function ({ imageUrl, from }: { imageUrl: string; from: string }) {
//           console.log(`Received image from ${from}: ${imageUrl}`);
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
//   }, [sessionID, session, status]);

//   const handleSendMessage = async (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     const socket = usersocket.current;

//     if (socket) {
//       try {
//         socket.emit("privatemessages", {
//           to: "hNi0LXRqr8KHcgBPAAAF",
//           message: message,
//         });
//         console.log(`Message sent: ${message}`);
//       } catch (e) {
//         console.error("Error sending message:", e);
//       }
//     } else {
//       console.log("Socket is not connected");
//     }
//   };

//   return (
//     <div className="grid grid-cols-2 h-screen">
//       <div>
//         {allusers && (
//           <div>
//             {allusers.map(function (val: any) {
//               const userdetails = JSON.parse(val.userdetails);
//               console.log(userdetails);
//               return (
//                 <div key={val.keyssid} className="">
//                   <button
//                     onClick={function () {
//                       console.log("the user selected me now ");
//                       userinfo(userdetails);
//                     }}
//                   >
//                     <h2>Socketid: {userdetails.socketid}</h2>
//                     <h2>Name: {userdetails.name}</h2>
//                     <h2>Phonenumber: {userdetails.phonenumber}</h2>
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       <div>
//         WebSocket Connection
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//         />
//         <button onClick={handleSendMessage}>Send Message</button>
//         <h2> Send Images </h2>
//         <input
//           type="file"
//           name="image"
//           accept="image/**"
//           onChange={function (e) {
//             if (e.target.files && e.target.files[0]) {
//               setImage(e.target.files[0]);
//             }
//           }}
//         />
//         <button
//           onClick={async (e) => {
//             e.preventDefault();

//             if (!socketImage) {
//               console.log("No image selected");
//               return;
//             }

//             try {
//               const formData = new FormData();
//               formData.append("image", socketImage);

//               const response = await axios.post(
//                 "http://localhost:3000/uploads/images",
//                 formData,
//                 {
//                   headers: {
//                     "Content-Type": "multipart/form-data",
//                   },
//                 }
//               );

//               const { imageUrl } = response.data;
//               console.log("Image sent successfully:", imageUrl);

//               const socket = usersocket.current;
//               if (socket) {
//                 socket.emit("sendimages", {
//                   from: socket.id,
//                   to: "hNi0LXRqr8KHcgBPAAAF",
//                   imageUrl: imageUrl,
//                 });
//               }
//             } catch (error) {
//               console.error("Error uploading image:", error);
//             }
//           }}
//         >
//           Send the image
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;

/////////////////

"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useSession } from "next-auth/react";

function App() {
  const usersocket = useRef<SocketIOClient.Socket | null>(null);

  const [message, setMessage] = useState<string>("");
  const [sessionID, setSessionID] = useState<string | null>(
    localStorage.getItem("sessionID") || null
  );

  const [allusers, setallusers] = useState<userdetails[]>([]);
  const [tomessage, settomessage] = useState<messagetotemplate | null>(null); // Add a null initial state

  // Define interfaces
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

  // Memoize the userinfo function
  const userinfo = useCallback((userdetails: messagetotemplate) => {
    console.log("User selected:", userdetails);
    settomessage(userdetails);
  }, []);

  const { data: session, status } = useSession();

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

      socket.on("session", ({ sessionID }: { sessionID: string }) => {
        setSessionID(sessionID);
        localStorage.setItem("sessionID", sessionID);
      });

      socket.on("connect", () => {
        console.log(`Connected to server with session ID ${sessionID}`);
        Getuserdetails();
      });

      const Getuserdetails = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3000/user/getuserdetails"
          );
          console.log(response.data);
          // Ensure userdetails is an array
          const details = response.data.userdetails;

          const Allotherusers = details.filter(
            (val: any) => val.keyssid !== sessionID
          );
          console.log(Allotherusers);
          setallusers(Allotherusers);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      // Socket event listeners
      socket.on("disconnect", () => {
        console.log("Disconnected");
        usersocket.current = null;
      });

      socket.on("privatemessages", ({ from, message }) => {
        console.log(`From: ${from}, Message: ${message}`);
      });
    }
  }, [sessionID, session, status]);

  return (
    <div className="grid grid-cols-2 h-screen">
      <div>
        {allusers && (
          <div>
            {allusers.map((val: userdetails) => {
              const userdetails =
                typeof val.userdetails === "string"
                  ? JSON.parse(val.userdetails)
                  : val.userdetails;
              return (
                <div key={val.keyssid}>
                  <button onClick={() => userinfo(userdetails)}>
                    <h2>Socketid: {userdetails.socketid}</h2>
                    <h2>Name: {userdetails.name}</h2>
                    <h2>Phonenumber: {userdetails.phonenumber}</h2>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>{/* Remaining code for WebSocket and sending messages */}</div>
    </div>
  );
}

export default App;
