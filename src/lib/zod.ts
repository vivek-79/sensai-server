

import {z} from 'zod'


export const signInValidation =z.object({

    email:z.string().email({message:'Please provide a valid email'}),
    password:z.string().min(6,{message:'Password must contain atleast 6 character'})
})

export type signInTypes = z.infer<typeof signInValidation>;


export const signUpValidation = signInValidation.extend({
    name: z.string().min(3, { message: 'use minimum 3 characters in name' }),
})

export type signUpTypes = z.infer<typeof signUpValidation>