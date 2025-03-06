import { Router } from "express";
import { authenticateUser } from "../middleware/authenticated";
import { getAllAssessments, generateQuiz, saveQuizResult } from "../controller/interview.controller";


const interViewRoute = Router();

interViewRoute.use(authenticateUser)
interViewRoute.route('/get').get(generateQuiz)
interViewRoute.route('/submit').post(saveQuizResult)
interViewRoute.route('/getAllAssessments').post(getAllAssessments)

export default interViewRoute;