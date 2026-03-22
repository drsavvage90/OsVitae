import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { INIT_INBOX } from "../lib/constants";

export function useInbox(flash) {
  const [inbox, setInbox] = useState(INIT_INBOX);
  const [newInboxText, setNewInboxText] = useState("");
  const [editingInboxItem, setEditingInboxItem] = useState(null);

  const addInboxItem = async () => {
    if (!newInboxText.trim()) return;
    const id = crypto.randomUUID();
    const text = newInboxText;
    setInbox(prev => [{ id, text, createdAt: "Just now", triaged: false }, ...prev]);
    setNewInboxText("");
    flash("Added to inbox!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("inbox_items").insert({ id, user_id: userId, text });
    if (error) {
      console.error("Failed to save inbox item:", error);
      setInbox(prev => prev.filter(i => i.id !== id));
      flash("Failed to save inbox item.");
    }
  };

  const updateInboxItem = async (id, newText) => {
    const prev = inbox.find(i => i.id === id);
    setInbox(items => items.map(i => i.id === id ? { ...i, text: newText } : i));
    setEditingInboxItem(null);
    flash("Item updated!");
    const { error } = await supabase.from("inbox_items").update({ text: newText }).eq("id", id);
    if (error) {
      console.error("Failed to update inbox item:", error);
      if (prev) setInbox(items => items.map(i => i.id === id ? prev : i));
      flash("Update failed.");
    }
  };

  const triageInbox = async (id) => {
    setInbox(prev => prev.map(item => item.id === id ? { ...item, triaged: true } : item));
    flash("Triaged!");
    const { error } = await supabase.from("inbox_items").update({ triaged: true }).eq("id", id);
    if (error) console.error("Failed to triage:", error);
  };

  const dismissInbox = async (id) => {
    const item = inbox.find(i => i.id === id);
    setInbox(prev => prev.filter(i => i.id !== id));
    flash("Dismissed.");
    const { error } = await supabase.from("inbox_items").delete().eq("id", id);
    if (error) {
      console.error("Failed to dismiss:", error);
      if (item) setInbox(prev => [...prev, item]);
      flash("Dismiss failed.");
    }
  };

  return {
    inbox, setInbox,
    newInboxText, setNewInboxText,
    editingInboxItem, setEditingInboxItem,
    addInboxItem, updateInboxItem, triageInbox, dismissInbox,
  };
}
