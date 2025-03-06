"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const limiter = ({ window, limit }) => (0, express_rate_limit_1.default)({
    windowMs: window * 60 * 1000,
    limit: limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    statusCode: 429,
    message: { message: 'Hold on for some time you requested to much', success: false }
});
exports.limiter = limiter;
