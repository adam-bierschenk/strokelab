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
