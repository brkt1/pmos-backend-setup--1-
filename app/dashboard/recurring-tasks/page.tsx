import RecurringTasksList from "@/components/recurring-tasks/recurring-tasks-list"
import { createClient } from "@/lib/supabase/server"
import { requireManager } from "@/lib/utils/require-manager"

export default async function RecurringTasksPage() {
  const user = await requireManager()
  const supabase = await createClient()

  const { data: recurringTasks } = await supabase
    .from("recurring_tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Recurring Tasks</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage tasks that repeat automatically
        </p>
      </div>

      <RecurringTasksList recurringTasks={recurringTasks || []} userId={user.id} />
    </div>
  )
}

