import express from "express";
import prisma from "../db";

const router = express.Router();

import { Request, Response } from "express";

interface Messagetemplate {
  from: string;
  to: string;
  fromphonenumber: string;
  tophonenumber: string;
}

router.post("/updatethemessage", async function (req: Request, res: Response) {
  const body: Messagetemplate = req.body;

  try {
    const response = await prisma.message.updateMany({
      where: {
        fromsocketid: body.from,
        tosocketid: body.to,
        fromphonenumber: body.fromphonenumber,
        tophonenumber: body.tophonenumber,
      },

      data: {
        isread: true,
      },
    });

    return res.status(201).json({
      response,
    });
  } catch (e) {
    console.log(e);
  }
});
