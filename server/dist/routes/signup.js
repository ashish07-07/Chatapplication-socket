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
const db_1 = __importDefault(require("../db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const route = express_1.default.Router();
route.use(express_1.default.json());
route.post("/signup", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, email, phonenumber, password } = req.body;
            console.log(`the name is ${name} and the email is ${email} and the phonenumber ${phonenumber}`);
            const encryptedpassword = yield bcrypt_1.default.hash(password, 10);
            const userdetails = yield db_1.default.user.create({
                data: {
                    name: name,
                    email: email,
                    phonenumber: phonenumber,
                    password: encryptedpassword,
                },
            });
            const token = jsonwebtoken_1.default.sign({ email }, "ashish");
            res.set("Access-Control-Allow-Origin", "http://localhost:3001");
            return res.status(201).json({
                message: "Sign up successful",
                user: userdetails,
                token,
            });
        }
        catch (e) {
            console.log(e);
        }
    });
});
exports.default = route;
