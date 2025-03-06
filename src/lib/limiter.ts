import rateLimit from "express-rate-limit";


export const limiter=({window,limit}:{window:number,limit:number}) => rateLimit({
    windowMs:window*60*1000,
    limit:limit,
    standardHeaders:'draft-8',
    legacyHeaders:false,
    statusCode:429,
    message: { message: 'Hold on for some time you requested to much',success:false}
})