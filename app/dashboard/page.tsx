import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DailyDashboard from "@/components/dashboard/daily-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const today = new Date().toISOString().split("T")[0]

  // Get or create today's dashboard
  const { data: dashboard } = await supabase
    .from("daily_dashboards")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  // Get today's behavior logs
  const { data: behaviorLogs } = await supabase
    .from("daily_behavior_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .order("created_at", { ascending: true })

  // Get today's tasks
  const { data: todaysTasks } = await supabase
    .from("tasks")
    .select("*, projects(name)")
    .eq("user_id", user.id)
    .gte("deadline", today)
    .lte("deadline", `${today}T23:59:59`)
    .order("deadline", { ascending: true })

  // Get active strategies
  const { data: strategies } = await supabase
    .from("strategies")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("priority", { ascending: true })
    .limit(3)

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <DailyDashboard
        dashboard={dashboard}
        behaviorLogs={behaviorLogs || []}
        todaysTasks={todaysTasks || []}
        strategies={strategies || []}
        userId={user.id}
        today={today}
      />
    </div>
  )
}
