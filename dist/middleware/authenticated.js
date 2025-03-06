"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../constants");
const authenticateUser = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized', success: false });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, constants_1.variables.secrets.accessTokenSecret);
        req.userId = decoded; // Attach user data to request
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token', success: false });
        return;
    }
};
exports.authenticateUser = authenticateUser;
