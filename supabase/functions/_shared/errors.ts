import { corsHeaders } from "./cors.ts";

/**
 * Returns a sanitized JSON error response.
 * Logs the full error server-side but only sends a generic message to the client.
 */
export function errorResponse(
  label: string,
  error: unknown,
  status = 500
): Response {
  console.error(`[${label}]`, error);
  return new Response(
    JSON.stringify({ error: `${label}: an unexpected error occurred. Please try again.` }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
