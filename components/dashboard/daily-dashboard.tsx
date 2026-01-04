"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, Calendar, CheckCircle2, Target, TrendingUp, Users, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500 animate-pulse shrink-0"></div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
              Manager Mode: On
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            {new Date(today).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 font-semibold w-fit">
          Daily Control Layer
        </Badge>
      </div>

      {/* Morning Checklist */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary shrink-0"></div>
          Morning Checklist
        </h2>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl">Direction Check</CardTitle>
                  <CardDescription className="mt-1 text-xs sm:text-sm">What are today&apos;s top 3 priorities?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPriorities.map((priority, index) => (
                <div key={index} className="relative">
                  <div className="absolute left-3 top-3 text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </div>
                  <Input
                    placeholder={`Priority ${index + 1}`}
                    value={priority}
                    onChange={(e) => {
                      const newPriorities = [...topPriorities]
                      newPriorities[index] = e.target.value
                      setTopPriorities(newPriorities)
                    }}
                    className="pl-8"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">People Check</CardTitle>
                  <CardDescription className="mt-1">Who needs guidance or follow-up today?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  className="flex-1"
                />
                <Button onClick={addPerson} className="shrink-0">Add</Button>
              </div>
              {peopleToCheck.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {peopleToCheck.map((person, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg group hover:bg-blue-500/20 transition-colors"
                    >
                      <span className="text-sm font-medium">{person}</span>
                      <button
                        type="button"
                        onClick={() => setPeopleToCheck(peopleToCheck.filter((_, i) => i !== index))}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Task Check</CardTitle>
                  <CardDescription className="mt-1">Today&apos;s critical tasks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {todaysTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaysTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-secondary/50 border border-border rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Badge
                        variant={
                          task.status === "completed"
                            ? "default"
                            : task.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                        className="shrink-0"
                      >
                        {task.status}
                      </Badge>
                      <span className="text-sm flex-1 font-medium">{task.title}</span>
                      {task.projects?.name && (
                        <Badge variant="outline" className="text-xs">
                          {task.projects.name}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Control Check</CardTitle>
                  <CardDescription className="mt-1">What should I measure today?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  className="flex-1"
                />
                <Button onClick={addMetric} className="shrink-0">Add</Button>
              </div>
              {metricsToMeasure.length > 0 && (
                <div className="space-y-2">
                  {metricsToMeasure.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg group hover:bg-purple-500/20 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 text-purple-500 shrink-0" />
                      <span className="text-sm flex-1 font-medium">{metric}</span>
                      <button
                        type="button"
                        onClick={() => setMetricsToMeasure(metricsToMeasure.filter((_, i) => i !== index))}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive shrink-0"
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
        <div className="flex justify-end mt-4 sm:mt-6">
          <Button onClick={handleSaveMorningChecklist} size="lg" className="px-4 sm:px-8 w-full sm:w-auto">
            Save Morning Checklist
          </Button>
        </div>
      </div>

      {/* Active Strategies Quick View */}
      {strategies.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary shrink-0"></div>
            Active Strategies
          </h2>
          <Card className="border-2 bg-gradient-to-br from-background to-secondary/20">
            <CardHeader>
              <CardDescription className="text-xs sm:text-sm">Quick reference for your current priorities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {strategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className="flex items-start gap-3 p-4 bg-card border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <Badge
                      variant={strategy.priority === 1 ? "default" : strategy.priority === 2 ? "secondary" : "outline"}
                      className="shrink-0"
                    >
                      P{strategy.priority}
                    </Badge>
                    <span className="text-sm font-medium flex-1">{strategy.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Behavior Reminders */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary shrink-0"></div>
          Daily Behavior Rules
        </h2>
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Behavior Checklist</CardTitle>
                <CardDescription className="mt-1">Check off each behavior as you practice it today</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {behaviorLogs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground mb-6">Initialize today&apos;s behavior tracking</p>
                <Button onClick={handleInitializeBehaviorLogs} size="lg">
                  Initialize Behavior Checklist
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {behaviorLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      log.checked
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-secondary/50 border-border hover:bg-secondary"
                    }`}
                  >
                    <Checkbox
                      checked={log.checked}
                      onCheckedChange={(checked) => handleToggleBehavior(log.id, checked as boolean)}
                      className="h-5 w-5"
                    />
                    <span
                      className={`flex-1 text-sm font-medium ${
                        log.checked ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {log.behavior_rule}
                    </span>
                    {log.checked && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evening Review */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary shrink-0"></div>
          Evening Review
        </h2>
        <Card className="border-2 bg-gradient-to-br from-background to-secondary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Calendar className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <CardTitle className="text-xl">End of Day Reflection</CardTitle>
                <CardDescription className="mt-1">Reflect on today&apos;s achievements and learnings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              placeholder="What was achieved? What was delayed? Why? What must be followed up tomorrow?"
              value={eveningReview}
              onChange={(e) => setEveningReview(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button onClick={handleSaveEveningReview} size="lg" className="px-4 sm:px-8 w-full sm:w-auto">
                {dashboard?.evening_completed ? "Update Evening Review" : "Complete Evening Review"}
              </Button>
            </div>
            {dashboard?.evening_completed && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Evening review completed</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
