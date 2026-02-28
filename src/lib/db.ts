// Mock Prisma for build without database connection
interface MockPrisma {
  $connect: () => Promise<void>
  $disconnect: () => Promise<void>
}

const mockPrisma: MockPrisma = {
  $connect: async () => {},
  $disconnect: async () => {},
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = mockPrisma as unknown as MockPrisma
