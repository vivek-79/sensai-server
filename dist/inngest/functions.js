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
exports.updateInsights = exports.industries = void 0;
const gemini_1 = require("../gemini");
const prompts_1 = require("../gemini/prompts");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.industries = [
    "Technology",
    "Financial Services",
    "Healthcare & Life Sciences",
    "Manufacturing & Industrial",
    "Retail & E-commerce",
    "Media & Entertainment",
    "Education & Training",
    "Energy & Utilities",
    "Professional Services",
    "Telecommunications",
    "Transportation & Logistics",
    "Agriculture & Food",
    "Construction & Real Estate",
    "Hospitality & Tourism",
    "Non-Profit & Social Services",
];
const updateInsights = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const industry of exports.industries) {
        try {
            const prompt = (0, prompts_1.insightPrompt)({ industry });
            const text = yield (0, gemini_1.getAiInsight)({ prompt });
            const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
            const result = JSON.parse(cleanedText);
            yield prisma_1.default.industryInsight.update({
                where: { industry: industry },
                data: Object.assign(Object.assign({}, result), { nextUpdated: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
            });
            console.log(`Updated insights for ${industry}`);
        }
        catch (error) {
            console.error(`Error updating ${industry}:`, error);
        }
    }
});
exports.updateInsights = updateInsights;
