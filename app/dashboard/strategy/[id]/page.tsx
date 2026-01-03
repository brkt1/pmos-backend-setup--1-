import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StrategyForm from "@/components/strategy/strategy-form"

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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Strategy</h1>
        <p className="text-muted-foreground">Update your strategic priority</p>
      </div>
      <StrategyForm userId={user.id} initialData={strategy} />
    </div>
  )
}
