import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseForUser } from "../_shared/auth.ts";
import { decryptFields } from "../_shared/crypto.ts";
import { errorResponse } from "../_shared/errors.ts";

const PII_FIELDS = [
  "preferred_name", "country",
];

serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const { supabase, userId } = await getSupabaseForUser(req);

    // Fetch all user data in parallel (RLS ensures user-scoped)
    const [
      profileRes, workspacesRes, projectsRes, tasksRes, subtasksRes,
      taskNotesRes, habitsRes, completionsRes, goalsRes, keyResultsRes,
      journalRes, timeBlocksRes, inboxRes, wikiRes,
      transactionsRes, billsRes, billPaymentsRes, budgetsRes,
      wsNotesRes, wsDocsRes, focusRes, achievementsRes,
      contactsRes, interactionsRes, bookmarksRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("workspaces").select("*").eq("user_id", userId),
      supabase.from("projects").select("*").eq("user_id", userId),
      supabase.from("tasks").select("*").eq("user_id", userId),
      supabase.from("subtasks").select("*").eq("user_id", userId),
      supabase.from("task_notes").select("*").eq("user_id", userId),
      supabase.from("habits").select("*").eq("user_id", userId),
      supabase.from("habit_completions").select("*").eq("user_id", userId),
      supabase.from("goals").select("*").eq("user_id", userId),
      supabase.from("key_results").select("*").eq("user_id", userId),
      supabase.from("journal_entries").select("*").eq("user_id", userId),
      supabase.from("time_blocks").select("*").eq("user_id", userId),
      supabase.from("inbox_items").select("*").eq("user_id", userId),
      supabase.from("wiki_articles").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("bills").select("*").eq("user_id", userId),
      supabase.from("bill_payments").select("*").eq("user_id", userId),
      supabase.from("budgets").select("*").eq("user_id", userId),
      supabase.from("workspace_notes").select("*").eq("user_id", userId),
      supabase.from("workspace_docs").select("*").eq("user_id", userId),
      supabase.from("focus_sessions").select("*").eq("user_id", userId),
      supabase.from("achievements").select("*").eq("user_id", userId),
      supabase.from("contacts").select("*").eq("user_id", userId),
      supabase.from("contact_interactions").select("*").eq("user_id", userId),
      supabase.from("bookmarks").select("*").eq("user_id", userId),
    ]);

    // Decrypt profile PII
    let profile = profileRes.data;
    if (profile) {
      const encrypted: Record<string, string | null> = {};
      for (const f of PII_FIELDS) encrypted[f] = profile[f] ?? null;
      const decrypted = await decryptFields(encrypted);
      profile = { ...profile, ...decrypted };
      // Remove encrypted Apple password from export
      delete profile.app_password_encrypted;
    }

    // Fetch goal_tasks via user's goal IDs
    const goalIds = (goalsRes.data || []).map((g: { id: string }) => g.id);
    let goalTasks: unknown[] = [];
    if (goalIds.length > 0) {
      const { data } = await supabase
        .from("goal_tasks")
        .select("*")
        .in("goal_id", goalIds);
      goalTasks = data || [];
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      profile,
      workspaces: workspacesRes.data || [],
      projects: projectsRes.data || [],
      tasks: tasksRes.data || [],
      subtasks: subtasksRes.data || [],
      task_notes: taskNotesRes.data || [],
      habits: habitsRes.data || [],
      habit_completions: completionsRes.data || [],
      goals: goalsRes.data || [],
      key_results: keyResultsRes.data || [],
      goal_tasks: goalTasks,
      journal_entries: journalRes.data || [],
      time_blocks: timeBlocksRes.data || [],
      inbox_items: inboxRes.data || [],
      wiki_articles: wikiRes.data || [],
      transactions: transactionsRes.data || [],
      bills: billsRes.data || [],
      bill_payments: billPaymentsRes.data || [],
      budgets: budgetsRes.data || [],
      workspace_notes: wsNotesRes.data || [],
      workspace_docs: wsDocsRes.data || [],
      focus_sessions: focusRes.data || [],
      achievements: achievementsRes.data || [],
      contacts: contactsRes.data || [],
      contact_interactions: interactionsRes.data || [],
      bookmarks: bookmarksRes.data || [],
    };

    return new Response(
      JSON.stringify(exportData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": "attachment; filename=osvitae-export.json",
        },
      }
    );
  } catch (e) {
    return errorResponse("Data export", e);
  }
});
