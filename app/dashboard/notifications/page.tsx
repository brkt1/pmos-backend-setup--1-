import NotificationsList from "@/components/notifications/notifications-list"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Notifications</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Stay updated on your tasks and activities
        </p>
      </div>

      <NotificationsList notifications={notifications || []} userId={user.id} />
    </div>
  )
}

