// IMPORTANT: Set ALLOWED_ORIGIN in Edge Function secrets for production
// e.g.: supabase secrets set ALLOWED_ORIGIN=https://yourdomain.com
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "*";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  ...(allowedOrigin !== "*" ? { Vary: "Origin" } : {}),
};

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}
