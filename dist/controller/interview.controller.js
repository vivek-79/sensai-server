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
exports.getAllAssessments = exports.saveQuizResult = exports.generateQuiz = void 0;
const prompts_1 = require("../gemini/prompts");
const gemini_1 = require("../gemini");
const prisma_1 = __importDefault(require("../lib/prisma"));
const redis_1 = __importDefault(require("../middleware/redis"));
const generateQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.userId;
        const user = yield prisma_1.default.user.findUnique({
            where: { id: id }
        });
        if (!user) {
            res.status(400).json({ message: "No user found", success: false });
            return;
        }
        const prompt = (0, prompts_1.generateQuizPrompt)({ industry: user === null || user === void 0 ? void 0 : user.industry, skills: user === null || user === void 0 ? void 0 : user.skills });
        const text = (0, gemini_1.getAiInsight)({ prompt });
        const cleanedText = (yield text).replace(/```(?:json)?\n?/g, "").trim();
        const result = JSON.parse(cleanedText);
        res.status(201).json({ result, message: "Quiz created", success: false });
        return;
    }
    catch (error) {
        res.status(201).json({ message: error === null || error === void 0 ? void 0 : error.message, success: false });
        return;
    }
});
exports.generateQuiz = generateQuiz;
const saveQuizResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.userId;
        const { questions, score, wrongAnswers, correctAnswer, wrongAsnweredQuestion, answers } = req.body;
        const user = yield prisma_1.default.user.findUnique({
            where: { id: id }
        });
        if (!user) {
            res.status(400).json({ message: "No user found", success: false });
            return;
        }
        let improvementTip = null;
        if (wrongAnswers.length > 0) {
            const wrongAnswerText = wrongAnswers.map((q, indx) => `Question: "${wrongAsnweredQuestion[indx]}"\nCorrect Answer: "${correctAnswer[indx]}"\nUser Answer: "${wrongAnswers[indx]}" 
            `).join("\n\n");
            const improvementPrompt = `
            The user got the following ${user.industry} technical interview questions wrong:

            ${wrongAnswerText}

            Based on these mistakes, provide a concise, specific improvement tip.
            Focus on the knowledge gaps revelead by these wrong answers,
            Keep the response under 2 sentences and make it encouraging,
            Don't explicitly mention the mistakes, instead focus on what to learn/practice.
            `;
            try {
                const prompt = improvementPrompt;
                const text = yield (0, gemini_1.getAiInsight)({ prompt });
                improvementTip = text.trim();
                const data = [
                    questions,
                    answers
                ];
                yield prisma_1.default.assessment.create({
                    data: {
                        userId: id,
                        quizScore: Number(score),
                        questions: data,
                        category: user.industry,
                        improvmentTip: improvementTip,
                    }
                });
                yield redis_1.default.del(`Assessment:${id}`);
                res.status(201).json({ message: improvementTip, success: true });
                return;
            }
            catch (error) {
                console.log('Error generating improvement tip:', error);
            }
        }
        ;
    }
    catch (error) {
        res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message, success: false });
        return;
    }
});
exports.saveQuizResult = saveQuizResult;
const getAllAssessments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.userId;
    try {
        const cachedAssessment = yield redis_1.default.get(`Assessment:${id}`);
        if (cachedAssessment) {
            res.status(200).json({ data: JSON.parse(cachedAssessment), message: "Assessments fetched successfully", success: true });
            return;
        }
        const data = yield prisma_1.default.assessment.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'asc' },
        });
        if (!data) {
            res.status(400).json({ message: " No Assessments found", success: true });
            return;
        }
        yield redis_1.default.setEx(`Assessment:${id}`, 600, JSON.stringify(data));
        res.status(200).json({ data, message: "Assessments fetched successfully", success: true });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server error try after sometime", success: false });
        return;
    }
});
exports.getAllAssessments = getAllAssessments;
