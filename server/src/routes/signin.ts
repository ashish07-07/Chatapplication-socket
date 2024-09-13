import express from "express";
import prisma from "../db";
import { Tokenmiddleware } from "../middleware/auth";

const router = express.Router();
import { Request, Response } from "express";
import bcrypt from "bcrypt";

router.post(
  "/signin",
  // Tokenmiddleware,
  async function (req: Request, res: Response) {
    const { email, password } = req.body;

    const userfound = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!userfound) {
      return res.status(201).json({
        message: "enter the right users credentials",
      });
    }

    if (userfound) {
      const check = await bcrypt.compare(password, userfound.password);

      if (!check) {
        return res.status(401).json({
          message: "enter the correct password",
        });
      }

      res.status(201).json({
        message: "welcome back  i am the worst coder ",
      });
    }
  }
);

export default router;
