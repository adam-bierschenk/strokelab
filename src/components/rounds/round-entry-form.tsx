"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

async function createRound(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  console.log("Round data:", data)
  // TODO: Implement actual round creation with Supabase
  return { success: true }
}

interface Course {
  id: string
  name: string
  par: number
  holes: {
    id: string
    number: number
    par: number
    yardage: number | null
  }[]
}

interface HoleScore {
  holeId: string
  number: number
  par: number
  yardage: number | null
  score: number
  putts: number
}

export function RoundEntryForm({ courses }: { courses: Course[] }) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(
    courses[0] || null
  )
  const [holeScores, setHoleScores] = useState<HoleScore[]>(
    courses[0]?.holes.map((h) => ({
      holeId: h.id,
      number: h.number,
      par: h.par,
      yardage: h.yardage,
      score: 0,
      putts: 0,
    })) || []
  )
  const [currentHole, setCurrentHole] = useState(0)
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleCourseChange = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId)
    if (course) {
      setSelectedCourse(course)
      setHoleScores(
        course.holes.map((h) => ({
          holeId: h.id,
          number: h.number,
          par: h.par,
          yardage: h.yardage,
          score: 0,
          putts: 0,
        }))
      )
      setCurrentHole(0)
    }
  }

  const updateHoleScore = (holeId: string, score: number, putts: number) => {
    setHoleScores((prev) =>
      prev.map((h) =>
        h.holeId === holeId ? { ...h, score, putts } : h
      )
    )
  }

  const goToNextHole = () => {
    if (currentHole < holeScores.length - 1) {
      setCurrentHole((prev) => prev + 1)
    }
  }

  const goToPrevHole = () => {
    if (currentHole > 0) {
      setCurrentHole((prev) => prev - 1)
    }
  }

  const calculateTotals = () => {
    const totalScore = holeScores.reduce((sum, h) => sum + h.score, 0)
    const totalPutts = holeScores.reduce((sum, h) => sum + h.putts, 0)
    const holesPlayed = holeScores.filter((h) => h.score > 0).length
    return { totalScore, totalPutts, holesPlayed }
  }

  const { totalScore, totalPutts, holesPlayed } = calculateTotals()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createRound(new FormData(e.currentTarget))
    } catch (err) {
      console.error("Failed to submit:", err)
      setSubmitting(false)
    }
  }

  const currentHoleData = holeScores[currentHole]

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="notes" value={notes} />
      {holeScores.map((h) => (
        <div key={h.holeId}>
          <input
            type="hidden"
            name={`hole_${h.holeId}`}
            value={h.score > 0 ? h.score : ""}
          />
          <input
            type="hidden"
            name={`putts_${h.holeId}`}
            value={h.putts > 0 ? h.putts : ""}
          />
        </div>
      ))}

      {/* Course Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Course
        </label>
        <select
          name="courseId"
          value={selectedCourse?.id || ""}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
          required
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} (Par {course.par})
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
          required
        />
      </div>

      {/* Progress */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Hole {currentHole + 1} of {holeScores.length}
          </span>
          <span className="text-sm font-medium">
            Total: {totalScore} ({holesPlayed} holes)
          </span>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all"
            style={{
              width: `${((currentHole + 1) / holeScores.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Current Hole Entry - Mobile First */}
      {currentHoleData && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-foreground mb-2">
              Hole {currentHoleData.number}
            </div>
            <div className="text-muted-foreground">
              Par {currentHoleData.par} {currentHoleData.yardage && `• ${currentHoleData.yardage} yds`}
            </div>
          </div>

          {/* Score Input */}
          <div className="mb-6">
            <label className="block text-center text-sm font-medium text-foreground mb-2">
              Score
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() =>
                  updateHoleScore(
                    currentHoleData.holeId,
                    Math.max(0, currentHoleData.score - 1),
                    currentHoleData.putts
                  )
                }
                className="w-14 h-14 rounded-full bg-muted text-xl font-bold hover:bg-muted/80 transition-colors"
              >
                -
              </button>

              <input
                type="number"
                min="1"
                max="15"
                value={currentHoleData.score || ""}
                onChange={(e) =>
                  updateHoleScore(
                    currentHoleData.holeId,
                    parseInt(e.target.value) || 0,
                    currentHoleData.putts
                  )
                }
                className="w-24 h-20 text-center text-4xl font-bold border-2 border-border rounded-xl bg-background"
              />

              <button
                type="button"
                onClick={() =>
                  updateHoleScore(
                    currentHoleData.holeId,
                    currentHoleData.score + 1,
                    currentHoleData.putts
                  )
                }
                className="w-14 h-14 rounded-full bg-muted text-xl font-bold hover:bg-muted/80 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Putts Input */}
          <div className="mb-6">
            <label className="block text-center text-sm font-medium text-foreground mb-2">
              Putts
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() =>
                  updateHoleScore(
                    currentHoleData.holeId,
                    currentHoleData.score,
                    Math.max(0, currentHoleData.putts - 1)
                  )
                }
                className="w-12 h-12 rounded-full bg-secondary text-lg font-bold hover:bg-secondary/80 transition-colors"
              >
                -
              </button>

              <input
                type="number"
                min="0"
                max="10"
                value={currentHoleData.putts || ""}
                onChange={(e) =>
                  updateHoleScore(
                    currentHoleData.holeId,
                    currentHoleData.score,
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-20 h-16 text-center text-3xl font-bold border-2 border-border rounded-xl bg-background"
              />

              <button
                type="button"
                onClick={() =>
                  updateHoleScore(
                    currentHoleData.holeId,
                    currentHoleData.score,
                    currentHoleData.putts + 1
                  )
                }
                className="w-12 h-12 rounded-full bg-secondary text-lg font-bold hover:bg-secondary/80 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Hole Navigation */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevHole}
              disabled={currentHole === 0}
            >
              ← Prev
            </Button>
            <Button
              type="button"
              onClick={goToNextHole}
              disabled={currentHole === holeScores.length - 1}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Score Grid */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Quick Select</h3>
        <div className="grid grid-cols-9 gap-1">
          {holeScores.map((h, idx) => (
            <button
              key={h.holeId}
              type="button"
              onClick={() => setCurrentHole(idx)}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                idx === currentHole
                  ? "bg-primary text-primary-foreground"
                  : h.score > 0
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <div>{h.number}</div>
              {h.score > 0 && <div className="text-xs">{h.score}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about this round..."
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none"
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full py-6 text-lg"
        disabled={submitting || totalScore === 0}
      >
        {submitting ? "Saving..." : `Save Round - ${totalScore} (${totalPutts} putts)`}
      </Button>

      {/* Summary */}
      {totalScore > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-lg text-center">
          <div className="text-sm text-muted-foreground">Round Summary</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {totalScore} ({totalScore - (selectedCourse?.par || 0) > 0 ? "+" : ""}
            {totalScore - (selectedCourse?.par || 0)})
          </div>
          <div className="text-sm text-muted-foreground">
            {totalPutts} putts • {holesPlayed} holes played
          </div>
        </div>
      )}
    </form>
  )
}
