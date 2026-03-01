"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"

interface HandicapData {
  handicapIndex: number
  formattedHandicap: string
  totalRounds: number
  roundsNeeded: number
  trend: "improving" | "stable" | "worsening"
}

interface HandicapCardProps {
  data: HandicapData | null
}

export function HandicapCard({ data }: HandicapCardProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Handicap Index</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Need 3 rounds with course rating/slope to calculate
          </p>
        </CardContent>
      </Card>
    )
  }

  const { formattedHandicap, totalRounds, roundsNeeded, trend } = data

  const TrendIcon =
    trend === "improving" ? TrendingDown : trend === "worsening" ? TrendingUp : Minus

  const trendColor =
    trend === "improving"
      ? "text-green-500"
      : trend === "worsening"
      ? "text-red-500"
      : "text-gray-500"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Handicap Index</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{formattedHandicap}</span>
          <TrendIcon className={`w-5 h-5 ${trendColor}`} />
        </div>

        <p className="text-sm text-muted-foreground">
          {totalRounds} round{totalRounds !== 1 ? "s" : ""} on record
        </p>

        {roundsNeeded > 0 && (
          <p className="text-sm text-amber-600">
            Need {roundsNeeded} more round{roundsNeeded !== 1 ? "s" : ""} for official handicap
          </p>
        )}
      </CardContent>
    </Card>
  )
}
