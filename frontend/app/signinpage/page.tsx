"use client";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
export default function Signin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function inputchanges(e: any) {
    const { name, value } = e.target;
    console.log(`The name is ${name}`);
    setForm({
      ...form,
      [name]: value,
    });
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 m-2">
      <div className="shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Sign In
        </h2>
        <input
          className="w-full text-black p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          placeholder="Enter your email"
          name="email"
          value={form.email}
          onChange={inputchanges}
        />
        <input
          className="w-full text-black p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Enter your password"
          name="password"
          value={form.password}
          onChange={inputchanges}
        />
        <button
          className="w-full bg-orange-500 text-white p-2 rounded-lg hover:bg-blue-600"
          onClick={async function (e) {
            e.preventDefault();
            try {
              const response = await axios.post(
                "http://localhost:3000/user/signin",
                form,
                {
                  headers: {
                    authorization: localStorage.getItem("token"),
                  },
                }
              );
              console.log(response.data);
            } catch (error) {
              console.error("Error during sign-in", error);
            }
          }}
        >
          Sign In
        </button>

        <Link href={"/signup"}>
          <button className="w-full bg-orange-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4">
            {" "}
            Not Registerd Signup then
          </button>
        </Link>
      </div>
    </div>
  );
}
