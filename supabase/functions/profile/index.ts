import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseForUser } from "../_shared/auth.ts";
import { encryptFields, decryptFields } from "../_shared/crypto.ts";
import { errorResponse } from "../_shared/errors.ts";

const PII_FIELDS = [
  "preferred_name",
  "address_line1", "address_line2", "city", "state", "zip", "country",
] as const;

serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const { supabase, userId } = await getSupabaseForUser(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "read";

    if (action === "read") {
      const { data } = await supabase
        .from("profiles")
        .select(PII_FIELDS.join(", "))
        .eq("id", userId)
        .single();

      if (!data) {
        return new Response(
          JSON.stringify({}),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const encrypted: Record<string, string | null> = {};
      for (const f of PII_FIELDS) encrypted[f] = data[f] ?? null;

      const decrypted = await decryptFields(encrypted);

      return new Response(
        JSON.stringify(decrypted),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "write") {
      // Collect plaintext values from request
      const plaintext: Record<string, string | null> = {};
      for (const f of PII_FIELDS) {
        const v = body[f];
        plaintext[f] = typeof v === "string" && v.trim() ? v.trim() : null;
      }

      // Truncate fields
      for (const f of PII_FIELDS) {
        if (plaintext[f] && plaintext[f]!.length > 200) {
          plaintext[f] = plaintext[f]!.slice(0, 200);
        }
      }

      const encrypted = await encryptFields(plaintext);

      const { error } = await supabase
        .from("profiles")
        .update(encrypted)
        .eq("id", userId);

      if (error) {
        console.error("Profile update failed:", error);
        return new Response(
          JSON.stringify({ error: "Failed to save profile." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return errorResponse("Profile", e);
  }
});
