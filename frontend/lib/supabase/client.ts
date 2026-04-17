import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser / public client. Uses the anon (or publishable) key — never the service role key.
 * Prefer NEXT_PUBLIC_SUPABASE_ANON_KEY (JWT from Project Settings → API); the newer
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is used as fallback if the SDK accepts it.
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }
  return createClient(url, key, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: true,
    },
  });
}
