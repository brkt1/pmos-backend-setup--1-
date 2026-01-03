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
import { Plus, Trash2 } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  created_at: string
}

export default function ProjectsList({ projects, userId }: { projects: Project[]; userId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("active")
  const router = useRouter()

  const openDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setName(project.name)
      setDescription(project.description || "")
      setStatus(project.status)
    } else {
      setEditingProject(null)
      setName("")
      setDescription("")
      setStatus("active")
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const projectData = {
      user_id: userId,
      name,
      description: description || null,
      status,
    }

    if (editingProject) {
      await supabase.from("projects").update(projectData).eq("id", editingProject.id)
    } else {
      await supabase.from("projects").insert(projectData)
    }

    setIsDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? Associated tasks will remain but be unlinked.")) return

    const supabase = createClient()
    await supabase.from("projects").delete().eq("id", id)
    router.refresh()
  }

  const statusColors = {
    active: "bg-green-500",
    completed: "bg-blue-500",
    "on-hold": "bg-gray-500",
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Create Project"}</DialogTitle>
              <DialogDescription>Organize your tasks into projects for better management</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Website redesign"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingProject ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button onClick={() => openDialog()}>Create Your First Project</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDialog(project)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {project.description && (
                <CardContent>
                  <CardDescription className="text-sm">{project.description}</CardDescription>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
