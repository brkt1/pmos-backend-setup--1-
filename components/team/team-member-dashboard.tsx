"use client"

import TaskActivityLog from "@/components/tasks/task-activity-log"
import TaskComments from "@/components/tasks/task-comments"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Activity, Clock, MessageSquare, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Task {
  id: string
  title: string
  description: string | null
  deadline: string | null
  status: string
  priority?: string
  projects?: { name: string } | null
  users?: { full_name: string | null; email: string } | null
}

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  roles?: { name: string } | null
  users?: { full_name: string | null; email: string } | null
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
}

export default function TeamMemberDashboard({
  teamMember,
  tasks,
  notifications,
  userId,
}: {
  teamMember: TeamMember
  tasks: Task[]
  notifications: Notification[]
  userId: string
}) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [status, setStatus] = useState("")
  const router = useRouter()

  const statusColors = {
    pending: "bg-gray-500",
    "in-progress": "bg-blue-500",
    completed: "bg-green-500",
    delayed: "bg-red-500",
  }

  const priorityColors = {
    low: "bg-gray-400",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    urgent: "bg-red-600",
  }

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    const supabase = createClient()
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)
    router.refresh()
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setStatus(task.status)
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    const supabase = createClient()
    await supabase.from("tasks").update({ status }).eq("id", editingTask.id)
    setEditingTask(null)
    router.refresh()
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in-progress")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-6 w-6 sm:h-8 sm:w-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, {teamMember.full_name || teamMember.email}!
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          {teamMember.roles?.name && (
            <Badge variant="secondary" className="mr-2">
              {teamMember.roles.name}
            </Badge>
          )}
          View and complete your assigned tasks
        </p>
        {teamMember.users && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Manager: {teamMember.users.full_name || teamMember.users.email}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3 border rounded-lg">
                  <div className="font-semibold text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">{notification.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Tasks</CardTitle>
          <CardDescription>Tasks assigned to you by your manager</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge
                            className={`${statusColors[task.status as keyof typeof statusColors]} text-xs sm:text-sm`}
                          >
                            {task.status}
                          </Badge>
                          {task.priority && (
                            <Badge
                              variant="outline"
                              className={`${priorityColors[task.priority as keyof typeof priorityColors]} text-white text-xs sm:text-sm`}
                            >
                              {task.priority}
                            </Badge>
                          )}
                          <CardTitle className="text-base sm:text-lg">{task.title}</CardTitle>
                        </div>
                        {task.projects && (
                          <CardDescription className="text-xs sm:text-sm">
                            Project: {task.projects.name}
                          </CardDescription>
                        )}
                        {task.deadline && (
                          <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Due: {format(new Date(task.deadline), "MMM d, yyyy h:mm a")}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(task)}
                            >
                              Update Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Task Status</DialogTitle>
                              <DialogDescription>Change the status of this task</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdateTask} className="space-y-4">
                              <div className="grid gap-2">
                                <label>Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="delayed">Delayed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingTask(null)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit">Update</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                    )}
                    <div className="pt-2 border-t flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedTask(expandedTask === task.id ? null : task.id)
                        }
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comments
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedTask(expandedTask === task.id ? null : task.id)
                        }
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Activity
                      </Button>
                    </div>
                    {expandedTask === task.id && (
                      <div className="mt-4 space-y-4">
                        <TaskComments taskId={task.id} userId={userId} />
                        <TaskActivityLog taskId={task.id} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

