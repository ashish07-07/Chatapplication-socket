import { dir } from "console";
import express, { Router } from "express";
import { Response } from "express";
import multer from "multer";
import path from "path";

const route = express.Router();

const testre = path.join(__dirname, "..", "..", "images");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, testre);
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

route.post("/images", upload.single("image"), function (req, res) {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  res.set("Access-Control-Allow-Origin", "http://localhost:5173");

  const imageUrl = `${req.protocol}://${req.get("host")}/images/${
    req.file.filename
  }`;
  return res.json({
    imageUrl,
  });
});
export default route;
