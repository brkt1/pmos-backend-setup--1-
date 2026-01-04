import TeamManagement from "@/components/team/team-management"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get roles
  const { data: roles } = await supabase
    .from("roles")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  // Get team members
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("*, roles(name)")
    .eq("manager_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Team Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage roles and assign team members to track and delegate tasks</p>
      </div>

      <TeamManagement
        roles={roles || []}
        teamMembers={teamMembers || []}
        userId={user.id}
      />
    </div>
  )
}

