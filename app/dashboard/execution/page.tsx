import ProjectsList from "@/components/execution/projects-list"
import TasksList from "@/components/execution/tasks-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ExecutionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get tasks where user is owner, with team member info if assigned
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      projects(name),
      team_members:assigned_to(email, full_name)
    `)
    .eq("user_id", user.id)
    .order("deadline", { ascending: true, nullsFirst: false })

  // Get team members for assignment
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("*")
    .eq("manager_id", user.id)
    .eq("status", "active")
    .order("full_name", { ascending: true })

  // Get task templates
  const { data: templates } = await supabase
    .from("task_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Execution Layer</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage projects and tasks with clear ownership and deadlines</p>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
          <TabsTrigger value="projects" className="text-xs sm:text-sm">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <TasksList
            tasks={tasks || []}
            projects={projects || []}
            teamMembers={teamMembers || []}
            templates={templates || []}
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectsList projects={projects || []} userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
