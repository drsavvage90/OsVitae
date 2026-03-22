import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseForUser } from "../_shared/auth.ts";
import { encrypt, decrypt } from "../_shared/crypto.ts";
import { errorResponse } from "../_shared/errors.ts";
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

      let appleIdPlain: string;
      try {
        appleIdPlain = await decrypt(data.apple_id);
      } catch {
        // Fallback for pre-encryption plaintext values
        appleIdPlain = data.apple_id;
      }
      const maskedId = appleIdPlain.replace(/(.{2}).*(@.*)/, "$1***$2");
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
      // Rate limit: minimum 10 seconds between connect attempts
      const { data: existing } = await supabase
        .from("apple_credentials")
        .select("last_sync_at")
        .eq("user_id", userId)
        .single();
      if (existing?.last_sync_at) {
        const elapsed = Date.now() - new Date(existing.last_sync_at).getTime();
        if (elapsed < 10_000) {
          return new Response(
            JSON.stringify({ error: "Please wait before trying again" }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const { apple_id, app_password } = body;
      if (!apple_id || typeof apple_id !== "string" || !app_password || typeof app_password !== "string") {
        return new Response(
          JSON.stringify({ error: "apple_id and app_password are required and must be strings" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (apple_id.length > 200 || app_password.length > 200) {
        return new Response(
          JSON.stringify({ error: "apple_id and app_password must be 200 characters or less" }),
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
          JSON.stringify({ error: "CalDAV connection failed. Verify your Apple ID and app-specific password." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const calendars = await listCalendars(homeSetUrl, apple_id, app_password);
      const encryptedPassword = await encrypt(app_password);
      const encryptedAppleId = await encrypt(apple_id);

      await supabase.from("apple_credentials").upsert({
        user_id: userId,
        apple_id: encryptedAppleId,
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
      // Fetch stored calendar_home_set to validate IDs
      const { data: storedCreds } = await supabase
        .from("apple_credentials")
        .select("calendar_home_set")
        .eq("user_id", userId)
        .single();
      const homeOrigin = storedCreds?.calendar_home_set
        ? new URL(storedCreds.calendar_home_set).hostname
        : null;

      const updates: Record<string, unknown> = {};
      if (typeof body.selected_calendar_id === "string") {
        const val = body.selected_calendar_id;
        if (val === "all" || val === "") {
          updates.selected_calendar_id = val;
        } else if (homeOrigin) {
          try { if (new URL(val).hostname === homeOrigin) updates.selected_calendar_id = val; } catch { /* invalid URL ignored */ }
        }
      }
      if (typeof body.selected_reminders_id === "string") {
        const val = body.selected_reminders_id;
        if (val === "all" || val === "") {
          updates.selected_reminders_id = val;
        } else if (homeOrigin) {
          try { if (new URL(val).hostname === homeOrigin) updates.selected_reminders_id = val; } catch { /* invalid URL ignored */ }
        }
      }
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
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return errorResponse("Apple credentials", e);
  }
});
