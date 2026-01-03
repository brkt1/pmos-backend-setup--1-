import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StrategyList from "@/components/strategy/strategy-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function StrategyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get current month/year
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`

  // Fetch strategies for current month
  const { data: strategies } = await supabase
    .from("strategies")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("priority", { ascending: true })

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Strategy Layer</h1>
          <p className="text-muted-foreground">Define your top 3 monthly priorities and track key metrics</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/strategy/new">Add Strategy</Link>
        </Button>
      </div>
      <StrategyList strategies={strategies || []} />
    </div>
  )
}
