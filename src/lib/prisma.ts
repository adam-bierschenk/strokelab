import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7 requires explicit datasource configuration
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  ...(process.env.DATABASE_URL ? { datasourceUrl: process.env.DATABASE_URL } : {})
} as ConstructorParameters<typeof PrismaClient>[0])

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
export default prisma