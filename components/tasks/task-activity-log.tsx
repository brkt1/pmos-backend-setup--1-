"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Activity, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface ActivityLog {
  id: string
  action: string
  old_value: string | null
  new_value: string | null
  created_at: string
  users?: {
    full_name: string | null
    email: string
  }
}

export default function TaskActivityLog({ taskId }: { taskId: string }) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [taskId])

  const loadActivities = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("task_activity_log")
      .select(`
        *,
        users:user_id(full_name, email)
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })

    if (data) {
      setActivities(data)
    }
    setIsLoading(false)
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "status_changed":
        return "Status changed"
      case "assigned_changed":
        return "Assignment changed"
      default:
        return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "status_changed":
        return "🔄"
      case "assigned_changed":
        return "👤"
      default:
        return "📝"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity recorded yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Log ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
            >
              <div className="text-xl shrink-0">{getActionIcon(activity.action)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {getActionLabel(activity.action)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(activity.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                {activity.old_value && activity.new_value && (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">From:</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.old_value}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">To:</span>
                      <Badge variant="default" className="text-xs">
                        {activity.new_value}
                      </Badge>
                    </div>
                  </div>
                )}
                {activity.users && (
                  <div className="text-xs text-muted-foreground mt-1">
                    by {activity.users.full_name || activity.users.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

