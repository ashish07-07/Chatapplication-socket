import express from "express";
import { Request, Response } from "express";
import redisClient from "../redisclient/client";

const router = express.Router();

router.get("/getuserdetails", async function (req: Request, res: Response) {
  console.log("I GOT CALLED NOW ");
  try {
    const keys = await redisClient.KEYS("*");

    if (!keys) {
      console.log("no keys found");
      return res.status(401).json({
        message: "no users regisered",
      });
    }

    const values = await redisClient.MGET(keys);

    res.set("Access-Control-Allow-Origin", "http://localhost:3001");

    const result = keys.map(function (val, index) {
      return {
        keyssid: val,
        userdetails: values[index],
      };
    });

    console.log(values);

    return res.status(201).json({
      userdetails: result,
    });
  } catch (e) {
    console.log(e);
  }
});

export default router;
