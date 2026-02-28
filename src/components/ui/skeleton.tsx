"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        {/* Welcome */}
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-10 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="h-12 bg-muted" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-t border-border" />
        ))}
      </div>
    </div>
  )
}

export function RoundEntrySkeleton() {
  return (
    <div className="max-w-lg mx-auto animate-pulse space-y-6">
      {/* Course Select */}
      <div className="h-12 bg-muted rounded-lg" />

      {/* Progress */}
      <div className="h-20 bg-muted rounded-lg" />

      {/* Hole Card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="h-12 bg-muted rounded w-1/3 mx-auto" />
        <div className="flex justify-center gap-4">
          <div className="h-14 w-14 bg-muted rounded-full" />
          <div className="h-20 w-24 bg-muted rounded-xl" />
          <div className="h-14 w-14 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  )
}
