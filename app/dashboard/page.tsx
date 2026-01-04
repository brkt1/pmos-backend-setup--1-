import DailyDashboard from "@/components/dashboard/daily-dashboard"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a team member only (not a manager)
  const { data: teamMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("user_id", user.id)
    .single()

  const { data: isManager } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single()

  // Redirect team members to their dashboard
  if (teamMember && !isManager) {
    redirect("/dashboard/team-member")
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
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-7xl">
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
