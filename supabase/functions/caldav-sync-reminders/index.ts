import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseForUser } from "../_shared/auth.ts";
import { decrypt } from "../_shared/crypto.ts";
import { errorResponse } from "../_shared/errors.ts";
import {
  fetchTodos,
  parseVTodo,
  buildVTodo,
  putEvent,
  listCalendars,
  icalPriorityToApp,
  appPriorityToIcal,
} from "../_shared/caldav-client.ts";

serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const { supabase, userId } = await getSupabaseForUser(req);

    const { data: creds } = await supabase
      .from("apple_credentials")
      .select("apple_id, app_password_encrypted, calendar_home_set, selected_reminders_id, last_sync_at")
      .eq("user_id", userId)
      .single();

    if (!creds?.selected_reminders_id) {
      return new Response(
        JSON.stringify({ error: "No reminder list selected" }),
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

    // If "all", fetch from every reminder list; otherwise just the selected one
    let reminderListUrls: string[];
    if (creds.selected_reminders_id === "all") {
      const allCals = await listCalendars(creds.calendar_home_set, appleId, password);
      reminderListUrls = allCals.filter(c => c.type === "reminders").map(c => c.href);
    } else {
      reminderListUrls = [creds.selected_reminders_id];
    }

    // Fetch remote todos from all selected lists
    const remoteTodos: Awaited<ReturnType<typeof fetchTodos>> = [];
    for (const url of reminderListUrls) {
      try {
        const todos = await fetchTodos(url, appleId, password);
        remoteTodos.push(...todos);
      } catch (e) {
        console.warn("[CalDAV] skipping a reminder list due to fetch error");
      }
    }

    // Fetch local tasks
    const { data: localTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId);

    const tasks = localTasks || [];
    let synced = 0;

    // Index local tasks by external_id
    const localByExtId = new Map<string, typeof tasks[0]>();
    const localWithoutExtId: typeof tasks = [];
    for (const t of tasks) {
      if (t.external_id) localByExtId.set(t.external_id, t);
      else localWithoutExtId.push(t);
    }

    // Index remote todos by UID
    const remoteByUid = new Map<string, { href: string; etag: string; todo: ReturnType<typeof parseVTodo> }>();
    for (const item of remoteTodos) {
      const todo = parseVTodo(item.icalData);
      if (todo) {
        remoteByUid.set(todo.uid, { href: item.href, etag: item.etag, todo });
      }
    }

    // 1. Pull remote-only todos
    for (const [uid, remote] of remoteByUid) {
      if (!localByExtId.has(uid)) {
        const todo = remote.todo!;
        let dueDate = null;
        let dueTime = null;

        if (todo.due) {
          const clean = todo.due.replace(/Z$/, "");
          dueDate = `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
          if (clean.length >= 13) {
            dueTime = `${clean.slice(9, 11)}:${clean.slice(11, 13)}:00`;
          }
        }

        await supabase.from("tasks").insert({
          user_id: userId,
          title: todo.summary || "Untitled Reminder",
          description: todo.description || null,
          priority: icalPriorityToApp(todo.priority),
          done: todo.status === "COMPLETED",
          due_date: dueDate,
          due_time: dueTime,
          section: "afternoon",
          external_id: uid,
          caldav_etag: remote.etag,
          caldav_href: remote.href,
        });
        synced++;
      } else {
        // Both exist — update local if etag changed
        const local = localByExtId.get(uid)!;
        if (local.caldav_etag !== remote.etag) {
          const todo = remote.todo!;
          let dueDate = null;
          let dueTime = null;

          if (todo.due) {
            const clean = todo.due.replace(/Z$/, "");
            dueDate = `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
            if (clean.length >= 13) {
              dueTime = `${clean.slice(9, 11)}:${clean.slice(11, 13)}:00`;
            }
          }

          await supabase
            .from("tasks")
            .update({
              title: todo.summary || local.title,
              description: todo.description || local.description,
              priority: icalPriorityToApp(todo.priority),
              done: todo.status === "COMPLETED",
              due_date: dueDate,
              due_time: dueTime,
              caldav_etag: remote.etag,
              caldav_href: remote.href,
            })
            .eq("id", local.id);
          synced++;
        }
      }
    }

    // 2. Push local-only tasks
    for (const task of localWithoutExtId) {
      const uid = task.id;
      let due: string | undefined;
      if (task.due_date) {
        const dateClean = task.due_date.replace(/-/g, "");
        if (task.due_time) {
          const timeClean = task.due_time.replace(/:/g, "").slice(0, 6);
          due = `${dateClean}T${timeClean}`;
        } else {
          due = dateClean;
        }
      }

      const ical = buildVTodo({
        uid,
        summary: task.title,
        description: task.description || undefined,
        due,
        priority: appPriorityToIcal(task.priority || "medium"),
        completed: task.done,
      });

      const pushUrl = reminderListUrls[0];
      const href = pushUrl.replace(/\/$/, "") + "/" + uid + ".ics";

      try {
        const result = await putEvent(href, ical, appleId, password);
        await supabase
          .from("tasks")
          .update({
            external_id: uid,
            caldav_etag: result.etag,
            caldav_href: href,
          })
          .eq("id", task.id);
        synced++;
      } catch (_e) {
        // Skip items that fail to push
      }
    }

    // 3. Detect remotely deleted todos
    for (const [extId, local] of localByExtId) {
      if (!remoteByUid.has(extId) && local.caldav_href) {
        await supabase.from("tasks").delete().eq("id", local.id);
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
    return errorResponse("Reminders sync", e);
  }
});
