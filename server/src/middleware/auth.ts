import { NextFunction } from "express";
import jwt from "jsonwebtoken";
export function Tokenmiddleware(req: any, res: any, next: any) {
  try {
    const token = req.headers.autorization;

    const vtoken = jwt.verify(token, "ashish");

    if (vtoken) {
      next();
    }
  } catch (e) {
    console.log(e);
  }
}
