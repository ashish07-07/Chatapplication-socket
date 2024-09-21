import express from "express";
import fileupload from "express-fileupload";
import { UploadedFile } from "express-fileupload";

const router = express.Router();
import { Request, Response } from "express";
router.use(express.json());

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

router.use(fileupload());

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const bucketName = process.env.AWS_S3_BUCKET;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing required environment variables for AWS S3.");
}

const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});
router.post("/images", async function (req: Request, res) {
  try {
    if (!req.files) {
      return res.status(400).send("No file uploaded.");
    }

    // @ts-ignore
    const image = req.files.image;

    console.log(image);

    if (!image) {
      return res.status(401).json({
        message: "errror no image in file",
      });
    }

    const uploadParams = {
      Bucket: bucketName,
      Key: image.name,
      Body: image.data,
      ContentType: image.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    // const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${image.name}`;
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${encodeURIComponent(
      image.name
    )}`;

    return res.status(201).json({
      message: "iamge stored in s3 bucket successfuly",
      imageurl: fileUrl,
    });
  } catch (e) {
    console.log(e);
  }
});

export default router;
