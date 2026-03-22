import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Returns a Supabase client with the service role key (bypasses RLS).
 * SECURITY: Only use for operations that genuinely require admin access
 * (e.g., cross-user queries, system-level maintenance). Prefer
 * getSupabaseForUser() for all user-scoped operations.
 */
export function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

export async function getUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Missing authorization header");

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) throw new Error("Invalid token");
  return user.id;
}

/** Returns a Supabase client scoped to the authenticated user (RLS-enforced) */
export async function getSupabaseForUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Missing authorization header");

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) throw new Error("Invalid token");
  return { supabase, userId: user.id };
}
