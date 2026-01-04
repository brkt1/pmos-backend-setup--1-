import CalendarView from "@/components/calendar/calendar-view"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get all tasks with deadlines
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, projects(name), team_members(email, full_name)")
    .eq("user_id", user.id)
    .not("deadline", "is", null)
    .order("deadline", { ascending: true })

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Calendar View</h1>
        <p className="text-sm sm:text-base text-muted-foreground">View your tasks and deadlines on a calendar</p>
      </div>

      <CalendarView tasks={tasks || []} />
    </div>
  )
}

