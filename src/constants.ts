import dotenv from 'dotenv'


dotenv.config({
    path:'./.env'
})

export const variables={
    corsOrigin: process.env.CORS_ORIGIN,
    port:process.env.PORT,
    geminiKey:process.env.GEMINI_API_KEY,
    secrets:{
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
        accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY!,
        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY!
    },
    mail:{
        smtpHost: process.env.SMTP_HOST,
        smtpUser: process.env.SMTP_USER,
        smtpPassword: process.env.SMTP_PASSWORD
    },
    redisPass: process.env.REDIS_PASS
}