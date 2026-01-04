import { getDashboardUrl } from "@/lib/utils/user-role"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log(`[Proxy] Path: ${request.nextUrl.pathname}, User: ${user ? user.email : "none"}`)
  }

  // Protected routes that require authentication
  // Note: /api/cron/generate-tasks is excluded as it has its own authentication
  const protectedRoutes = [
    "/dashboard",
  ]
  
  // API routes that require authentication (excluding cron)
  const protectedApiRoutes = [
    "/api",
  ]
  
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")
  const isCronRoute = request.nextUrl.pathname === "/api/cron/generate-tasks"

  // Manager-only routes (team members should not access these)
  // Note: /dashboard/notifications and /dashboard/team-member are accessible to team members
  const managerOnlyRoutes = [
    "/dashboard/vision",
    "/dashboard/strategy",
    "/dashboard/execution",
    "/dashboard/reviews",
    "/dashboard/team",
    "/dashboard/calendar",
    "/dashboard/analytics",
    "/dashboard/recurring-tasks",
    "/dashboard/templates",
    "/dashboard/settings",
  ]

  // Exact path for main dashboard - managers only
  const isMainDashboard = request.nextUrl.pathname === "/dashboard"

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  ) && !isCronRoute

  const isManagerOnlyRoute = managerOnlyRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Protect API routes (except cron which has its own auth)
  if (isProtectedApiRoute && !user) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Proxy] Unauthorized API access: ${request.nextUrl.pathname}`)
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Redirect to login if accessing protected routes without auth
  if (isProtectedRoute && !user) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Proxy] Redirecting to login - no user found for ${request.nextUrl.pathname}`)
    }
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    // Preserve the intended destination
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Check role-based access for manager-only routes and main dashboard
  if ((isManagerOnlyRoute || isMainDashboard) && user) {
    const { getUserRole } = await import("@/lib/utils/user-role")
    const userRole = await getUserRole(user.id)

    // Redirect team members away from manager-only routes and main dashboard
    if (userRole === "team_member") {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Proxy] Redirecting team member from manager route: ${request.nextUrl.pathname}`)
      }
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard/team-member"
      return NextResponse.redirect(url)
    }
  }

  // Redirect to appropriate dashboard if accessing auth pages while logged in
  const authRoutes = ["/auth/login", "/auth/sign-up", "/auth/accept-invite"]
  if (authRoutes.some((route) => request.nextUrl.pathname.startsWith(route)) && user) {
    const url = request.nextUrl.clone()
    const dashboardUrl = await getDashboardUrl(user.id)
    url.pathname = dashboardUrl
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
