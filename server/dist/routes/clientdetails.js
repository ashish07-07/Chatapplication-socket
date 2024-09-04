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
const client_1 = __importDefault(require("../redisclient/client"));
const router = express_1.default.Router();
router.get("/getuserdetails", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("I GOT CALLED NOW ");
        try {
            const keys = yield client_1.default.KEYS("*");
            if (!keys) {
                console.log("no keys found");
                return res.status(401).json({
                    message: "no users regisered",
                });
            }
            const values = yield client_1.default.MGET(keys);
            res.set("Access-Control-Allow-Origin", "http://localhost:5173");
            const result = keys.map(function (val, index) {
                return {
                    keyssid: val,
                    userdetails: values[index],
                };
            });
            console.log(values);
            return res.status(201).json({
                userdetails: result,
            });
        }
        catch (e) {
            console.log(e);
        }
    });
});
exports.default = router;
