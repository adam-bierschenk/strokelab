export interface Course {
  id: string
  name: string
  location?: string
  par: number
  holes: Hole[]
}

export interface Hole {
  id: string
  number: number
  par: number
  yardage?: number
  handicap?: number
}

export interface Round {
  id: string
  courseId: string
  date: string
  totalScore: number
  totalPutts: number
  notes?: string
}

export interface Score {
  id: string
  roundId: string
  holeId: string
  score: number
  putts: number
}

export interface Goal {
  id: string
  userId: string
  type: 'SCORE_AVG' | 'ROUNDS_COUNT' | 'FAIRWAY_PCT' | 'GIR_PCT' | 'PUTTS_AVG'
  title: string
  description?: string
  targetValue: number
  currentValue: number
  deadline?: string
  status: 'active' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface GoalProgress {
  goal: Goal
  percentage: number
  trend: 'up' | 'down' | 'stable'
}
