"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const constants_1 = require("../constants");
const { smtpHost, smtpPassword, smtpUser } = constants_1.variables.mail;
exports.transporter = nodemailer_1.default.createTransport({
    host: smtpHost,
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: smtpUser,
        pass: smtpPassword,
    },
});
const options = ({ to_email, from_email, subject, message }) => ({
    from: from_email,
    to: to_email,
    subject,
    html: `
            <div style="text-align:center;font-family:Arial,sans-serif;">
                <p style="color:black;font-size:16px ;margin-bottom:15px;">${message}</p>
                <b>
                <a href="https://localhost:8080" style="font-size:15px;color:white !important;background-color:black;border-radius:10px;padding:10px 20px;border:none;text-decoration:none ; display:inline-block;">
                Click Here
            </a>
            </b>
            </div>`
});
exports.options = options;
