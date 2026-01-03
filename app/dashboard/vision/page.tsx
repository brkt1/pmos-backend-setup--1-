import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import VisionForm from "@/components/vision/vision-form"

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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vision Layer</h1>
        <p className="text-muted-foreground">
          Define your long-term goals, core values, and non-negotiables. This is your foundational framework.
        </p>
      </div>
      <VisionForm initialData={vision} userId={user.id} />
    </div>
  )
}
