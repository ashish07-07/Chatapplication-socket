"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenmiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function Tokenmiddleware(req, res, next) {
    try {
        const token = req.headers.autorization;
        const vtoken = jsonwebtoken_1.default.verify(token, "ashish");
        if (vtoken) {
            next();
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.Tokenmiddleware = Tokenmiddleware;
