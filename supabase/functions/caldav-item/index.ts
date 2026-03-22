import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseForUser } from "../_shared/auth.ts";
import { decrypt } from "../_shared/crypto.ts";
import {
  deleteResource,
  putEvent,
  buildVTodo,
  appPriorityToIcal,
} from "../_shared/caldav-client.ts";

serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const { supabase, userId } = await getSupabaseForUser(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action; // "delete" or "update-todo"

    const { data: creds } = await supabase
      .from("apple_credentials")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!creds) {
      return new Response(
        JSON.stringify({ error: "Apple not connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const password = await decrypt(creds.app_password_encrypted);

    if (action === "delete") {
      const { href, etag } = body;
      if (!href) {
        return new Response(
          JSON.stringify({ error: "href is required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      await deleteResource(href, creds.apple_id, password, etag);
      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update-todo") {
      const { href, uid, title, done, priority, description, due, etag } = body;
      if (!href || !uid) {
        return new Response(
          JSON.stringify({ error: "href and uid are required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const ical = buildVTodo({
        uid,
        summary: title || "Untitled",
        due,
        priority: appPriorityToIcal(priority || "medium"),
        description,
        completed: done,
      });
      const result = await putEvent(href, ical, creds.apple_id, password, etag);
      return new Response(
        JSON.stringify({ ok: true, etag: result.etag }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action: " + action }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("caldav-item error:", e);
    return new Response(
      JSON.stringify({ error: "Item action failed: " + String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
