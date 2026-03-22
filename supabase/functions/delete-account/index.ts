import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getUserId, getSupabaseAdmin } from "../_shared/auth.ts";
import { errorResponse } from "../_shared/errors.ts";

serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const userId = await getUserId(req);
    const body = await req.json().catch(() => ({}));

    if (body.confirm !== true) {
      return new Response(
        JSON.stringify({ error: "Confirmation required. Send { confirm: true }." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Delete user files from storage (must happen before auth deletion)
    try {
      const { data: files } = await admin.storage
        .from("user-files")
        .list(userId);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await admin.storage.from("user-files").remove(paths);
      }
    } catch (e) {
      // Storage cleanup is best-effort — don't block account deletion
      console.error("Storage cleanup failed:", e);
    }

    // 2. Delete auth user (CASCADE deletes all rows in all tables)
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Account deletion failed:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete account. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return errorResponse("Account deletion", e);
  }
});
