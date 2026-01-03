"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Plus, Calendar } from "lucide-react"

interface WeeklyReview {
  id: string
  week_start: string
  goals_review: string | null
  people_issues: string | null
  process_improvements: string | null
  unnecessary_work_removed: string | null
  created_at: string
}

export default function WeeklyReviewsList({
  weeklyReviews,
  userId,
}: {
  weeklyReviews: WeeklyReview[]
  userId: string
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [goalsReview, setGoalsReview] = useState("")
  const [peopleIssues, setPeopleIssues] = useState("")
  const [processImprovements, setProcessImprovements] = useState("")
  const [unnecessaryWork, setUnnecessaryWork] = useState("")
  const router = useRouter()

  const getWeekStart = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust for Monday start
    const monday = new Date(today.setDate(diff))
    return monday.toISOString().split("T")[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const reviewData = {
      user_id: userId,
      week_start: getWeekStart(),
      goals_review: goalsReview || null,
      people_issues: peopleIssues || null,
      process_improvements: processImprovements || null,
      unnecessary_work_removed: unnecessaryWork || null,
    }

    await supabase.from("weekly_reviews").insert(reviewData)

    setIsDialogOpen(false)
    setGoalsReview("")
    setPeopleIssues("")
    setProcessImprovements("")
    setUnnecessaryWork("")
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Weekly Reviews</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Weekly Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Weekly Review</DialogTitle>
              <DialogDescription>
                Reflect on the week and identify areas for improvement. This is system maintenance for your management
                operating system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="goals">Goals vs Results Review</Label>
                <Textarea
                  id="goals"
                  value={goalsReview}
                  onChange={(e) => setGoalsReview(e.target.value)}
                  placeholder="What goals did you achieve? What fell short? Why?"
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="people">People Issues</Label>
                <Textarea
                  id="people"
                  value={peopleIssues}
                  onChange={(e) => setPeopleIssues(e.target.value)}
                  placeholder="Any team dynamics, performance issues, or recognition needed?"
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="improvements">Process Improvements</Label>
                <Textarea
                  id="improvements"
                  value={processImprovements}
                  onChange={(e) => setProcessImprovements(e.target.value)}
                  placeholder="What systems or processes can be improved?"
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="waste">Unnecessary Work Removed</Label>
                <Textarea
                  id="waste"
                  value={unnecessaryWork}
                  onChange={(e) => setUnnecessaryWork(e.target.value)}
                  placeholder="What tasks or meetings can be eliminated?"
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Weekly Review</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {weeklyReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No weekly reviews yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>Create Your First Weekly Review</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {weeklyReviews.map((review) => {
            const weekStart = new Date(review.week_start)
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekEnd.getDate() + 6)

            return (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <CardTitle>
                        Week of {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                        {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </CardTitle>
                      <CardDescription>
                        Completed {new Date(review.created_at).toLocaleDateString("en-US")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {review.goals_review && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Goals vs Results:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.goals_review}</p>
                    </div>
                  )}
                  {review.people_issues && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">People Issues:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.people_issues}</p>
                    </div>
                  )}
                  {review.process_improvements && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Process Improvements:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.process_improvements}</p>
                    </div>
                  )}
                  {review.unnecessary_work_removed && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Unnecessary Work Removed:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {review.unnecessary_work_removed}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
