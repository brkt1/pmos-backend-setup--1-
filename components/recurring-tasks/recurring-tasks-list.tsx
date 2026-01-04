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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Calendar, Plus, Repeat, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface RecurringTask {
  id: string
  title: string
  description: string | null
  recurrence_type: string
  recurrence_interval: number
  next_due_date: string
  active: boolean
  created_at: string
}

export default function RecurringTasksList({
  recurringTasks,
  userId,
}: {
  recurringTasks: RecurringTask[]
  userId: string
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [recurrenceType, setRecurrenceType] = useState("weekly")
  const [recurrenceInterval, setRecurrenceInterval] = useState("1")
  const [nextDueDate, setNextDueDate] = useState("")
  const [active, setActive] = useState(true)
  const router = useRouter()

  const openDialog = (task?: RecurringTask) => {
    if (task) {
      setEditingTask(task)
      setTitle(task.title)
      setDescription(task.description || "")
      setRecurrenceType(task.recurrence_type)
      setRecurrenceInterval(task.recurrence_interval.toString())
      setNextDueDate(task.next_due_date)
      setActive(task.active)
    } else {
      setEditingTask(null)
      setTitle("")
      setDescription("")
      setRecurrenceType("weekly")
      setRecurrenceInterval("1")
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setNextDueDate(tomorrow.toISOString().split("T")[0])
      setActive(true)
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
      recurrence_type: recurrenceType,
      recurrence_interval: parseInt(recurrenceInterval),
      next_due_date: nextDueDate,
      active,
    }

    if (editingTask) {
      await supabase.from("recurring_tasks").update(taskData).eq("id", editingTask.id)
    } else {
      await supabase.from("recurring_tasks").insert(taskData)
    }

    setIsDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recurring task?")) return

    const supabase = createClient()
    await supabase.from("recurring_tasks").delete().eq("id", id)
    router.refresh()
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    const supabase = createClient()
    await supabase.from("recurring_tasks").update({ active: !currentActive }).eq("id", id)
    router.refresh()
  }

  const getRecurrenceLabel = (type: string, interval: number) => {
    const intervalText = interval === 1 ? "" : `every ${interval} `
    switch (type) {
      case "daily":
        return `${intervalText}day${interval > 1 ? "s" : ""}`
      case "weekly":
        return `${intervalText}week${interval > 1 ? "s" : ""}`
      case "monthly":
        return `${intervalText}month${interval > 1 ? "s" : ""}`
      case "yearly":
        return `${intervalText}year${interval > 1 ? "s" : ""}`
      default:
        return type
    }
  }

  const generateTasks = async () => {
    const supabase = createClient()
    const { error } = await supabase.rpc("generate_recurring_tasks")
    if (error) {
      alert("Error generating tasks: " + error.message)
    } else {
      alert("Recurring tasks generated successfully!")
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={generateTasks}>
          Generate Tasks Now
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Recurring Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Recurring Task" : "Create Recurring Task"}
              </DialogTitle>
              <DialogDescription>
                Set up a task that will automatically repeat
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="recurrence-type">Recurrence Type *</Label>
                    <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                      <SelectTrigger id="recurrence-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="interval">Interval *</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Repeat every {recurrenceInterval} {recurrenceType}
                      {parseInt(recurrenceInterval) > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="next-due-date">Next Due Date *</Label>
                  <Input
                    id="next-due-date"
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Task will generate automatically when active
                    </p>
                  </div>
                  <Switch id="active" checked={active} onCheckedChange={setActive} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingTask ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {recurringTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No recurring tasks yet</p>
            <Button onClick={() => openDialog()}>Create Your First Recurring Task</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recurringTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{task.title}</CardTitle>
                      <Badge variant={task.active ? "default" : "secondary"}>
                        {task.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {task.description && (
                      <CardDescription>{task.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(task.id, task.active)}
                    >
                      {task.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDialog(task)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Repeats:</span>
                    <span className="font-medium">
                      {getRecurrenceLabel(task.recurrence_type, task.recurrence_interval)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Next due:</span>
                    <span className="font-medium">
                      {format(new Date(task.next_due_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

