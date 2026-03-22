import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseForUser } from "../_shared/auth.ts";
import { decrypt } from "../_shared/crypto.ts";
import { errorResponse } from "../_shared/errors.ts";
import {
  fetchEvents,
  parseVEvent,
  buildVEvent,
  putEvent,
  hourToIcalDT,
  icalDTToHour,
} from "../_shared/caldav-client.ts";

serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const { supabase, userId } = await getSupabaseForUser(req);

    const { data: creds } = await supabase
      .from("apple_credentials")
      .select("apple_id, app_password_encrypted, calendar_home_set, selected_calendar_id, last_sync_at")
      .eq("user_id", userId)
      .single();

    if (!creds?.selected_calendar_id) {
      return new Response(
        JSON.stringify({ error: "No calendar selected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: minimum 30 seconds between syncs
    if (creds.last_sync_at) {
      const elapsed = Date.now() - new Date(creds.last_sync_at).getTime();
      if (elapsed < 30_000) {
        return new Response(
          JSON.stringify({ error: "Please wait before syncing again" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const password = await decrypt(creds.app_password_encrypted);
    const appleId = await decrypt(creds.apple_id);
    const calendarUrl = creds.selected_calendar_id;

    // Date range: 30 days back, 60 days forward
    const now = new Date();
    const from = new Date(now.getTime() - 30 * 86400000);
    const to = new Date(now.getTime() + 60 * 86400000);
    const dateFrom = from.toISOString().slice(0, 10).replace(/-/g, "");
    const dateTo = to.toISOString().slice(0, 10).replace(/-/g, "");

    // Fetch remote events
    const remoteEvents = await fetchEvents(calendarUrl, appleId, password, dateFrom, dateTo);

    // Fetch local time_blocks
    const fromDate = from.toISOString().slice(0, 10);
    const toDate = to.toISOString().slice(0, 10);
    const { data: localBlocks } = await supabase
      .from("time_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("block_date", fromDate)
      .lte("block_date", toDate);

    const blocks = localBlocks || [];
    let synced = 0;

    // Index local blocks by external_id
    const localByExtId = new Map<string, typeof blocks[0]>();
    const localWithoutExtId: typeof blocks = [];
    for (const b of blocks) {
      if (b.external_id) localByExtId.set(b.external_id, b);
      else localWithoutExtId.push(b);
    }

    // Index remote events by UID
    const remoteByUid = new Map<string, { href: string; etag: string; event: ReturnType<typeof parseVEvent> }>();
    for (const item of remoteEvents) {
      const event = parseVEvent(item.icalData);
      if (event) {
        remoteByUid.set(event.uid, { href: item.href, etag: item.etag, event });
      }
    }

    // 1. Pull remote-only events (exist in Apple, not in OSVitae)
    for (const [uid, remote] of remoteByUid) {
      if (!localByExtId.has(uid)) {
        const start = icalDTToHour(remote.event!.dtstart);
        const end = icalDTToHour(remote.event!.dtend);

        await supabase.from("time_blocks").insert({
          user_id: userId,
          title: remote.event!.summary || "Untitled Event",
          block_date: start.date,
          start_hour: start.hour,
          end_hour: end.hour,
          type: "work",
          color: "#5B8DEF",
          external_id: uid,
          caldav_etag: remote.etag,
          caldav_href: remote.href,
        });
        synced++;
      } else {
        // Both exist — update local if etag changed
        const local = localByExtId.get(uid)!;
        if (local.caldav_etag !== remote.etag) {
          const start = icalDTToHour(remote.event!.dtstart);
          const end = icalDTToHour(remote.event!.dtend);

          await supabase
            .from("time_blocks")
            .update({
              title: remote.event!.summary || local.title,
              block_date: start.date,
              start_hour: start.hour,
              end_hour: end.hour,
              caldav_etag: remote.etag,
              caldav_href: remote.href,
            })
            .eq("id", local.id);
          synced++;
        }
      }
    }

    // 2. Push local-only blocks (exist in OSVitae, not in Apple)
    for (const block of localWithoutExtId) {
      const uid = block.id;
      const dtstart = hourToIcalDT(block.block_date, block.start_hour);
      const dtend = hourToIcalDT(block.block_date, block.end_hour);

      const ical = buildVEvent({
        uid,
        summary: block.title,
        dtstart,
        dtend,
      });

      const href = calendarUrl.replace(/\/$/, "") + "/" + uid + ".ics";

      try {
        const result = await putEvent(href, ical, appleId, password);
        await supabase
          .from("time_blocks")
          .update({
            external_id: uid,
            caldav_etag: result.etag,
            caldav_href: href,
          })
          .eq("id", block.id);
        synced++;
      } catch (_e) {
        // Skip items that fail to push
      }
    }

    // 3. Detect remotely deleted events
    for (const [extId, local] of localByExtId) {
      if (!remoteByUid.has(extId) && local.caldav_href) {
        // Event was deleted from Apple Calendar — remove locally
        await supabase.from("time_blocks").delete().eq("id", local.id);
        synced++;
      }
    }

    // Update last sync time
    await supabase
      .from("apple_credentials")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({ ok: true, synced }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return errorResponse("Calendar sync", e);
  }
});
