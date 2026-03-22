import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseForUser } from "../_shared/auth.ts";
import { decrypt } from "../_shared/crypto.ts";
import { errorResponse } from "../_shared/errors.ts";
import {
  deleteResource,
  putEvent,
  buildVTodo,
  appPriorityToIcal,
} from "../_shared/caldav-client.ts";

const MAX_TITLE = 500;
const MAX_DESC = 5000;

function validateHref(href: string, calendarHomeSet: string): boolean {
  try {
    const hrefUrl = new URL(href);
    const homeUrl = new URL(calendarHomeSet);
    return hrefUrl.protocol === "https:" && hrefUrl.hostname === homeUrl.hostname;
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const { supabase, userId } = await getSupabaseForUser(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action; // "delete" or "update-todo"

    const { data: creds } = await supabase
      .from("apple_credentials")
      .select("apple_id, app_password_encrypted, calendar_home_set, selected_calendar_id, selected_reminders_id")
      .eq("user_id", userId)
      .single();

    if (!creds) {
      return new Response(
        JSON.stringify({ error: "Apple not connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const password = await decrypt(creds.app_password_encrypted);
    const appleId = await decrypt(creds.apple_id);

    if (action === "delete") {
      const { href, etag } = body;
      if (!href || typeof href !== "string") {
        return new Response(
          JSON.stringify({ error: "href is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!validateHref(href, creds.calendar_home_set)) {
        return new Response(
          JSON.stringify({ error: "Invalid href" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      await deleteResource(href, appleId, password, etag);
      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update-todo") {
      const { href, uid, title, done, priority, description, due, etag } = body;
      if (!href || typeof href !== "string" || !uid) {
        return new Response(
          JSON.stringify({ error: "href and uid are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!validateHref(href, creds.calendar_home_set)) {
        return new Response(
          JSON.stringify({ error: "Invalid href" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const safeTitle = typeof title === "string" ? title.slice(0, MAX_TITLE) : "Untitled";
      const safeDesc = typeof description === "string" ? description.slice(0, MAX_DESC) : undefined;
      const safeDue = typeof due === "string" && /^\d{8}(T\d{6})?$/.test(due) ? due : undefined;
      const safePriority = ["high", "medium", "low"].includes(priority) ? priority : "medium";

      const ical = buildVTodo({
        uid,
        summary: safeTitle,
        due: safeDue,
        priority: appPriorityToIcal(safePriority),
        description: safeDesc,
        completed: done,
      });
      const result = await putEvent(href, ical, appleId, password, etag);
      return new Response(
        JSON.stringify({ ok: true, etag: result.etag }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return errorResponse("CalDAV item", e);
  }
});
