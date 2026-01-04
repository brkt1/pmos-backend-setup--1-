import { createClient } from "@/lib/supabase/server"
import { getUserRole } from "@/lib/utils/user-role"
import { redirect } from "next/navigation"

/**
 * Requires the user to be a manager (not just a team member)
 * Redirects team members to their dashboard
 */
export async function requireManager() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const userRole = await getUserRole(user.id)

  // Redirect team members to their dashboard
  if (userRole === "team_member") {
    redirect("/dashboard/team-member")
  }

  // If user has no role or is neither manager nor team member, redirect to login
  if (userRole === "none") {
    redirect("/auth/login")
  }

  return user
}

