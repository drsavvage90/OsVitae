import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { INIT_CONTACTS } from "../lib/constants";

export function useContacts(flash) {
  const [contacts, setContacts] = useState(INIT_CONTACTS);
  const [activeContactId, setActiveContactId] = useState(null);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactContext, setNewContactContext] = useState("Community");
  const [showNewInteraction, setShowNewInteraction] = useState(false);
  const [newInteractionText, setNewInteractionText] = useState("");
  const [newInteractionType, setNewInteractionType] = useState("message");
  const [editingContact, setEditingContact] = useState(null);

  const createContact = async () => {
    if (!newContactName.trim()) return;
    const id = crypto.randomUUID();
    const name = newContactName, email = newContactEmail, context = newContactContext;
    setContacts(prev => [...prev, { id, name, email, phone: null, context, tags: [], lastContact: "Just now", nextFollowUp: null, health: "strong", notes: "", interactions: [] }]);
    setNewContactName(""); setNewContactEmail(""); setShowNewContact(false);
    flash("Contact added!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("contacts").insert({ id, user_id: userId, name, email: email || null, context: context || null, health: "strong" });
    if (error) {
      console.error("Failed to save contact:", error);
      setContacts(prev => prev.filter(c => c.id !== id));
      flash("Failed to save contact.");
    }
  };

  const updateContact = async (id, updates) => {
    const prev = contacts.find(c => c.id === id);
    setContacts(cs => cs.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingContact(null);
    flash("Contact updated!");
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email || null;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null;
    if (updates.context !== undefined) dbUpdates.context = updates.context || null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    const { error } = await supabase.from("contacts").update(dbUpdates).eq("id", id);
    if (error) {
      console.error("Failed to update contact:", error);
      if (prev) setContacts(cs => cs.map(c => c.id === id ? prev : c));
      flash("Update failed.");
    }
  };

  const addInteraction = async () => {
    if (!newInteractionText.trim() || !activeContactId) return;
    const iid = crypto.randomUUID();
    const today = new Date().toISOString().split("T")[0];
    const contactId = activeContactId, type = newInteractionType, text = newInteractionText;
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, lastContact: "Just now", health: "strong", interactions: [{ id: iid, type, text, date: "Today" }, ...c.interactions] } : c));
    setNewInteractionText(""); setShowNewInteraction(false);
    flash("Interaction logged!");
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from("contact_interactions").insert({ id: iid, user_id: userId, contact_id: contactId, type, text, interaction_date: today });
    await supabase.from("contacts").update({ last_contact_at: new Date().toISOString(), health: "strong" }).eq("id", contactId);
  };

  const deleteContact = async (id) => {
    const contact = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    flash("Contact deleted.");
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) { console.error("Failed to delete contact:", error); if (contact) setContacts(prev => [...prev, contact]); flash("Delete failed."); }
    return id === activeContactId;
  };

  return {
    contacts, setContacts,
    activeContactId, setActiveContactId,
    showNewContact, setShowNewContact,
    newContactName, setNewContactName,
    newContactEmail, setNewContactEmail,
    newContactContext, setNewContactContext,
    showNewInteraction, setShowNewInteraction,
    newInteractionText, setNewInteractionText,
    newInteractionType, setNewInteractionType,
    editingContact, setEditingContact,
    createContact, updateContact, addInteraction, deleteContact,
  };
}
