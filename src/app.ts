
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { variables } from './constants';
import { limiter } from './lib/limiter';
import { serve } from "inngest/express";


const app = express();



app.use(cors({
    origin:variables.corsOrigin
}))

app.use(express.json())

app.use(cookieParser())

app.use(limiter({window:15,limit:100}));




//importing routes
import authRoute from './routes/auth.Routes';
import userRoute from './routes/user.Routes';
import { inngest,functions } from './inngest';
import interViewRoute from './routes/interview.routes';
import resumeRouter from './routes/resume.Routes';


app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/v1/auth',authRoute);
app.use('/api/v1/user',userRoute);
app.use('/api/v1/interview', interViewRoute);
app.use('/api/v1/resume', resumeRouter);

export default app;