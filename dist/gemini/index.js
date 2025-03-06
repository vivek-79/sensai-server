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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiInsight = void 0;
const generative_ai_1 = require("@google/generative-ai");
const constants_1 = require("../constants");
const genAI = new generative_ai_1.GoogleGenerativeAI(constants_1.variables.geminiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const getAiInsight = (_a) => __awaiter(void 0, [_a], void 0, function* ({ prompt }) {
    try {
        const result = yield model.generateContent(prompt);
        if (!result.response || !result.response.text) {
            throw new Error("Invalid AI response format");
        }
        return result.response.text();
    }
    catch (error) {
        console.error("Error generating AI insight:", error);
        return ""; // Return empty string to prevent crashes
    }
});
exports.getAiInsight = getAiInsight;
