import { PrismaClient } from "@prisma/client"



// Define a global variable for Prisma in the global scope
const globalForPrisma = globalThis as unknown as { prismaGlobal?: PrismaClient };


const singleTonPrisma = ()=> new PrismaClient();


const prisma = globalForPrisma.prismaGlobal as PrismaClient ?? singleTonPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaGlobal =prisma


export default prisma;