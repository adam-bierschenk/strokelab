import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7 requires explicit datasource configuration
const prismaOptions = process.env.DATABASE_URL 
  ? { datasourceUrl: process.env.DATABASE_URL }
  : {}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma