"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Activity, Calendar, Download, Filter, MessageSquare, Plus, Search, Trash2, User, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Task {
  id: string
  title: string
  description: string | null
  owner: string | null
  deadline: string | null
  standard: string | null
  status: string
  follow_up_date: string | null
  project_id: string | null
  assigned_to: string | null
  projects?: { name: string } | null
  team_members?: { email: string; full_name: string | null } | null
  priority?: string
}

interface Project {
  id: string
  name: string
}

interface TeamMember {
  id: string
  email: string
  full_name: string | null
}

interface TaskTemplate {
  id: string
  name: string
  title: string
  description: string | null
  standard: string | null
  priority: string
}

export default function TasksList({
  tasks,
  projects,
  teamMembers,
  templates,
  userId,
}: {
  tasks: Task[]
  projects: Project[]
  teamMembers: TeamMember[]
  templates: TaskTemplate[]
  userId: string
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [owner, setOwner] = useState("")
  const [deadline, setDeadline] = useState("")
  const [standard, setStandard] = useState("")
  const [status, setStatus] = useState("pending")
  const [followUpDate, setFollowUpDate] = useState("")
  const [projectId, setProjectId] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [priority, setPriority] = useState("medium")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const router = useRouter()

  const loadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setTitle(template.title)
      setDescription(template.description || "")
      setStandard(template.standard || "")
      setPriority(template.priority)
      setSelectedTemplate(templateId)
    }
  }

  const openDialog = (task?: Task, templateId?: string) => {
    if (task) {
      setEditingTask(task)
      setTitle(task.title)
      setDescription(task.description || "")
      setOwner(task.owner || "")
      setDeadline(task.deadline?.slice(0, 16) || "")
      setStandard(task.standard || "")
      setStatus(task.status)
      setFollowUpDate(task.follow_up_date?.slice(0, 16) || "")
      setProjectId(task.project_id || "")
      setAssignedTo(task.assigned_to || "")
      setPriority((task as any).priority || "medium")
    } else {
      setEditingTask(null)
      setTitle("")
      setDescription("")
      setOwner("")
      setDeadline("")
      setStandard("")
      setStatus("pending")
      setFollowUpDate("")
      setProjectId("")
      setAssignedTo("")
      setPriority("medium")
      setSelectedTemplate("")
    }
    if (templateId) {
      loadTemplate(templateId)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const taskData = {
      user_id: userId,
      title,
      description: description || null,
      owner: owner || null,
      deadline: deadline || null,
      standard: standard || null,
      status,
      priority,
      follow_up_date: followUpDate || null,
      project_id: projectId || null,
      assigned_to: assignedTo || null,
    }

    if (editingTask) {
      await supabase.from("tasks").update(taskData).eq("id", editingTask.id)
    } else {
      await supabase.from("tasks").insert(taskData)
    }

    setIsDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return

    const supabase = createClient()
    await supabase.from("tasks").delete().eq("id", id)
    router.refresh()
  }

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

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(task.description?.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false
    }
    
    // Status filter
    if (statusFilter !== "all" && task.status !== statusFilter) {
      return false
    }
    
    // Priority filter
    if (priorityFilter !== "all" && (task as any).priority !== priorityFilter) {
      return false
    }
    
    // Project filter
    if (projectFilter !== "all" && task.project_id !== projectFilter) {
      return false
    }
    
    return true
  })

  const hasActiveFilters = searchQuery || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setProjectFilter("all")
  }

  return (
    <div>
        <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Tasks</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                // Export to CSV
                const csv = [
                  ["Title", "Status", "Priority", "Deadline", "Project", "Assigned To", "Description"].join(","),
                  ...filteredTasks.map((task) =>
                    [
                      `"${task.title}"`,
                      task.status,
                      (task as any).priority || "medium",
                      task.deadline ? new Date(task.deadline).toLocaleString() : "",
                      task.projects?.name || "",
                      task.team_members?.full_name || task.team_members?.email || "",
                      `"${(task.description || "").replace(/"/g, '""')}"`,
                    ].join(",")
                  ),
                ].join("\n")
                const blob = new Blob([csv], { type: "text/csv" })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `tasks-${new Date().toISOString().split("T")[0]}.csv`
                a.click()
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
              <DialogDescription>Define task details with clear ownership and deadlines</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {templates.length > 0 && !editingTask && (
                <div className="grid gap-2">
                  <Label htmlFor="template">Create from Template (Optional)</Label>
                  <Select value={selectedTemplate || "none"} onValueChange={(value) => value === "none" ? setSelectedTemplate("") : loadTemplate(value)}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None - Create from scratch</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Complete project documentation"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task details..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <Select value={projectId || "none"} onValueChange={(value) => setProjectId(value === "none" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="assigned-to">Assign To</Label>
                  <Select value={assignedTo || "none"} onValueChange={(value) => setAssignedTo(value === "none" ? "" : value)}>
                    <SelectTrigger id="assigned-to">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name || member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner">Owner (Text Field)</Label>
                <Input
                  id="owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Additional owner information (optional)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="standard">Quality Standard</Label>
                <Input
                  id="standard"
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  placeholder="What is the expected quality?"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="followup">Follow-up Date</Label>
                  <Input
                    id="followup"
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">{editingTask ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters ? "No tasks match your filters" : "No tasks yet"}
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => openDialog()}>Create Your First Task</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${statusColors[task.status as keyof typeof statusColors]} text-xs sm:text-sm`}>{task.status}</Badge>
                      {(task as any).priority && (
                        <Badge 
                          variant="outline" 
                          className={`${priorityColors[(task as any).priority as keyof typeof priorityColors]} text-xs sm:text-sm`}
                        >
                          {(task as any).priority}
                        </Badge>
                      )}
                      <CardTitle className="text-base sm:text-lg truncate">{task.title}</CardTitle>
                    </div>
                    {task.projects && (
                      <CardDescription className="text-xs sm:text-sm">Project: {task.projects.name}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openDialog(task)} className="text-xs sm:text-sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {task.team_members && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary">
                          {task.team_members.full_name || task.team_members.email}
                        </Badge>
                      </div>
                    )}
                    {task.owner && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{task.owner}</span>
                      </div>
                    )}
                    {task.deadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(task.deadline).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  {task.standard && (
                    <div className="text-sm">
                      <span className="font-semibold">Standard: </span>
                      <span className="text-muted-foreground">{task.standard}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comments
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
