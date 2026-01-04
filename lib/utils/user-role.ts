import { createClient } from "@/lib/supabase/server"

export type UserRole = "manager" | "team_member" | "both" | "none"

/**
 * Determines the role of a user
 * @param userId - The user's ID
 * @returns The user's role: "manager", "team_member", "both", or "none"
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient()

  // Check if user is a manager (has their own account in users table)
  const { data: managerData } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single()

  // Check if user is a team member
  const { data: teamMemberData } = await supabase
    .from("team_members")
    .select("id")
    .eq("user_id", userId)
    .single()

  const isManager = !!managerData
  const isTeamMember = !!teamMemberData

  if (isManager && isTeamMember) {
    return "both"
  } else if (isManager) {
    return "manager"
  } else if (isTeamMember) {
    return "team_member"
  } else {
    return "none"
  }
}

/**
 * Gets the appropriate dashboard URL based on user role
 * @param userId - The user's ID
 * @returns The dashboard URL to redirect to
 */
export async function getDashboardUrl(userId: string): Promise<string> {
  const role = await getUserRole(userId)

  if (role === "team_member") {
    return "/dashboard/team-member"
  } else {
    return "/dashboard"
  }
}

