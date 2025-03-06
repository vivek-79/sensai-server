import { Response } from "express";
import prisma from "../lib/prisma";
import { resumeImmprove } from "../gemini/prompts";
import { getAiInsight } from "../gemini";
// import client from "../middleware/redis";





export const saveResume = async(req:any,res:Response)=>{

    const { id } = req.userId;
    const { previewContent} = req.body

   

    try {

        const resume = await prisma.resume.upsert({
            where:{
                userId:id,
            },
            update:{
                content:previewContent,
            },
            create:{
                userId:id,
                content: previewContent,
            }

        })

        res.status(201).json({ resume,message:'Resume saved suuccessfully',success:true})
        return;

    } catch (error) {
        res.status(500).json({ message: 'Error saving resume', success: false })
        return;
    }

}
export const getResume = async(req:any,res:Response)=>{

    const { id } = req.userId;

    try {

        // const cachedResume = await client.get(`Resume:${id}`)

        // if (cachedResume) {
        //     res.status(200).json({ resume: JSON.parse(cachedResume), message: "Assessments fetched successfully", success: true });
        //     return;
        // }
        const resume = await prisma.resume.findUnique({
            where:{
                userId:id,
            }

        })

        if ( resume ){

            // await client.setEx(`Resume:${id}`, 600, JSON.stringify(resume))
            res.status(200).json({ resume, message: 'Resume fetched suuccessfully', success: true })
            return;
        }
        else{
            res.status(400).json({ message: 'No resume found', success:false })
            return;
        }

    } catch (error) {
        res.status(500).json({ message: 'Error getting resume', success: false })
        return;
    }

}
export const improveWithAi = async(req:any,res:Response)=>{

    const { id } = req.userId;
    const { current,type } = req.body;

    try {

        const user = await prisma.user.findUnique({
            where:{id:id}
        })

        if(!user){
            res.status(400).json({ message: 'No user found', success: false })
            return;
        }

        const prompt = resumeImmprove({industry:user.industry,current:current,type:type})
        const text = await getAiInsight({ prompt });
        const result = text.trim();

        res.status(201).json({ result, message: 'Content improved suuccessfully', success: true })
        return;

    } catch (error) {
        res.status(500).json({ message: 'Error getting resume', success: false })
        return;
    }

}


export const deleteResume = async (req: any, res: Response) => {

    const { id } = req.userId;

    try {

        // await client.del(`Resume:${id}`);
        const delet = await prisma.resume.delete({
            where: {
                userId: id,
            }

        })

        if (delet) {
            res.status(200).json({ message: 'Resume fetched suuccessfully', success: true })
            return;
        }
        else {
            res.status(400).json({ message: 'No resume found', success: false })
            return;
        }

    } catch (error) {
        res.status(500).json({ message: 'Error getting resume', success: false })
        return;
    }

}