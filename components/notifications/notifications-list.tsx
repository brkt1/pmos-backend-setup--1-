"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { CheckCheck, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  related_id: string | null
}

export default function NotificationsList({
  notifications,
  userId,
}: {
  notifications: Notification[]
  userId: string
}) {
  const [localNotifications, setLocalNotifications] = useState(notifications)
  const router = useRouter()

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from("notifications").update({ read: true }).eq("id", id)
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    router.refresh()
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    router.refresh()
  }

  const deleteNotification = async (id: string) => {
    const supabase = createClient()
    await supabase.from("notifications").delete().eq("id", id)
    setLocalNotifications((prev) => prev.filter((n) => n.id !== id))
    router.refresh()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "👤"
      case "task_due":
        return "⏰"
      case "task_overdue":
        return "🚨"
      case "task_completed":
        return "✅"
      case "comment_added":
        return "💬"
      default:
        return "🔔"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "bg-blue-500/10 border-blue-500/20"
      case "task_due":
        return "bg-yellow-500/10 border-yellow-500/20"
      case "task_overdue":
        return "bg-red-500/10 border-red-500/20"
      case "task_completed":
        return "bg-green-500/10 border-green-500/20"
      case "comment_added":
        return "bg-purple-500/10 border-purple-500/20"
      default:
        return "bg-gray-500/10 border-gray-500/20"
    }
  }

  const unreadCount = localNotifications.filter((n) => !n.read).length

  return (
    <div className="space-y-4">
      {localNotifications.length > 0 && unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      )}

      {localNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {localNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all ${
                !notification.read ? getNotificationColor(notification.type) : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        {!notification.read && (
                          <Badge variant="default" className="h-5 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

