import { NextFunction } from "express";
import jwt from "jsonwebtoken";
export function Tokenmiddleware(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization;

    console.log("I AM INSIDE THE MIDDLEWARE");

    const vtoken = jwt.verify(token, "ashish");

    if (vtoken) {
      next();
    }
  } catch (e) {
    console.log("i did not get any token");
    console.log(e);
  }
}
