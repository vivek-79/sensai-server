import { Router } from "express";
import { generateOtp, logout, resetPassword, signin, signup, verifyOtp } from "../controller/auth.controller";
import { limiter } from "../lib/limiter";


const authRoute = Router();


authRoute.use(limiter({window:1,limit:5}))
authRoute.route('/signup').post(signup)
authRoute.route('/signin').post(signin)
authRoute.route('/generate-otp').post(generateOtp)
authRoute.route('/verify-otp').post(verifyOtp)
authRoute.route('/reset-password').post(resetPassword)
authRoute.route('/logout').post(logout)

export default authRoute;