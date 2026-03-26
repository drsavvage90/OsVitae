import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { logger } from "../lib/logger";

export function useHousehold(flash) {
  const [household, setHousehold] = useState(null); // { id, name }
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHousehold = useCallback(async () => {
    const userId = await getUserId();
    if (!userId) { setLoading(false); return; }

    // Check if user is in a household
    const { data: memberRow } = await supabase
      .from("household_members")
      .select("household_id, role")
      .eq("user_id", userId)
      .maybeSingle();

    if (memberRow?.household_id) {
      const { data: hData } = await supabase
        .from("households")
        .select("id, name")
        .eq("id", memberRow.household_id)
        .maybeSingle();
      setHousehold({ id: memberRow.household_id, name: hData?.name || "Household", role: memberRow.role });

      // Load members
      const { data: allMembers } = await supabase
        .from("household_members")
        .select("user_id, role, created_at")
        .eq("household_id", memberRow.household_id);

      if (allMembers) {
        // Get emails for members
        const memberList = [];
        for (const m of allMembers) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("preferred_name")
            .eq("id", m.user_id)
            .maybeSingle();
          memberList.push({
            userId: m.user_id,
            role: m.role,
            name: profile?.preferred_name || "Member",
            isMe: m.user_id === userId,
          });
        }
        setMembers(memberList);
      }

      // Load pending invites
      const { data: invites } = await supabase
        .from("household_invites")
        .select("*")
        .eq("household_id", memberRow.household_id)
        .eq("status", "pending");
      if (invites) setPendingInvites(invites);
    } else {
      // Check for incoming invites
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: invite } = await supabase
          .from("household_invites")
          .select("*, households(name)")
          .eq("email", user.email)
          .eq("status", "pending")
          .maybeSingle();
        if (invite) setIncomingInvite(invite);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadHousehold(); }, [loadHousehold]);

  const createHousehold = async (name) => {
    const userId = await getUserId();
    if (!userId) return;
    const householdId = crypto.randomUUID();
    const { error: hErr } = await supabase
      .from("households")
      .insert({ id: householdId, name });
    if (hErr) { logger.error("Failed to create household:", hErr); flash("Failed to create household."); return; }
    const { error: mErr } = await supabase
      .from("household_members")
      .insert({ household_id: householdId, user_id: userId, role: "owner" });
    if (mErr) { logger.error("Failed to join household:", mErr); flash("Failed to create household."); return; }
    flash("Household created!");
    await loadHousehold();
  };

  const inviteMember = async (email) => {
    if (!household) return;
    const { error } = await supabase
      .from("household_invites")
      .insert({ household_id: household.id, email: email.toLowerCase().trim(), invited_by: (await getUserId()) });
    if (error) { logger.error("Failed to invite:", error); flash("Failed to send invite."); return; }
    flash(`Invite sent to ${email}!`);
    await loadHousehold();
  };

  const acceptInvite = async () => {
    if (!incomingInvite) return;
    const userId = await getUserId();
    if (!userId) return;
    // Join household
    const { error: joinErr } = await supabase
      .from("household_members")
      .insert({ household_id: incomingInvite.household_id, user_id: userId, role: "member" });
    if (joinErr) { logger.error("Failed to join household:", joinErr); flash("Failed to join household."); return; }
    // Mark invite as accepted
    await supabase
      .from("household_invites")
      .update({ status: "accepted" })
      .eq("id", incomingInvite.id);
    flash("You joined the household!");
    setIncomingInvite(null);
    await loadHousehold();
  };

  const declineInvite = async () => {
    if (!incomingInvite) return;
    await supabase
      .from("household_invites")
      .update({ status: "declined" })
      .eq("id", incomingInvite.id);
    setIncomingInvite(null);
    flash("Invite declined.");
  };

  return {
    household, members, pendingInvites, incomingInvite, loading,
    createHousehold, inviteMember, acceptInvite, declineInvite, loadHousehold,
  };
}
