import TaskTemplatesList from "@/components/templates/task-templates-list"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function TemplatesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: templates } = await supabase
    .from("task_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Task Templates</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Create reusable task templates for common workflows
        </p>
      </div>

      <TaskTemplatesList templates={templates || []} userId={user.id} />
    </div>
  )
}

