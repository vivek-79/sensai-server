import { Response } from "express";
import { generateQuizPrompt } from "../gemini/prompts";
import { getAiInsight } from "../gemini";
import prisma from "../lib/prisma";
// import client from "../middleware/redis";



export const generateQuiz = async (req: any, res: Response) => {

    try {
        const { id } = req.userId
        const user = await prisma.user.findUnique({
            where: { id: id }
        })

        if (!user) {

            res.status(400).json({ message: "No user found", success: false })

            return;
        }
        const prompt = generateQuizPrompt({ industry: user?.industry!, skills: user?.skills! })
        const text = getAiInsight({ prompt });
        const cleanedText = (await text).replace(/```(?:json)?\n?/g, "").trim()
        const result = JSON.parse(cleanedText);
        res.status(201).json({ result, message: "Quiz created", success: false })
        return;
    } catch (error: any) {
        res.status(201).json({ message: error?.message, success: false })
        return;
    }
}
export const saveQuizResult = async (req: any, res: Response) => {

    try {
        const { id } = req.userId
        const { questions, score, wrongAnswers, correctAnswer, wrongAsnweredQuestion, answers } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: id }
        })

        if (!user) {

            res.status(400).json({ message: "No user found", success: false })

            return;
        }


        let improvementTip = null;
        if(wrongAnswers.length>0){

            const wrongAnswerText = wrongAnswers.map((q: any, indx: number) => `Question: "${wrongAsnweredQuestion[indx]}"\nCorrect Answer: "${correctAnswer[indx]}"\nUser Answer: "${wrongAnswers[indx]}" 
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
                const prompt = improvementPrompt
                const text = await getAiInsight({ prompt });
                improvementTip = text.trim();

                const data =[
                    questions,
                    answers
                ]

                await prisma.assessment.create({
                    data: {
                        userId: id,
                        quizScore: Number(score),
                        questions: data,
                        category: user.industry!,
                        improvmentTip: improvementTip,
                    }
                })
                // await client.del(`Assessment:${id}`)
                res.status(201).json({ message: improvementTip, success: true })
                return;

            } catch (error) {
                console.log('Error generating improvement tip:', error)
            }
        };

    } catch (error: any) {
        res.status(500).json({ message: error?.message, success: false })
        return;
    }
}

export const getAllAssessments = async(req:any,res:Response)=>{

    const {id} = req.userId;

    try {

        // const cachedAssessment = await client.get(`Assessment:${id}`)

        // if(cachedAssessment){
        //     res.status(200).json({ data: JSON.parse(cachedAssessment), message: "Assessments fetched successfully", success: true });
        //     return;
        // }
        const data= await prisma.assessment.findMany({
            where:{userId:id},
            orderBy:{createdAt:'asc'},
        }) 

        if(!data){
            res.status(400).json({ message: " No Assessments found", success: true });
            return;
        }

        // await client.setEx(`Assessment:${id}`,600,JSON.stringify(data))
        res.status(200).json({data,message:"Assessments fetched successfully",success:true});
        return;
    } catch (error) {
        res.status(500).json({ message: "Server error try after sometime", success:false });
        return;
    }
};