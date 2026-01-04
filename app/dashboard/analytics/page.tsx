import AnalyticsDashboard from "@/components/analytics/analytics-dashboard"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get all tasks for analytics
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, projects(name)")
    .eq("user_id", user.id)

  // Get strategies
  const { data: strategies } = await supabase
    .from("strategies")
    .select("*")
    .eq("user_id", user.id)

  // Get team members
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("*")
    .eq("manager_id", user.id)

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground">Track your productivity and team performance</p>
      </div>

      <AnalyticsDashboard
        tasks={tasks || []}
        strategies={strategies || []}
        teamMembers={teamMembers || []}
      />
    </div>
  )
}

