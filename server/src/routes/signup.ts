import express from "express";
import { Request, Response } from "express";
import prisma from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const route = express.Router();

route.use(express.json());

route.post("/signup", async function (req: Request, res: Response) {
  try {
    const { name, email, phonenumber, password } = req.body;

    console.log(
      `the name is ${name} and the email is ${email} and the phonenumber ${phonenumber}`
    );

    const encryptedpassword = await bcrypt.hash(password, 10);

    const userdetails = await prisma.user.create({
      data: {
        name: name,
        email: email,
        phonenumber: phonenumber,
        password: encryptedpassword,
      },
    });

    const token = jwt.sign({ email }, "ashish");

    return res.status(201).json({
      message: "Sign up successful",
      token,
    });
  } catch (e) {
    console.log(e);
  }
});

export default route;
