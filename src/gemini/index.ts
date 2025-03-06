

import  { GoogleGenerativeAI } from '@google/generative-ai' ;
import { variables } from '../constants';

const genAI = new GoogleGenerativeAI(variables.geminiKey|| "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


export const getAiInsight =async({prompt}:{prompt:string})=>{

    try {
        const result = await model.generateContent(prompt);
        if (!result.response || !result.response.text) {
            throw new Error("Invalid AI response format");
        }
        return result.response.text();
    } catch (error) {
        console.error("Error generating AI insight:", error);
        return ""; // Return empty string to prevent crashes
    }
}