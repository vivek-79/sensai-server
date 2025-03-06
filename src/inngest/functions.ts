import { getAiInsight } from "../gemini";
import { insightPrompt } from "../gemini/prompts";
import prisma from "../lib/prisma";



export const industries: string[] = [
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

export const updateInsights = async () => {

    for(const industry of industries) {
        try {
            const prompt = insightPrompt({ industry })
            const text = await getAiInsight({ prompt });
            const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim()
            const result = JSON.parse(cleanedText);
    
    
             await prisma.industryInsight.update({
                where: { industry: industry },
                data: {
                    ...result,
                    nextUpdated: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            },
            )
            console.log(`Updated insights for ${industry}`);
        } catch (error) {
            console.error(`Error updating ${industry}:`, error);
        }
    }
}