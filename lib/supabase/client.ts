import { createBrowserClient } from "@supabase/ssr"

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing instance if available
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
  }

  // Create and cache the client instance
  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Use a unique storage key to avoid conflicts
      storageKey: "pmos-auth-token",
      // Ensure persistence is enabled
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  })

  return clientInstance
}
