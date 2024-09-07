// "use client";
// import axios from "axios";
// import { useActionState, useState } from "react";

// export default function Signup() {
//   function formachanges(e: any) {
//     const { name, value } = e.target;

//     setformdata({
//       ...form,
//       [name]: value,
//     });
//   }

//   const [form, setformdata] = useState({
//     email: "",
//     password: "",
//     name: "",
//     phonenumber: "",
//   });
//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-white ">
//       <div className="flex flex-col">
//         <input
//           type="text"
//           name="name"
//           placeholder="enter your name"
//           onChange={formachanges}
//         ></input>
//         <input
//           type="email"
//           name="email"
//           onChange={formachanges}
//           placeholder="enter your email"
//         ></input>
//         <input
//           onChange={formachanges}
//           type="password"
//           name="password"
//           placeholder="enter your password"
//         ></input>
//         <input
//           onChange={formachanges}
//           type="text"
//           name="phonenumber"
//           placeholder="enter your phonenumber"
//         ></input>

//         <button
//           className="text-black"
//           onClick={async function () {
//             const { email, password, name, phonenumber } = form;

//             if (!email || !password || !name || !phonenumber) {
//               alert("enter all the fields ");
//               return;
//             }

//             const response = await axios.post(
//               "http://localhost:3000/user/signup",
//               form
//             );
//             console.log(response.data.token);
//             localStorage.setItem("token",response.data.token)
//           }}
//         >
//           {" "}
//           Submit
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";
import axios from "axios";
import { useState } from "react";

export default function Signup() {
  function formachanges(e: any) {
    const { name, value } = e.target;

    setformdata({
      ...form,
      [name]: value,
    });
  }

  const [form, setformdata] = useState({
    email: "",
    password: "",
    name: "",
    phonenumber: "",
  });

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 m-2">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Sign Up
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          onChange={formachanges}
          className="w-full text-black p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          name="email"
          onChange={formachanges}
          placeholder="Enter your email"
          className="w-full p-2 border text-black border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          onChange={formachanges}
          type="password"
          name="password"
          placeholder="Enter your password"
          className="w-full p-2 border text-black border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          onChange={formachanges}
          type="text"
          name="phonenumber"
          placeholder="Enter your phone number"
          className="w-full p-2 border text-black border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={async function () {
            const { email, password, name, phonenumber } = form;

            if (!email || !password || !name || !phonenumber) {
              alert("Please fill all the fields.");
              return;
            }

            const response = await axios.post(
              "http://localhost:3000/user/signup",
              form
            );
            console.log(response.data.token);
            localStorage.setItem("token", response.data.token);
          }}
          className="w-full bg-orange-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
