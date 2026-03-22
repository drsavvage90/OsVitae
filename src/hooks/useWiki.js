import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { INIT_WIKI } from "../lib/constants";

export function useWiki(flash) {
  const [wiki, setWiki] = useState(INIT_WIKI);
  const [showNewWiki, setShowNewWiki] = useState(false);
  const [newWikiTitle, setNewWikiTitle] = useState("");
  const [newWikiCategory, setNewWikiCategory] = useState("");
  const [newWikiContent, setNewWikiContent] = useState("");
  const [activeWikiId, setActiveWikiId] = useState(null);
  const [editingWiki, setEditingWiki] = useState(false);
  const [editWikiContent, setEditWikiContent] = useState("");

  const createWikiArticle = async () => {
    if (!newWikiTitle.trim()) return;
    const id = crypto.randomUUID();
    const title = newWikiTitle, category = newWikiCategory || "General", content = newWikiContent;
    setWiki(prev => [...prev, { id, title, category, tags: [], content, lastUpdated: "Just now" }]);
    setNewWikiTitle(""); setNewWikiCategory(""); setNewWikiContent(""); setShowNewWiki(false);
    flash("Article created!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("wiki_articles").insert({ id, user_id: userId, title, category, content: content || null });
    if (error) {
      console.error("Failed to save article:", error);
      setWiki(prev => prev.filter(a => a.id !== id));
      flash("Failed to save article.");
    }
  };

  const saveWikiEdit = async () => {
    const wikiId = activeWikiId, content = editWikiContent;
    setWiki(prev => prev.map(a => a.id === wikiId ? { ...a, content, lastUpdated: "Just now" } : a));
    setEditingWiki(false);
    flash("Article updated!");
    const { error } = await supabase.from("wiki_articles").update({ content }).eq("id", wikiId);
    if (error) console.error("Failed to update article:", error);
  };

  const deleteWikiArticle = (id) => {
    setWiki(prev => prev.filter(a => a.id !== id));
    supabase.from("wiki_articles").delete().eq("id", id);
    flash("Article deleted.");
    return id === activeWikiId;
  };

  return {
    wiki, setWiki,
    showNewWiki, setShowNewWiki,
    newWikiTitle, setNewWikiTitle,
    newWikiCategory, setNewWikiCategory,
    newWikiContent, setNewWikiContent,
    activeWikiId, setActiveWikiId,
    editingWiki, setEditingWiki,
    editWikiContent, setEditWikiContent,
    createWikiArticle, saveWikiEdit, deleteWikiArticle,
  };
}
