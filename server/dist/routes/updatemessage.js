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
router.post("/updatethemessage", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        try {
            const response = yield db_1.default.message.updateMany({
                where: {
                    fromsocketid: body.from,
                    tosocketid: body.to,
                    fromphonenumber: body.fromphonenumber,
                    tophonenumber: body.tophonenumber,
                },
                data: {
                    isread: true,
                },
            });
            return res.status(201).json({
                response,
            });
        }
        catch (e) {
            console.log(e);
        }
    });
});
