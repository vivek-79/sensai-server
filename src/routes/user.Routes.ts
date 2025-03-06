import { Router } from "express";
import { authenticateUser } from "../middleware/authenticated";
import { getIndustryInsights, getUser, onBoardingSubmit } from "../controller/user.controller";


const userRoute = Router();

userRoute.use(authenticateUser)
userRoute.route('/get').get(getUser)
userRoute.route('/onBording').post(onBoardingSubmit)
userRoute.route('/getIndustryInsights').post(getIndustryInsights)

export default userRoute;