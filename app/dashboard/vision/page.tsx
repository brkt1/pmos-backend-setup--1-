import VisionForm from "@/components/vision/vision-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function VisionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch existing vision data
  const { data: vision } = await supabase.from("vision").select("*").eq("user_id", user.id).single()

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Vision Layer</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Define your long-term goals, core values, and non-negotiables. This is your foundational framework.
        </p>
      </div>
      <VisionForm initialData={vision} userId={user.id} />
    </div>
  )
}
