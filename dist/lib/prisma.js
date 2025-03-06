"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Define a global variable for Prisma in the global scope
const globalForPrisma = globalThis;
const singleTonPrisma = () => new client_1.PrismaClient();
const prisma = (_a = globalForPrisma.prismaGlobal) !== null && _a !== void 0 ? _a : singleTonPrisma();
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prismaGlobal = prisma;
exports.default = prisma;
