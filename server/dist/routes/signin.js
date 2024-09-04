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
const router = express_1.default.Router();
const bcrypt_1 = __importDefault(require("bcrypt"));
router.post("/signin", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        const userfound = yield db_1.default.user.findFirst({
            where: {
                email: email,
            },
        });
        if (!userfound) {
            return res.status(201).json({
                message: "enter the right users credentials",
            });
        }
        if (userfound) {
            const check = yield bcrypt_1.default.compare(password, userfound.password);
            if (!check) {
                return res.status(401).json({
                    message: "enter the correct password",
                });
            }
            res.status(201).json({
                message: "welcome back  i am the worst coder ",
            });
        }
    });
});
exports.default = router;
