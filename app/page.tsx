import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getDashboardUrl } from "@/lib/utils/user-role"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const dashboardUrl = await getDashboardUrl(user.id)
    redirect(dashboardUrl)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background to-secondary">
      <div className="max-w-3xl w-full text-center space-y-4 sm:space-y-6">
        <div className="flex justify-center mb-2 sm:mb-4">
          <Image src="/Logo.svg" alt="PMOS Logo" width={120} height={120} className="h-16 w-16 sm:h-24 sm:w-24" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 px-4">
          Personal Management Operating System
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
          A systematic approach to management that doesn&apos;t rely on memory or motivation. Your system tells you what
          to think about every day.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 text-left px-4">
          <div className="p-3 sm:p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Vision Layer</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Long-term goals and values</p>
          </div>
          <div className="p-3 sm:p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Strategy Layer</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Monthly priorities and metrics</p>
          </div>
          <div className="p-3 sm:p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Execution Layer</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Projects and tasks with ownership</p>
          </div>
          <div className="p-3 sm:p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Daily Control</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Morning checklist and evening review</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
