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
exports.deleteResume = exports.improveWithAi = exports.getResume = exports.saveResume = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const prompts_1 = require("../gemini/prompts");
const gemini_1 = require("../gemini");
// import client from "../middleware/redis";
const saveResume = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.userId;
    const { previewContent } = req.body;
    try {
        const resume = yield prisma_1.default.resume.upsert({
            where: {
                userId: id,
            },
            update: {
                content: previewContent,
            },
            create: {
                userId: id,
                content: previewContent,
            }
        });
        res.status(201).json({ resume, message: 'Resume saved suuccessfully', success: true });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving resume', success: false });
        return;
    }
});
exports.saveResume = saveResume;
const getResume = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.userId;
    try {
        // const cachedResume = await client.get(`Resume:${id}`)
        // if (cachedResume) {
        //     res.status(200).json({ resume: JSON.parse(cachedResume), message: "Assessments fetched successfully", success: true });
        //     return;
        // }
        const resume = yield prisma_1.default.resume.findUnique({
            where: {
                userId: id,
            }
        });
        if (resume) {
            // await client.setEx(`Resume:${id}`, 600, JSON.stringify(resume))
            res.status(200).json({ resume, message: 'Resume fetched suuccessfully', success: true });
            return;
        }
        else {
            res.status(400).json({ message: 'No resume found', success: false });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting resume', success: false });
        return;
    }
});
exports.getResume = getResume;
const improveWithAi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.userId;
    const { current, type } = req.body;
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: id }
        });
        if (!user) {
            res.status(400).json({ message: 'No user found', success: false });
            return;
        }
        const prompt = (0, prompts_1.resumeImmprove)({ industry: user.industry, current: current, type: type });
        const text = yield (0, gemini_1.getAiInsight)({ prompt });
        const result = text.trim();
        res.status(201).json({ result, message: 'Content improved suuccessfully', success: true });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting resume', success: false });
        return;
    }
});
exports.improveWithAi = improveWithAi;
const deleteResume = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.userId;
    try {
        // await client.del(`Resume:${id}`);
        const delet = yield prisma_1.default.resume.delete({
            where: {
                userId: id,
            }
        });
        if (delet) {
            res.status(200).json({ message: 'Resume fetched suuccessfully', success: true });
            return;
        }
        else {
            res.status(400).json({ message: 'No resume found', success: false });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting resume', success: false });
        return;
    }
});
exports.deleteResume = deleteResume;
