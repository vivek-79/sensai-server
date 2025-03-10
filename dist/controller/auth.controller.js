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
exports.logout = exports.resetPassword = exports.verifyOtp = exports.generateOtp = exports.signin = exports.signup = void 0;
const zod_1 = require("../lib/zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../constants");
const mailer_1 = require("../lib/mailer");
//generating cookies
const secrets = constants_1.variables.secrets;
const { accessTokenSecret, refreshTokenSecret, } = secrets;
const generateCookie = ({ id }) => {
    const accessToken = jsonwebtoken_1.default.sign({
        id,
    }, accessTokenSecret, {
        expiresIn: "1d"
    });
    const refreshToken = jsonwebtoken_1.default.sign({
        id,
    }, refreshTokenSecret, {
        expiresIn: "7d"
    });
    return { accessToken, refreshToken };
};
const option = ({ day }) => {
    return {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: day * 24 * 60 * 60 * 1000
    };
};
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const result = zod_1.signInValidation.safeParse(body);
    try {
        if (!result.success) {
            const error = { message: [] };
            result.error.issues.forEach((issue) => {
                error['message'].push(issue.message);
            });
            const message = error.message.join(',');
            res.status(400).json({ message, success: false });
            return;
        }
        const { name, email, password } = body;
        //already user
        const isUserExist = yield prisma_1.default.user.findFirst({
            where: { email: email }
        });
        if (isUserExist) {
            res.status(409).json({ message: "User already exist with this email try loginin in", success: false });
            return;
        }
        //hashing password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        //create user
        const newUser = yield prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        if (!newUser) {
            res.status(500).json({ message: "Server error please try again", success: false });
            return;
        }
        //otp generation
        const otp = Math.floor(100000 + Math.random() * 900000);
        const subject = 'Welcome to Sensai';
        const message = `Your account has been created successfully. Use this OTP:<b style="color:red;">${otp}</b> to verify your account. Or click below`;
        const mailoption = (0, mailer_1.options)({ to_email: email, from_email: String(constants_1.variables.mail.smtpUser), subject, message });
        yield mailer_1.transporter.sendMail(mailoption, (err) => {
            if (err) {
                res.status(500).json({ message: "Failed to send email but account created try loggin In", success: false });
            }
            else {
                const { accessToken, refreshToken } = generateCookie({ id: newUser === null || newUser === void 0 ? void 0 : newUser.id });
                res.status(201)
                    .cookie('accessToken', accessToken, option({ day: 1 }))
                    .cookie('refreshToken', refreshToken, option({ day: 7 }))
                    .json({ success: true, message: "Account created successfully" });
                return;
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message, success: false });
        return;
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const result = zod_1.signInValidation.safeParse(body);
    if (!result.success) {
        const error = { message: [] };
        result.error.issues.forEach((issue) => {
            error['message'].push(issue.message);
        });
        const message = error.message.join(',');
        res.status(400).json({ message, success: false });
        return;
    }
    const { email, password } = body;
    //already user
    try {
        const isUserExist = yield prisma_1.default.user.findFirst({
            where: { email: email }
        });
        if (!isUserExist) {
            res.status(404).json({ message: "No user found with this email first create an account", success: false });
            return;
        }
        //checking password
        const ispasswordCorrect = yield bcrypt_1.default.compare(password, isUserExist.password);
        if (!ispasswordCorrect) {
            res.status(400).json({ message: "Wrong password", success: false });
            return;
        }
        const { accessToken, refreshToken } = generateCookie({ id: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.id });
        res.status(200)
            .cookie('accessToken', accessToken, option({ day: 1 }))
            .cookie('refreshToken', refreshToken, option({ day: 7 }))
            .json({ success: true, message: "Logged In Successfully" });
        return;
    }
    catch (error) {
        //error message 
        res.status(500).json({ message: error.message, success: false });
        return;
    }
});
exports.signin = signin;
const generateOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Please provide your email", success: false });
        return;
    }
    try {
        const isUserExist = yield prisma_1.default.user.findFirst({
            where: { email: email }
        });
        if (!isUserExist) {
            res.status(404).json({ message: "No user found with this email first create an account", success: false });
            return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const subject = 'Reset Password';
        const message = `Otp has been generated to reset to your password.It is valid for 15 minutes only Use this OTP:<b style="color:red;">${otp}</b> to reset your Password. Click below`;
        const mailoption = (0, mailer_1.options)({ to_email: email, from_email: String(constants_1.variables.mail.smtpUser), subject, message });
        yield mailer_1.transporter.sendMail(mailoption, (err) => {
            if (err) {
                res.status(500).json({ message: "Failed to send email but account created try loggin In", success: false });
            }
            else { //working---on route
                res.status(201)
                    .json({ success: true, message: "Otp sent successfully" });
                return;
            }
        });
        yield prisma_1.default.user.update({
            where: { email: email },
            data: {
                otp: String(otp),
                otpValidity: new Date(Date.now() + 15 * 60 * 1000)
            }
        });
    }
    catch (error) {
        res.status(500)
            .json({ success: false, message: "Server error please try again" });
        return;
    }
});
exports.generateOtp = generateOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    if (!otp || !email) {
        res.status(400).json({ message: "Please provide your email and otp", success: false });
        return;
    }
    try {
        const isUserExist = yield prisma_1.default.user.findFirst({
            where: { email: email }
        });
        if (!isUserExist) {
            res.status(404).json({ message: "No user found with this email first create an account", success: false });
            return;
        }
        if (!(otp == isUserExist.otp)) {
            res.status(400).json({ message: "Wrong OTP", success: false });
            return;
        }
        if (!isUserExist.otpValidity) {
            res.status(400).json({ message: "Apply to reset password first", success: false });
            return;
        }
        else {
            if (isUserExist.otpValidity < new Date(Date.now())) {
                res.status(400).json({ message: "OTP Expired", success: false });
                return;
            }
            else {
                res.status(201)
                    .json({ success: true, message: "Otp verified" });
                return;
            }
        }
    }
    catch (error) {
        res.status(500)
            .json({ success: false, message: "Server error please try again" });
        return;
    }
});
exports.verifyOtp = verifyOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!password || !email) {
        res.status(400).json({ message: "Please provide your email and Password", success: false });
        return;
    }
    try {
        const isUserExist = yield prisma_1.default.user.findFirst({
            where: { email: email }
        });
        if (!isUserExist) {
            res.status(404).json({ message: "No user found with this email first create an account", success: false });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield prisma_1.default.user.update({
            where: { email: email },
            data: {
                password: hashedPassword
            }
        });
        const { accessToken, refreshToken } = generateCookie({ id: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.id });
        res.status(200)
            .cookie('accessToken', accessToken, option({ day: 1 }))
            .cookie('refreshToken', refreshToken, option({ day: 7 }))
            .json({ success: true, message: "Password reset Successfully" });
        return;
    }
    catch (error) {
        res.status(500)
            .json({ success: false, message: "Server error please try again" });
        return;
    }
});
exports.resetPassword = resetPassword;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200)
            .clearCookie('accessToken')
            .clearCookie('refreshToken')
            .json({ success: true, message: "Logout Successfully" });
        return;
    }
    catch (error) {
        res.status(500)
            .json({ success: false, message: "Server error please try again" });
        return;
    }
});
exports.logout = logout;
