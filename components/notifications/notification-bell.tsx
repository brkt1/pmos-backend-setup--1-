"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Bell } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  related_id: string | null
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
    
    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const loadNotifications = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.read).length)
    }
  }

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from("notifications").update({ read: true }).eq("id", id)
    loadNotifications()
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)
    loadNotifications()
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notification.read ? "bg-muted" : ""
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id)
                  }
                  setIsOpen(false)
                }}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{notification.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications" className="w-full text-center">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

