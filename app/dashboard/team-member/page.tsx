import NotificationBell from "@/components/notifications/notification-bell"
import TeamMemberDashboard from "@/components/team/team-member-dashboard"
import { TeamMemberNav } from "@/components/team/team-member-nav"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { LogOut } from "lucide-react"
import Image from "next/image"
import { redirect } from "next/navigation"

export default async function TeamMemberDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a team member
  const { data: teamMember } = await supabase
    .from("team_members")
    .select("*, roles(name), users:manager_id(email, full_name)")
    .eq("user_id", user.id)
    .single()

  if (!teamMember) {
    // Not a team member, redirect to regular dashboard
    redirect("/dashboard")
  }

  // Get assigned tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      projects(name),
      users:user_id(email, full_name)
    `)
    .eq("assigned_to", teamMember.id)
    .order("deadline", { ascending: true, nullsFirst: false })

  // Get unread notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("read", false)
    .order("created_at", { ascending: false })
    .limit(10)

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Image src="/Logo.svg" alt="PMOS Logo" width={32} height={32} className="h-8 w-8 shrink-0" />
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <h2 className="text-base md:text-lg font-bold">PMOS</h2>
              <span className="hidden md:inline text-xs text-muted-foreground">Team Member</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell userId={user.id} />
            <div className="hidden sm:block text-sm">
              <span className="text-muted-foreground">Signed in as </span>
              <span className="font-semibold truncate max-w-[120px] md:max-w-none inline-block">{user.email}</span>
            </div>
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit" className="gap-1 md:gap-2">
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-card border-r flex-col shrink-0">
          <TeamMemberNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full min-w-0">
          <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-7xl">
            <TeamMemberDashboard
              teamMember={teamMember}
              tasks={tasks || []}
              notifications={notifications || []}
              userId={user.id}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

