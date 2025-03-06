
import nodemailer from 'nodemailer'
import { variables } from '../constants';

const {smtpHost,smtpPassword,smtpUser} = variables.mail

export const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: smtpUser,
        pass: smtpPassword,
    },
});


interface mail{
    to_email:string;
    from_email:string;
    subject:string;
    message:string

}
export const options =({to_email,from_email,subject,message}:mail)=>({

    from: from_email,
    to: to_email,
    subject,
    html: `
            <div style="text-align:center;font-family:Arial,sans-serif;">
                <p style="color:black;font-size:16px ;margin-bottom:15px;">${message}</p>
                <b>
                <a href="https://localhost:8080" style="font-size:15px;color:white !important;background-color:black;border-radius:10px;padding:10px 20px;border:none;text-decoration:none ; display:inline-block;">
                Click Here
            </a>
            </b>
            </div>`
})


