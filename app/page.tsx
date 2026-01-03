import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-bold mb-4">Personal Management Operating System</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A systematic approach to management that doesn&apos;t rely on memory or motivation. Your system tells you what
          to think about every day.
        </p>

        <div className="grid md:grid-cols-4 gap-4 mb-8 text-left">
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Vision Layer</h3>
            <p className="text-sm text-muted-foreground">Long-term goals and values</p>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Strategy Layer</h3>
            <p className="text-sm text-muted-foreground">Monthly priorities and metrics</p>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Execution Layer</h3>
            <p className="text-sm text-muted-foreground">Projects and tasks with ownership</p>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Daily Control</h3>
            <p className="text-sm text-muted-foreground">Morning checklist and evening review</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
