"use server"

import { createClient } from "@/lib/supabase/server"
import { getDashboardUrl } from "@/lib/utils/user-role"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session && data.user) {
    // Revalidate to ensure fresh data
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/team-member")
    
    // Check user role and redirect to appropriate dashboard
    const dashboardUrl = await getDashboardUrl(data.user.id)
    redirect(dashboardUrl)
  }

  return { error: "Login failed" }
}

