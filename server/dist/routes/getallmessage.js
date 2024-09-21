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
router.get("/messages", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fromphonenumber = req.query.fromphonenumber;
            const tophonenumber = req.query.tophonenumber;
            const response = yield db_1.default.message.findMany({
                where: {
                    OR: [
                        {
                            fromphonenumber: fromphonenumber,
                            tophonenumber: tophonenumber,
                        },
                        {
                            fromphonenumber: tophonenumber,
                            tophonenumber: fromphonenumber,
                        },
                    ],
                },
                orderBy: {
                    timestamp: "asc",
                },
            });
            console.log(response);
            res.set("Access-Control-Allow-Origin", "http://localhost:3001");
            return res.status(201).json({
                response,
            });
        }
        catch (e) {
            console.log(e);
            return res.status(500).send("Server error");
        }
    });
});
exports.default = router;
