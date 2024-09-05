"use client";
import axios from "axios";
import { useActionState, useState } from "react";

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
    <div>
      <input
        type="text"
        name="name"
        placeholder="enter your name"
        onChange={formachanges}
      ></input>
      <input
        type="email"
        name="email"
        onChange={formachanges}
        placeholder="enter your email"
      ></input>
      <input
        onChange={formachanges}
        type="password"
        name="password"
        placeholder="enter your password"
      ></input>
      <input
        onChange={formachanges}
        type="text"
        name="phonenumber"
        placeholder="enter your phonenumber"
      ></input>

      <button
        onClick={async function () {
          const { email, password, name, phonenumber } = form;

          if (!email || !password || !name || !phonenumber) {
            alert("enter all the fields ");
            return;
          }

          const response = await axios.post(
            "http://localhost:3000/user/signin",
            form
          );
          console.log(response.data);
        }}
      > Submit</button>
    </div>
  );
}
