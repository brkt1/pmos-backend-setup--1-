import type React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LayoutDashboard, Target, TrendingUp, CheckSquare, Calendar, LogOut } from "lucide-react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">PMOS</h2>
          <p className="text-xs text-muted-foreground">Personal Management OS</p>
        </div>

        <nav className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Daily Dashboard
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard/vision">
              <Target className="h-4 w-4 mr-2" />
              Vision Layer
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard/strategy">
              <TrendingUp className="h-4 w-4 mr-2" />
              Strategy Layer
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard/execution">
              <CheckSquare className="h-4 w-4 mr-2" />
              Execution Layer
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard/reviews">
              <Calendar className="h-4 w-4 mr-2" />
              Reviews
            </Link>
          </Button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 bg-secondary rounded-md mb-2 text-sm">
            <p className="font-semibold truncate">{user.email}</p>
          </div>
          <form action={handleSignOut}>
            <Button variant="outline" className="w-full bg-transparent" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
