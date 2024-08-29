import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

function App() {
  const usersocket = useRef<SocketIOClient.Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sessionID, setSessionID] = useState<string | null>(
    localStorage.getItem("sessionID") || null
  );

  const [socketiamge, setimage] = useState<File | null>(null);

  useEffect(() => {
    if (!usersocket.current) {
      const socket = io("http://localhost:3000", {
        auth: {
          sessionID: sessionID || null,
          email: "bkashish077",
          name: "Ashish",
        },
      });

      usersocket.current = socket;

      socket.on("session", ({ sessionID }: { sessionID: string }) => {
        setSessionID(sessionID);
        localStorage.setItem("sessionID", sessionID);
      });

      socket.on("connect", () => {
        console.log(
          `A client with socket ID ${socket.id} connected to server with session ID ${sessionID}`
        );
      });

      socket.on(
        "sendimages",
        function ({ imageUrl, from }: { imageUrl: string; from: string }) {
          console.log(
            `i got a image url from ${from} and the url is ${imageUrl}`
          );
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
  }, [sessionID]);

  const handleSendMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const socket = usersocket.current;

    if (socket) {
      socket.emit("privatemessages", {
        to: "hNi0LXRqr8KHcgBPAAAF",
        message: message,
      });
      console.log(`Message sent: ${message}`);
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
            setimage(e.target.files[0]);
          }
        }}
      />
      <button
        onClick={async (e) => {
          e.preventDefault();

          if (!socketiamge) {
            console.log("No image selected");
            return;
          }

          try {
            const formData = new FormData();
            formData.append("image", socketiamge);

            const response = await axios.post(
              "http://localhost:3000/uploads/images",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            console.log(response.data);
            if (
              response.data &&
              (response.data as { imageUrl: string }).imageUrl
            ) {
              console.log(
                "Image sent successfully:",
                (response.data as { imageUrl: string }).imageUrl
              );
            }

            const socket = usersocket.current;

            if (socket) {
              socket.emit("sendimages", {
                from: socket.id,
                to: "hNi0LXRqr8KHcgBPAAAF",
                imageUrl: (response.data as { imageUrl: string }).imageUrl,
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
  );
}

export default App;
