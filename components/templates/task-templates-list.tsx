"use client"

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
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface TaskTemplate {
  id: string
  name: string
  title: string
  description: string | null
  standard: string | null
  priority: string
  created_at: string
}

export default function TaskTemplatesList({
  templates,
  userId,
}: {
  templates: TaskTemplate[]
  userId: string
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null)
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [standard, setStandard] = useState("")
  const [priority, setPriority] = useState("medium")
  const router = useRouter()

  const openDialog = (template?: TaskTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setName(template.name)
      setTitle(template.title)
      setDescription(template.description || "")
      setStandard(template.standard || "")
      setPriority(template.priority)
    } else {
      setEditingTemplate(null)
      setName("")
      setTitle("")
      setDescription("")
      setStandard("")
      setPriority("medium")
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const templateData = {
      user_id: userId,
      name,
      title,
      description: description || null,
      standard: standard || null,
      priority,
    }

    if (editingTemplate) {
      await supabase
        .from("task_templates")
        .update(templateData)
        .eq("id", editingTemplate.id)
    } else {
      await supabase.from("task_templates").insert(templateData)
    }

    setIsDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return

    const supabase = createClient()
    await supabase.from("task_templates").delete().eq("id", id)
    router.refresh()
  }

  const priorityColors = {
    low: "bg-gray-400",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    urgent: "bg-red-600",
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create Template"}
              </DialogTitle>
              <DialogDescription>
                Create a reusable template for common tasks
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Weekly Review"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="standard">Standard</Label>
                  <Textarea
                    id="standard"
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    rows={2}
                    placeholder="Definition of done or success criteria"
                  />
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
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingTemplate ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No templates yet</p>
            <Button onClick={() => openDialog()}>Create Your First Template</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{template.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`${priorityColors[template.priority as keyof typeof priorityColors]} text-white`}
                      >
                        {template.priority}
                      </Badge>
                    </div>
                    <CardDescription className="font-medium">{template.title}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openDialog(template)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {template.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  {template.standard && (
                    <div className="text-sm">
                      <span className="font-semibold">Standard: </span>
                      <span className="text-muted-foreground">{template.standard}</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

