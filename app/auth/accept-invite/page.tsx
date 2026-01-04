"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function AcceptInvitePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<{ email: string; full_name: string | null } | null>(null)

  useEffect(() => {
    if (token) {
      loadInviteInfo()
    }
  }, [token])

  const loadInviteInfo = async () => {
    if (!token) return
    const supabase = createClient()
    const { data } = await supabase
      .from("team_members")
      .select("email, full_name")
      .eq("invite_token", token)
      .is("user_id", null)
      .single()

    if (data) {
      setInviteInfo(data)
      setEmail(data.email)
      setFullName(data.full_name || "")
    } else {
      setError("Invalid or expired invite token")
    }
  }

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError("Missing invite token")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      if (signUpData.user) {
        // Accept the invite by linking the user to the team member record
        const { error: acceptError } = await supabase.rpc("accept_team_invite", {
          p_token: token,
          p_user_id: signUpData.user.id,
        })

        if (acceptError) {
          console.error("Error accepting invite:", acceptError)
          // User is created but invite linking failed - they can still login
        }

        router.push("/auth/sign-up-success")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Invalid invite link</p>
            <Link href="/auth/login" className="block text-center mt-4 text-sm underline">
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <Image src="/Logo.svg" alt="PMOS Logo" width={64} height={64} className="h-12 w-12 sm:h-16 sm:w-16" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">Accept Team Invite</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {inviteInfo ? `Join ${inviteInfo.full_name || inviteInfo.email}'s team` : "Create your account to join the team"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcceptInvite}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!inviteInfo}
                  />
                  {inviteInfo && (
                    <p className="text-xs text-muted-foreground">This email was provided in your invite</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Accept Invite & Create Account"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

