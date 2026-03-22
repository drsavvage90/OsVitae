import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseForUser } from "../_shared/auth.ts";
import { decrypt } from "../_shared/crypto.ts";
import { listCalendars } from "../_shared/caldav-client.ts";

serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const { supabase, userId } = await getSupabaseForUser(req);

    const { data: creds } = await supabase
      .from("apple_credentials")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!creds) {
      return new Response(
        JSON.stringify({ error: "Apple Calendar not connected" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const password = await decrypt(creds.app_password_encrypted);
    const calendars = await listCalendars(creds.calendar_home_set, creds.apple_id, password);

    return new Response(
      JSON.stringify({
        calendars: calendars.filter((c) => c.type === "calendar"),
        reminderLists: calendars.filter((c) => c.type === "reminders"),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("caldav-discover error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
