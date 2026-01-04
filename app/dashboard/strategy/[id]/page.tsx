import StrategyForm from "@/components/strategy/strategy-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function EditStrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: strategy } = await supabase.from("strategies").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!strategy) {
    redirect("/dashboard/strategy")
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Edit Strategy</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Update your strategic priority</p>
      </div>
      <StrategyForm userId={user.id} initialData={strategy} />
    </div>
  )
}
