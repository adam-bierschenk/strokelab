import prisma from './prisma'

// Course operations
export async function getCourses() {
  return prisma.course.findMany({
    include: {
      holes: {
        orderBy: { number: 'asc' }
      },
      _count: {
        select: { rounds: true }
      }
    }
  })
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      holes: {
        orderBy: { number: 'asc' }
      }
    }
  })
}

export async function createCourse(data: {
  name: string
<<<<<<< HEAD
  city?: string
  state?: string
  country?: string
  par: number
  totalYards?: number
  slope?: number
  rating?: number
  holes?: Array<{
    number: number
    par: number
    yardage?: number
    handicap?: number
=======
  location?: string
  par?: number
  holes?: Array<{
    number: number
    par: number
    yardage?: number | null
    handicap?: number | null
>>>>>>> 816cf2c (fix: resolve build errors for Vercel deployment)
  }>
}) {
  return prisma.course.create({
    data: {
      name: data.name,
      location: data.location || '',
      par: data.par || 72,
      holes: data.holes ? {
        create: data.holes.map(h => ({
          number: h.number,
          par: h.par,
          yardage: h.yardage ?? null,
          handicap: h.handicap ?? null
        }))
      } : undefined
    },
    include: {
      holes: true
    }
  })
}

// Round operations
export async function getRounds(userId: string) {
  return prisma.round.findMany({
    where: { userId },
    include: {
      course: true,
      scores: {
        include: {
          hole: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })
}

export async function getRoundById(id: string, userId: string) {
  return prisma.round.findFirst({
    where: { id, userId },
    include: {
      course: true,
      scores: {
        include: {
          hole: true
        },
        orderBy: {
          hole: { number: 'asc' }
        }
      }
    }
  })
}

export async function createRound(data: {
  userId: string
  courseId: string
  date?: Date
  totalScore: number
  totalPutts: number
  notes?: string
  scores?: Array<{
    holeId: string
    score: number
    putts: number
  }>
}) {
  return prisma.round.create({
    data: {
      userId: data.userId,
      courseId: data.courseId,
      date: data.date || new Date(),
      totalScore: data.totalScore,
      totalPutts: data.totalPutts,
      notes: data.notes || null,
      scores: data.scores ? {
        create: data.scores.map(s => ({
          holeId: s.holeId,
          score: s.score,
          putts: s.putts
        }))
      } : undefined
    },
    include: {
      course: true,
      scores: {
        include: {
          hole: true
        }
      }
    }
  })
}

export async function deleteRound(id: string, userId: string) {
  return prisma.round.deleteMany({
    where: { id, userId }
  })
}

// Stats calculations
export async function getUserStats(userId: string) {
  const rounds = await prisma.round.findMany({
    where: { userId },
    include: {
      scores: true
    }
  })

  if (rounds.length === 0) {
    return null
  }

  const totalRounds = rounds.length
  const avgScore = rounds.reduce((sum, r) => sum + r.totalScore, 0) / totalRounds
  const avgPutts = rounds.reduce((sum, r) => sum + r.totalPutts, 0) / totalRounds
  const bestScore = Math.min(...rounds.map(r => r.totalScore))

  return {
    totalRounds,
    avgScore: Math.round(avgScore * 10) / 10,
    avgPutts: Math.round(avgPutts * 10) / 10,
    bestScore
  }
}
