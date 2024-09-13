"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
export default function SignIn() {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    phonenumber: "",
  });

  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      ...credentials,
      redirect: false, // Disable redirect to manually handle error/success
    });

    if (res?.error) {
      console.log("error having");
      console.error(res.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Sign In</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium  text-black">Name</label>
          <input
            type="text"
            value={credentials.name}
            onChange={(e) =>
              setCredentials({ ...credentials, name: e.target.value })
            }
            className="mt-1 p-2 block w-full border text-black border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
            className="mt-1 p-2 block w-full text-black border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            className="mt-1 p-2 block w-full text-black border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="text"
            value={credentials.phonenumber}
            onChange={(e) =>
              setCredentials({ ...credentials, phonenumber: e.target.value })
            }
            className="mt-1 p-2 block w-full text-black border border-gray-300 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-orange-500 text-white rounded-md shadow hover:bg-orange-600 transition duration-200"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
