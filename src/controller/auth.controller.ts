import { Request, Response } from 'express';
import { signInTypes, signInValidation, signUpTypes } from '../lib/zod';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { variables } from '../constants';
import { options, transporter } from '../lib/mailer';


//generating cookies

const secrets = variables.secrets;

const { accessTokenSecret, refreshTokenSecret, } = secrets;

const generateCookie = ({ id }: { id: string }) => {


    const accessToken = jwt.sign(
        {
            id,
        },
        accessTokenSecret,
        {
            expiresIn: "1d"
        }
    );

    const refreshToken = jwt.sign(
        {
            id,
        },
        refreshTokenSecret,
        {
            expiresIn: "7d"
        }
    );

    return { accessToken, refreshToken }
}


const option = ({ day }: { day: number }) => {

    return {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as 'strict',
        maxAge: day * 24 * 60 * 60 * 1000
    }
};

export const signup = async (req: Request, res: Response): Promise<void> => {

    const body: signUpTypes = req.body;

    const result = signInValidation.safeParse(body)

    try {
        if (!result.success) {

            const error: Record<string, string[]> = { message: [] };

            result.error.issues.forEach((issue) => {

                error['message'].push(issue.message)
            });

            const message = error.message.join(',');
            res.status(400).json({ message, success: false })
            return;
        }

        const { name, email, password } = body;


        //already user
        const isUserExist = await prisma.user.findFirst({
            where: { email: email }
        });

        if (isUserExist) {
            res.status(409).json({ message: "User already exist with this email try loginin in", success: false })
            return;
        }



        //hashing password

        const hashedPassword = await bcrypt.hash(password, 10);

        //create user
        const newUser = await prisma.user.create({

            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        if (!newUser) {
            res.status(500).json({ message: "Server error please try again", success: false })
            return;
        }

        //otp generation

        const otp = Math.floor(100000 + Math.random() * 900000);
        const subject = 'Welcome to Sensai';
        const message = `Your account has been created successfully. Use this OTP:<b style="color:red;">${otp}</b> to verify your account. Or click below`;

        const mailoption = options({ to_email: email, from_email: String(variables.mail.smtpUser), subject, message })

        await transporter.sendMail(mailoption, (err) => {

            if (err) {
                res.status(500).json({ message: "Failed to send email but account created try loggin In", success: false })
            }
            else {
                const { accessToken, refreshToken } = generateCookie({ id: newUser?.id });

                res.status(201)
                    .cookie('accessToken', accessToken, option({ day: 1 }))
                    .cookie('refreshToken', refreshToken, option({ day: 7 }))
                    .json({ success: true, message: "Account created successfully" })

                return;
            }
        })
    } catch (error: any) {
        res.status(500).json({ message: error.message, success: false });
        return;
    }
}
export const signin = async (req: Request, res: Response): Promise<void> => {

    const body: signInTypes = req.body;

    const result = signInValidation.safeParse(body)

    if (!result.success) {

        const error: Record<string, string[]> = { message: [] };

        result.error.issues.forEach((issue) => {

            error['message'].push(issue.message)
        });

        const message = error.message.join(',');
        res.status(400).json({ message, success: false })
        return;
    }

    const { email, password } = body;


    //already user
    try {
        const isUserExist = await prisma.user.findFirst({
            where: { email: email }
        });

        if (!isUserExist) {
            res.status(404).json({ message: "No user found with this email first create an account", success: false })
            return;
        }



        //checking password

        const ispasswordCorrect = await bcrypt.compare(password, isUserExist.password)

        if (!ispasswordCorrect) {
            res.status(400).json({ message: "Wrong password", success: false })
            return;
        }

        const { accessToken, refreshToken } = generateCookie({ id: isUserExist?.id });

        res.status(200)
            .cookie('accessToken', accessToken, option({ day: 1 }))
            .cookie('refreshToken', refreshToken, option({ day: 7 }))
            .json({ success: true, message: "Logged In Successfully" })

        return;
    } catch (error) {
        res.status(500).json({ message: "Database error", success: false });
        return;
    }
}

export const generateOtp = async (req: Request, res: Response): Promise<void> => {

    const { email } = req.body;

    if (!email) {

        res.status(400).json({ message: "Please provide your email", success: false })
        return;
    }

    try {
        const isUserExist = await prisma.user.findFirst({
            where: { email: email }
        });

        if (!isUserExist) {
            res.status(404).json({ message: "No user found with this email first create an account", success: false })
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const subject = 'Reset Password';
        const message = `Otp has been generated to reset to your password.It is valid for 15 minutes only Use this OTP:<b style="color:red;">${otp}</b> to reset your Password. Click below`;

        const mailoption = options({ to_email: email, from_email: String(variables.mail.smtpUser), subject, message })

        await transporter.sendMail(mailoption, (err) => {

            if (err) {
                res.status(500).json({ message: "Failed to send email but account created try loggin In", success: false })
            }
            else {//working---on route
                res.status(201)
                    .json({ success: true, message: "Otp sent successfully" })

                return;
            }

        })

        await prisma.user.update({
            where:{email:email},
            data:{
                otp:String(otp),
                otpValidity:new Date(Date.now() +15 *60*1000)
            }
        })
    }
    catch (error: any) {
        res.status(500)
            .json({ success: false, message: "Server error please try again" })

        return;
    }


}
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {

    const { email, otp } = req.body;

    if (!otp || !email) {

        res.status(400).json({ message: "Please provide your email and otp", success: false })
        return;
    }

    try {
        const isUserExist = await prisma.user.findFirst({
            where: { email: email }
        });

        if (!isUserExist) {
            res.status(404).json({ message: "No user found with this email first create an account", success: false })
            return;
        }


        if(!(otp == isUserExist.otp)){
            res.status(400).json({ message: "Wrong OTP", success: false })
            return;
        }

        if (!isUserExist.otpValidity){
            res.status(400).json({ message: "Apply to reset password first", success: false })
            return;
        }else{

            if (isUserExist.otpValidity < new Date(Date.now())){
                res.status(400).json({ message: "OTP Expired", success: false })
                return;
            }
            else{

                res.status(201)
                    .json({ success: true, message: "Otp verified" })

                return;
            }
        }
    }
    catch (error: any) {
        res.status(500)
            .json({ success: false, message: "Server error please try again" })

        return;
    }


}
export const resetPassword = async (req: Request, res: Response): Promise<void> => {

    const { email, password} = req.body;

    if (!password || !email) {

        res.status(400).json({ message: "Please provide your email and Password", success: false })
        return;
    }

    try {
        const isUserExist = await prisma.user.findFirst({
            where: { email: email }
        });

        if (!isUserExist) {
            res.status(404).json({ message: "No user found with this email first create an account", success: false })
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where:{email:email},
            data:{
                password:hashedPassword
            }
        })
        const { accessToken, refreshToken } = generateCookie({ id: isUserExist?.id });

        res.status(200)
            .cookie('accessToken', accessToken, option({ day: 1 }))
            .cookie('refreshToken', refreshToken, option({ day: 7 }))
            .json({ success: true, message: "Password reset Successfully" })

        return;
    }
    catch (error: any) {
        res.status(500)
            .json({ success: false, message: "Server error please try again" })

        return;
    }
}

export const logout = async (req: Request, res: Response)=>{

    try {
        res.status(200)
            .clearCookie('accessToken')
            .clearCookie('refreshToken')
            .json({ success: true, message: "Logout Successfully" })

        return;
    } catch (error) {
        res.status(500)
            .json({ success: false, message: "Server error please try again" })

        return;
    }
}

