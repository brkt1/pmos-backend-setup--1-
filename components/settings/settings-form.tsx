"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Bell, Monitor, Moon, Sun, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Settings {
  user_id: string
  email_notifications: boolean
  task_reminders: boolean
  reminder_time: string
  theme: string
}

interface Profile {
  id: string
  email: string
  full_name: string | null
  timezone: string
}

export default function SettingsForm({
  settings,
  profile,
  userId,
}: {
  settings: Settings | null
  profile: Profile | null
  userId: string
}) {
  const [emailNotifications, setEmailNotifications] = useState(settings?.email_notifications ?? true)
  const [taskReminders, setTaskReminders] = useState(settings?.task_reminders ?? true)
  const [reminderTime, setReminderTime] = useState(settings?.reminder_time?.slice(0, 5) || "09:00")
  const [theme, setTheme] = useState(settings?.theme || "system")
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [timezone, setTimezone] = useState(profile?.timezone || "UTC")
  const router = useRouter()

  const handleSaveSettings = async () => {
    const supabase = createClient()

    // Save user settings
    const settingsData = {
      user_id: userId,
      email_notifications: emailNotifications,
      task_reminders: taskReminders,
      reminder_time: reminderTime,
      theme,
    }

    if (settings) {
      await supabase.from("user_settings").update(settingsData).eq("user_id", userId)
    } else {
      await supabase.from("user_settings").insert(settingsData)
    }

    // Save profile
    await supabase
      .from("users")
      .update({
        full_name: fullName || null,
        timezone,
      })
      .eq("id", userId)

    router.refresh()
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
        <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveSettings}>Save Profile</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-reminders">Task Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminders for upcoming task deadlines</p>
              </div>
              <Switch
                id="task-reminders"
                checked={taskReminders}
                onCheckedChange={setTaskReminders}
              />
            </div>

            {taskReminders && (
              <div className="grid gap-2">
                <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

