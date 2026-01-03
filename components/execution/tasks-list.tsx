"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Trash2, Calendar, User } from "lucide-react"

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
  projects?: { name: string } | null
}

interface Project {
  id: string
  name: string
}

export default function TasksList({
  tasks,
  projects,
  userId,
}: {
  tasks: Task[]
  projects: Project[]
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
  const router = useRouter()

  const openDialog = (task?: Task) => {
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
      follow_up_date: followUpDate || null,
      project_id: projectId || null,
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

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
              <DialogDescription>Define task details with clear ownership and deadlines</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Select value={projectId} onValueChange={setProjectId}>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input
                    id="owner"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Who is responsible?"
                  />
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
                <Label htmlFor="standard">Quality Standard</Label>
                <Input
                  id="standard"
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  placeholder="What is the expected quality?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingTask ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No tasks yet</p>
            <Button onClick={() => openDialog()}>Create Your First Task</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[task.status as keyof typeof statusColors]}>{task.status}</Badge>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                    {task.projects && (
                      <CardDescription className="text-sm">Project: {task.projects.name}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDialog(task)}>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
