import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StrategyForm from "@/components/strategy/strategy-form"

export default async function NewStrategyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Strategy</h1>
        <p className="text-muted-foreground">Define a new strategic priority for the current period</p>
      </div>
      <StrategyForm userId={user.id} />
    </div>
  )
}
