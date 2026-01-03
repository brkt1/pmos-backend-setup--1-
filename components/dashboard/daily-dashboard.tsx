"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Calendar, Target, CheckCircle2, Users, TrendingUp, AlertCircle, X } from "lucide-react"

interface DashboardProps {
  dashboard: {
    id: string
    top_priorities: string[]
    people_to_check: string[]
    tasks_to_complete: string[]
    metrics_to_measure: string[]
    evening_review: string | null
    evening_completed: boolean
  } | null
  behaviorLogs: {
    id: string
    behavior_rule: string
    checked: boolean
    notes: string | null
  }[]
  todaysTasks: {
    id: string
    title: string
    status: string
    projects?: { name: string } | null
  }[]
  strategies: {
    id: string
    title: string
    priority: number
  }[]
  userId: string
  today: string
}

const DEFAULT_BEHAVIOR_RULES = [
  "Am I managing or doing?",
  "Did I delegate clearly?",
  "Did I follow up?",
  "Did I communicate expectations?",
  "Did I act calmly and fairly?",
]

export default function DailyDashboard({
  dashboard,
  behaviorLogs,
  todaysTasks,
  strategies,
  userId,
  today,
}: DashboardProps) {
  const [topPriorities, setTopPriorities] = useState<string[]>(dashboard?.top_priorities || ["", "", ""])
  const [peopleToCheck, setPeopleToCheck] = useState<string[]>(dashboard?.people_to_check || [])
  const [tasksToComplete, setTasksToComplete] = useState<string[]>(dashboard?.tasks_to_complete || [])
  const [metricsToMeasure, setMetricsToMeasure] = useState<string[]>(dashboard?.metrics_to_measure || [])
  const [eveningReview, setEveningReview] = useState(dashboard?.evening_review || "")
  const [newPerson, setNewPerson] = useState("")
  const [newMetric, setNewMetric] = useState("")
  const router = useRouter()

  const handleSaveMorningChecklist = async () => {
    const supabase = createClient()

    const dashboardData = {
      user_id: userId,
      date: today,
      top_priorities: topPriorities.filter((p) => p.trim()),
      people_to_check: peopleToCheck,
      tasks_to_complete: tasksToComplete,
      metrics_to_measure: metricsToMeasure,
    }

    if (dashboard?.id) {
      await supabase.from("daily_dashboards").update(dashboardData).eq("id", dashboard.id)
    } else {
      await supabase.from("daily_dashboards").insert(dashboardData)
    }

    router.refresh()
  }

  const handleSaveEveningReview = async () => {
    const supabase = createClient()

    if (dashboard?.id) {
      await supabase
        .from("daily_dashboards")
        .update({ evening_review: eveningReview, evening_completed: true })
        .eq("id", dashboard.id)
    }

    router.refresh()
  }

  const handleToggleBehavior = async (logId: string, checked: boolean) => {
    const supabase = createClient()
    await supabase.from("daily_behavior_logs").update({ checked }).eq("id", logId)
    router.refresh()
  }

  const handleInitializeBehaviorLogs = async () => {
    const supabase = createClient()

    const logs = DEFAULT_BEHAVIOR_RULES.map((rule) => ({
      user_id: userId,
      date: today,
      behavior_rule: rule,
      checked: false,
    }))

    await supabase.from("daily_behavior_logs").insert(logs)
    router.refresh()
  }

  const addPerson = () => {
    if (newPerson.trim()) {
      setPeopleToCheck([...peopleToCheck, newPerson.trim()])
      setNewPerson("")
    }
  }

  const addMetric = () => {
    if (newMetric.trim()) {
      setMetricsToMeasure([...metricsToMeasure, newMetric.trim()])
      setNewMetric("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Manager Mode: On</h1>
          <p className="text-muted-foreground mt-1">
            {new Date(today).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge className="text-base px-4 py-2">Daily Control Layer</Badge>
      </div>

      {/* Morning Checklist */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <CardTitle>Direction Check</CardTitle>
            </div>
            <CardDescription>What are today&apos;s top 3 priorities?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPriorities.map((priority, index) => (
              <Input
                key={index}
                placeholder={`Priority ${index + 1}`}
                value={priority}
                onChange={(e) => {
                  const newPriorities = [...topPriorities]
                  newPriorities[index] = e.target.value
                  setTopPriorities(newPriorities)
                }}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>People Check</CardTitle>
            </div>
            <CardDescription>Who needs guidance or follow-up today?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add person..."
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addPerson()
                  }
                }}
              />
              <Button onClick={addPerson}>Add</Button>
            </div>
            {peopleToCheck.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {peopleToCheck.map((person, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-md">
                    <span className="text-sm">{person}</span>
                    <button
                      type="button"
                      onClick={() => setPeopleToCheck(peopleToCheck.filter((_, i) => i !== index))}
                      className="hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <CardTitle>Task Check</CardTitle>
            </div>
            <CardDescription>Today&apos;s critical tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks scheduled for today</p>
            ) : (
              <div className="space-y-2">
                {todaysTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                    <Badge variant="outline">{task.status}</Badge>
                    <span className="text-sm flex-1">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Control Check</CardTitle>
            </div>
            <CardDescription>What should I measure today?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add metric..."
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addMetric()
                  }
                }}
              />
              <Button onClick={addMetric}>Add</Button>
            </div>
            {metricsToMeasure.length > 0 && (
              <div className="space-y-2">
                {metricsToMeasure.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                    <span className="text-sm flex-1">{metric}</span>
                    <button
                      type="button"
                      onClick={() => setMetricsToMeasure(metricsToMeasure.filter((_, i) => i !== index))}
                      className="hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSaveMorningChecklist} size="lg">
        Save Morning Checklist
      </Button>

      {/* Active Strategies Quick View */}
      {strategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Strategies (Quick Reference)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="flex items-center gap-3">
                  <Badge>P{strategy.priority}</Badge>
                  <span>{strategy.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Behavior Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Daily Behavior Rules</CardTitle>
          </div>
          <CardDescription>Check off each behavior as you practice it today</CardDescription>
        </CardHeader>
        <CardContent>
          {behaviorLogs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">Initialize today&apos;s behavior tracking</p>
              <Button onClick={handleInitializeBehaviorLogs}>Initialize Behavior Checklist</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {behaviorLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 bg-secondary rounded-md">
                  <Checkbox
                    checked={log.checked}
                    onCheckedChange={(checked) => handleToggleBehavior(log.id, checked as boolean)}
                  />
                  <span className={log.checked ? "line-through text-muted-foreground" : ""}>{log.behavior_rule}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evening Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Evening Review</CardTitle>
          </div>
          <CardDescription>Reflect on today&apos;s achievements and learnings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What was achieved? What was delayed? Why? What must be followed up tomorrow?"
            value={eveningReview}
            onChange={(e) => setEveningReview(e.target.value)}
            rows={6}
          />
          <Button onClick={handleSaveEveningReview} size="lg">
            Complete Evening Review
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
