"use client ";
import axios from "axios";
import { useState } from "react";

export function Signin() {
  const [form, setform] = useState({
    email: "",
    password: "",
  });

  function inputchanges(e: any) {
    const { name, value } = e.target;
    console.log(`the name is ${name}`);
    setform({
      ...form,
      [name]: value,
    });
  }
  return (
    <div>
      <input type="email" placeholder="Enter the email" name="email"></input>
      <input
        type="password"
        placeholder="enter your password"
        name="password"
      ></input>
      <button
        onClick={async function (e) {
          const response = await axios.post(
            "http://localhost:3000/user/signup",
            form
          );
          console.log(response.data);
        }}
      ></button>
    </div>
  );
}
