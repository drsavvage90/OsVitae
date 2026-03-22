import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { INIT_BOOKMARKS } from "../lib/constants";

export function useBookmarks(flash) {
  const [bookmarks, setBookmarks] = useState(INIT_BOOKMARKS);
  const [showNewBookmark, setShowNewBookmark] = useState(false);
  const [newBmTitle, setNewBmTitle] = useState("");
  const [newBmUrl, setNewBmUrl] = useState("");
  const [newBmDesc, setNewBmDesc] = useState("");
  const [newBmWs, setNewBmWs] = useState("");
  const [editingBookmark, setEditingBookmark] = useState(null);

  const createBookmark = async () => {
    if (!newBmTitle.trim()) return;
    const id = crypto.randomUUID();
    const title = newBmTitle, url = newBmUrl, description = newBmDesc, wsId = newBmWs;
    setBookmarks(prev => [...prev, { id, title, url, description, tags: [], wsId: wsId || null, createdAt: "Just now" }]);
    setNewBmTitle(""); setNewBmUrl(""); setNewBmDesc(""); setNewBmWs(""); setShowNewBookmark(false);
    flash("Bookmark saved!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("bookmarks").insert({ id, user_id: userId, title, url: url || null, description: description || null, workspace_id: wsId || null });
    if (error) {
      console.error("Failed to save bookmark:", error);
      setBookmarks(prev => prev.filter(b => b.id !== id));
      flash("Failed to save bookmark.");
    }
  };

  const updateBookmark = async (id, updates) => {
    const prev = bookmarks.find(b => b.id === id);
    setBookmarks(bs => bs.map(b => b.id === id ? { ...b, ...updates } : b));
    setEditingBookmark(null);
    flash("Bookmark updated!");
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.url !== undefined) dbUpdates.url = updates.url || null;
    if (updates.description !== undefined) dbUpdates.description = updates.description || null;
    if (updates.wsId !== undefined) dbUpdates.workspace_id = updates.wsId || null;
    const { error } = await supabase.from("bookmarks").update(dbUpdates).eq("id", id);
    if (error) {
      console.error("Failed to update bookmark:", error);
      if (prev) setBookmarks(bs => bs.map(b => b.id === id ? prev : b));
      flash("Update failed.");
    }
  };

  const deleteBookmark = async (id) => {
    const bk = bookmarks.find(b => b.id === id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
    flash("Bookmark deleted.");
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) { console.error("Failed to delete bookmark:", error); if (bk) setBookmarks(prev => [...prev, bk]); flash("Delete failed."); }
  };

  return {
    bookmarks, setBookmarks,
    showNewBookmark, setShowNewBookmark,
    newBmTitle, setNewBmTitle,
    newBmUrl, setNewBmUrl,
    newBmDesc, setNewBmDesc,
    newBmWs, setNewBmWs,
    editingBookmark, setEditingBookmark,
    createBookmark, updateBookmark, deleteBookmark,
  };
}
