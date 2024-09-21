import express from "express";
import { Request, Response } from "express";
import prisma from "../db";

const router = express.Router();

router.get("/messages", async function (req: Request, res: Response) {
  try {
    const fromphonenumber = req.query.fromphonenumber as string;
    const tophonenumber = req.query.tophonenumber as string;

    const response = await prisma.message.findMany({
      where: {
        OR: [
          {
            fromphonenumber: fromphonenumber,
            tophonenumber: tophonenumber,
          },
          {
            fromphonenumber: tophonenumber,
            tophonenumber: fromphonenumber,
          },
        ],
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    console.log(response);

    res.set("Access-Control-Allow-Origin", "http://localhost:3001");

    return res.status(201).json({
      response,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send("Server error");
  }
});

export default router;
