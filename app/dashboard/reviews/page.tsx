import DailyReviewsList from "@/components/reviews/daily-reviews-list"
import WeeklyReviewsList from "@/components/reviews/weekly-reviews-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ReviewsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get last 30 days of daily reviews
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: dailyReviews } = await supabase
    .from("daily_dashboards")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false })

  // Get weekly reviews
  const { data: weeklyReviews } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Review Systems</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track your daily progress and conduct weekly strategic reviews</p>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly" className="text-xs sm:text-sm">Weekly Reviews</TabsTrigger>
          <TabsTrigger value="daily" className="text-xs sm:text-sm">Daily History</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-6">
          <WeeklyReviewsList weeklyReviews={weeklyReviews || []} userId={user.id} />
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <DailyReviewsList dailyReviews={dailyReviews || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
