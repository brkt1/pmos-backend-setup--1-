"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import { useMemo } from "react"

interface Task {
  id: string
  status: string
  priority?: string
  deadline: string | null
  created_at: string
}

interface Strategy {
  id: string
  active: boolean
  priority: number
}

interface TeamMember {
  id: string
  status: string
}

export default function AnalyticsDashboard({
  tasks,
  strategies,
  teamMembers,
}: {
  tasks: Task[]
  strategies: Strategy[]
  teamMembers: TeamMember[]
}) {
  const stats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === "completed").length
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length
    const pendingTasks = tasks.filter((t) => t.status === "pending").length
    const overdueTasks = tasks.filter((t) => {
      if (!t.deadline) return false
      return new Date(t.deadline) < new Date() && t.status !== "completed"
    }).length

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const priorityBreakdown = {
      urgent: tasks.filter((t) => t.priority === "urgent").length,
      high: tasks.filter((t) => t.priority === "high").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      low: tasks.filter((t) => t.priority === "low").length,
    }

    const activeStrategies = strategies.filter((s) => s.active).length
    const activeTeamMembers = teamMembers.filter((tm) => tm.status === "active").length

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      priorityBreakdown,
      activeStrategies,
      activeTeamMembers,
    }
  }, [tasks, strategies, teamMembers])

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} completed ({stats.completionRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingTasks} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStrategies}</div>
            <p className="text-xs text-muted-foreground">{stats.activeTeamMembers} team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Distribution of tasks by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Completed</span>
                <span className="text-sm font-semibold">{stats.completedTasks}</span>
              </div>
              <Progress value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">In Progress</span>
                <span className="text-sm font-semibold">{stats.inProgressTasks}</span>
              </div>
              <Progress value={stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Pending</span>
                <span className="text-sm font-semibold">{stats.pendingTasks}</span>
              </div>
              <Progress value={stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks) * 100 : 0} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600">Urgent</Badge>
              </div>
              <span className="font-semibold">{stats.priorityBreakdown.urgent}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500">High</Badge>
              </div>
              <span className="font-semibold">{stats.priorityBreakdown.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500">Medium</Badge>
              </div>
              <span className="font-semibold">{stats.priorityBreakdown.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-400">Low</Badge>
              </div>
              <span className="font-semibold">{stats.priorityBreakdown.low}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

