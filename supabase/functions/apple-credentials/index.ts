import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseForUser } from "../_shared/auth.ts";
import { encrypt } from "../_shared/crypto.ts";
import {
  discoverPrincipal,
  discoverCalendarHome,
  listCalendars,
} from "../_shared/caldav-client.ts";

serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const { supabase, userId } = await getSupabaseForUser(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "status";

    if (action === "status") {
      const { data } = await supabase
        .from("apple_credentials")
        .select("apple_id, last_sync_at, sync_enabled, selected_calendar_id, selected_reminders_id")
        .eq("user_id", userId)
        .single();

      if (!data) {
        return new Response(
          JSON.stringify({ connected: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const maskedId = data.apple_id.replace(/(.{2}).*(@.*)/, "$1***$2");
      return new Response(
        JSON.stringify({
          connected: true,
          apple_id: maskedId,
          last_sync_at: data.last_sync_at,
          sync_enabled: data.sync_enabled,
          selected_calendar_id: data.selected_calendar_id,
          selected_reminders_id: data.selected_reminders_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "connect") {
      const { apple_id, app_password } = body;
      if (!apple_id || typeof apple_id !== "string" || !app_password || typeof app_password !== "string") {
        return new Response(
          JSON.stringify({ error: "apple_id and app_password are required and must be strings" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let principalUrl: string;
      let homeSetUrl: string;
      try {
        principalUrl = await discoverPrincipal(apple_id, app_password);
        homeSetUrl = await discoverCalendarHome(principalUrl, apple_id, app_password);
      } catch (e) {
        console.error("CalDAV discovery failed:", e);
        return new Response(
          JSON.stringify({ error: "CalDAV connection failed: " + String(e) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const calendars = await listCalendars(homeSetUrl, apple_id, app_password);
      const encryptedPassword = await encrypt(app_password);

      await supabase.from("apple_credentials").upsert({
        user_id: userId,
        apple_id,
        app_password_encrypted: encryptedPassword,
        caldav_principal: principalUrl,
        calendar_home_set: homeSetUrl,
        sync_enabled: true,
      }, { onConflict: "user_id" });

      return new Response(
        JSON.stringify({
          connected: true,
          calendars: calendars.filter((c) => c.type === "calendar"),
          reminderLists: calendars.filter((c) => c.type === "reminders"),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update") {
      const updates: Record<string, unknown> = {};
      if (typeof body.selected_calendar_id === "string") updates.selected_calendar_id = body.selected_calendar_id;
      if (typeof body.selected_reminders_id === "string") updates.selected_reminders_id = body.selected_reminders_id;
      if (typeof body.sync_enabled === "boolean") updates.sync_enabled = body.sync_enabled;

      if (Object.keys(updates).length === 0) {
        return new Response(
          JSON.stringify({ error: "No valid fields provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("apple_credentials")
        .update(updates)
        .eq("user_id", userId);

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "disconnect") {
      await supabase
        .from("time_blocks")
        .update({ external_id: null, caldav_etag: null, caldav_href: null })
        .eq("user_id", userId);
      await supabase
        .from("tasks")
        .update({ external_id: null, caldav_etag: null, caldav_href: null })
        .eq("user_id", userId);

      await supabase.from("apple_credentials").delete().eq("user_id", userId);

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action: " + action }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("apple-credentials error:", e);
    return new Response(
      JSON.stringify({ error: "Internal error: " + String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
