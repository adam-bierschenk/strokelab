import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const neon = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(neon)

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

<<<<<<< HEAD
export default prisma
=======
export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
>>>>>>> 816cf2c (fix: resolve build errors for Vercel deployment)
