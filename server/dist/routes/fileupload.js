"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const route = express_1.default.Router();
const testre = path_1.default.join(__dirname, "..", "..", "images");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        console.log(file);
        cb(null, testre);
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage: storage });
route.post("/images", upload.single("image"), function (req, res) {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    res.set("Access-Control-Allow-Origin", "http://localhost:5173");
    const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
    return res.json({
        imageUrl,
    });
});
exports.default = route;
