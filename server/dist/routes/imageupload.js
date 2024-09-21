"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const router = express_1.default.Router();
router.use(express_1.default.json());
const client_s3_1 = require("@aws-sdk/client-s3");
router.use((0, express_fileupload_1.default)());
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const bucketName = process.env.AWS_S3_BUCKET;
if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing required environment variables for AWS S3.");
}
const s3Client = new client_s3_1.S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});
router.post("/images", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const command = new client_s3_1.PutObjectCommand(uploadParams);
            yield s3Client.send(command);
            // const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${image.name}`;
            const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${encodeURIComponent(image.name)}`;
            return res.status(201).json({
                message: "iamge stored in s3 bucket successfuly",
                imageurl: fileUrl,
            });
        }
        catch (e) {
            console.log(e);
        }
    });
});
exports.default = router;
