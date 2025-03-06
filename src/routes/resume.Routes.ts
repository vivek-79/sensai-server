import { Router } from "express";
import { deleteResume, getResume, improveWithAi, saveResume } from "../controller/resume.controller";
import { authenticateUser } from "../middleware/authenticated";


const resumeRouter = Router();

resumeRouter.use(authenticateUser)
resumeRouter.route('/save').post(saveResume);
resumeRouter.route('/get').get(getResume)
resumeRouter.route('/improve').post(improveWithAi)
resumeRouter.route('/delete').get(deleteResume)

export default resumeRouter