"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpValidation = exports.signInValidation = void 0;
const zod_1 = require("zod");
exports.signInValidation = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Please provide a valid email' }),
    password: zod_1.z.string().min(6, { message: 'Password must contain atleast 6 character' })
});
exports.signUpValidation = exports.signInValidation.extend({
    name: zod_1.z.string().min(3, { message: 'use minimum 3 characters in name' }),
});
