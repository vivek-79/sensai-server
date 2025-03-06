import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { getAiInsight } from "../gemini";
import { insightPrompt } from "../gemini/prompts";
// import client from "../middleware/redis";







export const getUser = async (req:any,res:Response)=>{

    const {id} = req.userId;

   
    try {

        // const cachedUser = await client.get(`user:${id}`)

        // if(cachedUser){
        //     res.status(200).json({ user:JSON.parse(cachedUser), message: 'User Data Fetched (from cache)', success: true })
        //     return;
        // }
        const user = await prisma.user.findUnique({
            where:{id:id},
            select:{
                name:true,
                email:true,
                avatar:true
            }
        })
        if (!user) {
             res.status(404).json({ message: "User not found", success: false });
            return;
        }

        // await client.setEx(`user:${id}`,3600,JSON.stringify(user));
        res.status(200).json({user,message:'User Data Fetched',success:true})
        return;
    } catch (error:any) {
        res.json({ message:error.mssage,success:false })
        return;
    }
};


export const onBoardingSubmit = async (req:any,res:Response)=>{

    const {id} = req.userId;

    const { experiance, industry, professionalBio, skills, specialization} = req.body
   
    if (!(experiance || industry || professionalBio || skills || specialization)){
        
        res.status(400).json({message:'Please provide all the details'});
        return;
    }
        
    try {
        await prisma.$transaction(

            async (tx) => {

                let industryInsight = await tx.industryInsight.findUnique({
                    where: { industry: industry },
                })


                if (!industryInsight) {


                    const prompt = insightPrompt({ industry })
                    const text = getAiInsight({ prompt });
                    const cleanedText = (await text).replace(/```(?:json)?\n?/g, "").trim()
                    const result = JSON.parse(cleanedText);


                    industryInsight = await tx.industryInsight.create({
                        data: {
                            ...result,
                            industry: industry,
                            nextUpdated: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        },
                    })
                }

                 await tx.user.update({
                    where: { id: id },
                    data: {
                        bio: professionalBio,
                        experience: String(experiance),
                        skills,
                        industry,
                        specialization
                    }
                });
                return true
            },{
                timeout:10000,
            }
        );
        res.status(201).json({message: "User updated successfully", success: true });
        return;
    } catch (error:any) {
        console.log(error)
        res.json({ message: error.message,success:false })
        return;
    }
};


export const getIndustryInsights = async(req:Request,res:Response)=>{

    const {industry} = req.body;

    if(!industry){
        res.status(400).json({message:"No industry found",success:false})
    }

    

   try {


    // const cachedInsight = await client.get(`insight:${industry}`)

    // if(cachedInsight){
    //     res.status(200).json({ insights:JSON.parse(cachedInsight), message: "Insights fetched successfully", success: true });
    //     return;
    // };


    let insights = await prisma.industryInsight.findUnique({

        where:{industry:industry}
    })
    
    if(!insights){

        const prompt = insightPrompt({ industry })
        const text = getAiInsight({ prompt });
        const cleanedText = (await text).replace(/```(?:json)?\n?/g, "").trim()
        const result = JSON.parse(cleanedText);


         insights = await prisma.industryInsight.create({
            data: {
                ...result,
                industry: industry,
                nextUpdated: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
        })
    }

    // await client.setEx(`insight:${industry}`,3600,JSON.stringify(insights));
     res.status(200).json({insights,message:"Insights fetched successfully",success:true});
     return
   } catch (error) {
       res.status(500).json({ message: "Error While fetching insights", success: true });
       return;
   }
}