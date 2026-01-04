"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

interface DailyReview {
  id: string
  date: string
  top_priorities: string[]
  people_to_check: string[]
  evening_review: string | null
  evening_completed: boolean
}

export default function DailyReviewsList({ dailyReviews }: { dailyReviews: DailyReview[] }) {
  if (dailyReviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No daily reviews yet. Complete your first daily dashboard!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {dailyReviews.map((review) => {
        const date = new Date(review.date)
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

        return (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 sm:gap-3">
                    {review.evening_completed ? (
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate">{dayName}</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{dateStr}</CardDescription>
                </div>
                {review.evening_completed ? (
                  <Badge className="bg-green-500 shrink-0 text-xs sm:text-sm">Completed</Badge>
                ) : (
                  <Badge variant="outline" className="shrink-0 text-xs sm:text-sm">Incomplete</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {review.top_priorities.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Top Priorities:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {review.top_priorities.map((priority, index) => (
                      <li key={index}>{priority}</li>
                    ))}
                  </ul>
                </div>
              )}
              {review.people_to_check.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">People Checked:</h4>
                  <div className="flex flex-wrap gap-2">
                    {review.people_to_check.map((person, index) => (
                      <Badge key={index} variant="secondary">
                        {person}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {review.evening_review && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Evening Review:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.evening_review}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
