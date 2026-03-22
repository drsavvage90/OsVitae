import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { logger } from "../lib/logger";
import { validateTitle, sanitizeText, MAX_DESC } from "../lib/validate";
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
    const titleCheck = validateTitle(newWikiTitle);
    if (!titleCheck.valid) { flash(titleCheck.error); return; }
    const id = crypto.randomUUID();
    const title = titleCheck.value, category = sanitizeText(newWikiCategory, 100) || "General", content = sanitizeText(newWikiContent, MAX_DESC);
    setWiki(prev => [...prev, { id, title, category, tags: [], content, lastUpdated: "Just now" }]);
    setNewWikiTitle(""); setNewWikiCategory(""); setNewWikiContent(""); setShowNewWiki(false);
    flash("Article created!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("wiki_articles").insert({ id, user_id: userId, title, category, content: content || null });
    if (error) {
      logger.error("Failed to save article:", error);
      setWiki(prev => prev.filter(a => a.id !== id));
      flash("Failed to save article.");
    }
  };

  const saveWikiEdit = async () => {
    const wikiId = activeWikiId;
    const content = sanitizeText(editWikiContent, 50000);
    setWiki(prev => prev.map(a => a.id === wikiId ? { ...a, content, lastUpdated: "Just now" } : a));
    setEditingWiki(false);
    flash("Article updated!");
    const { error } = await supabase.from("wiki_articles").update({ content }).eq("id", wikiId);
    if (error) {
      logger.error("Failed to update article:", error);
      flash("Update failed.");
    }
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
