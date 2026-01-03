import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProjectsList from "@/components/execution/projects-list"
import TasksList from "@/components/execution/tasks-list"

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

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, projects(name)")
    .eq("user_id", user.id)
    .order("deadline", { ascending: true, nullsFirst: false })

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Execution Layer</h1>
        <p className="text-muted-foreground">Manage projects and tasks with clear ownership and deadlines</p>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <TasksList tasks={tasks || []} projects={projects || []} userId={user.id} />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectsList projects={projects || []} userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
