import StrategyList from "@/components/strategy/strategy-list"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

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
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-6xl">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Strategy Layer</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Define your top 3 monthly priorities and track key metrics
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto shrink-0">
          <Link href="/dashboard/strategy/new">Add Strategy</Link>
        </Button>
      </div>
      <StrategyList strategies={strategies || []} />
    </div>
  )
}
