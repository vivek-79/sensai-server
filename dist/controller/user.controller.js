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
exports.getIndustryInsights = exports.onBoardingSubmit = exports.getUser = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const gemini_1 = require("../gemini");
const prompts_1 = require("../gemini/prompts");
const redis_1 = __importDefault(require("../middleware/redis"));
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.userId;
    try {
        const cachedUser = yield redis_1.default.get(`user:${id}`);
        if (cachedUser) {
            res.status(200).json({ user: JSON.parse(cachedUser), message: 'User Data Fetched (from cache)', success: true });
            return;
        }
        const user = yield prisma_1.default.user.findUnique({
            where: { id: id },
            select: {
                name: true,
                email: true,
                avatar: true
            }
        });
        if (!user) {
            res.status(404).json({ message: "User not found", success: false });
            return;
        }
        yield redis_1.default.setEx(`user:${id}`, 3600, JSON.stringify(user));
        res.status(200).json({ user, message: 'User Data Fetched', success: true });
        return;
    }
    catch (error) {
        res.json({ message: error.mssage, success: false });
        return;
    }
});
exports.getUser = getUser;
const onBoardingSubmit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.userId;
    const { experiance, industry, professionalBio, skills, specialization } = req.body;
    if (!(experiance || industry || professionalBio || skills || specialization)) {
        res.status(400).json({ message: 'Please provide all the details' });
        return;
    }
    try {
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            let industryInsight = yield tx.industryInsight.findUnique({
                where: { industry: industry },
            });
            if (!industryInsight) {
                const prompt = (0, prompts_1.insightPrompt)({ industry });
                const text = (0, gemini_1.getAiInsight)({ prompt });
                const cleanedText = (yield text).replace(/```(?:json)?\n?/g, "").trim();
                const result = JSON.parse(cleanedText);
                industryInsight = yield tx.industryInsight.create({
                    data: Object.assign(Object.assign({}, result), { industry: industry, nextUpdated: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }),
                });
            }
            yield tx.user.update({
                where: { id: id },
                data: {
                    bio: professionalBio,
                    experience: String(experiance),
                    skills,
                    industry,
                    specialization
                }
            });
            return true;
        }), {
            timeout: 10000,
        });
        res.status(201).json({ message: "User updated successfully", success: true });
        return;
    }
    catch (error) {
        console.log(error);
        res.json({ message: error.message, success: false });
        return;
    }
});
exports.onBoardingSubmit = onBoardingSubmit;
const getIndustryInsights = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { industry } = req.body;
    if (!industry) {
        res.status(400).json({ message: "No industry found", success: false });
    }
    try {
        const cachedInsight = yield redis_1.default.get(`insight:${industry}`);
        if (cachedInsight) {
            res.status(200).json({ insights: JSON.parse(cachedInsight), message: "Insights fetched successfully", success: true });
            return;
        }
        ;
        let insights = yield prisma_1.default.industryInsight.findUnique({
            where: { industry: industry }
        });
        if (!insights) {
            const prompt = (0, prompts_1.insightPrompt)({ industry });
            const text = (0, gemini_1.getAiInsight)({ prompt });
            const cleanedText = (yield text).replace(/```(?:json)?\n?/g, "").trim();
            const result = JSON.parse(cleanedText);
            insights = yield prisma_1.default.industryInsight.create({
                data: Object.assign(Object.assign({}, result), { industry: industry, nextUpdated: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }),
            });
        }
        yield redis_1.default.setEx(`insight:${industry}`, 3600, JSON.stringify(insights));
        res.status(200).json({ insights, message: "Insights fetched successfully", success: true });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error While fetching insights", success: true });
        return;
    }
});
exports.getIndustryInsights = getIndustryInsights;
