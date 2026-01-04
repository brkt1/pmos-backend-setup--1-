import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// This endpoint can be called by Vercel Cron or external cron services
// to generate tasks from recurring templates
export async function GET(request: Request) {
  // For external cron services, you can add authentication here
  // Vercel Cron automatically secures this endpoint
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  
  // If CRON_SECRET is set and this is not a Vercel Cron request, require auth
  if (cronSecret) {
    const vercelSignature = request.headers.get("x-vercel-signature")
    // If no Vercel signature and auth header doesn't match, reject
    if (!vercelSignature && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const supabase = await createClient()
    
    // Call the database function to generate recurring tasks
    const { data, error } = await supabase.rpc("generate_recurring_tasks")

    if (error) {
      console.error("Error generating recurring tasks:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Recurring tasks generated successfully",
      data,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Also support POST for cron services that use POST
export async function POST(request: Request) {
  return GET(request)
}

