import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { INIT_TEMPLATES } from "../lib/constants";

export function useTemplates(flash, setTasks) {
  const [templates, setTemplates] = useState(INIT_TEMPLATES);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("");
  const [newTemplateItems, setNewTemplateItems] = useState("");

  const createTemplate = async () => {
    if (!newTemplateName.trim()) return;
    const id = crypto.randomUUID();
    const name = newTemplateName, category = newTemplateCategory || "General";
    const items = newTemplateItems.split("\n").filter(Boolean);
    setTemplates(prev => [...prev, { id, name, category, description: "", items }]);
    setNewTemplateName(""); setNewTemplateCategory(""); setNewTemplateItems(""); setShowNewTemplate(false);
    flash("Template created!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("templates").insert({ id, user_id: userId, name, category, items });
    if (error) {
      console.error("Failed to save template:", error);
      setTemplates(prev => prev.filter(t => t.id !== id));
      flash("Failed to save template.");
    }
  };

  const useTemplate = async (tpl) => {
    const userId = await getUserId();
    tpl.items.forEach((item) => {
      const id = crypto.randomUUID();
      setTasks(ts => [...ts, {
        id, title: item, desc: `From template: ${tpl.name}`, priority: "medium",
        wsId: null, dueTime: null, dueDate: null, done: false, section: "afternoon",
        subtasks: [], notes: [], attachments: [], totalPomos: 1, donePomos: 0, reward: null,
      }]);
      if (userId) {
        supabase.from("tasks").insert({ id, user_id: userId, title: item, description: `From template: ${tpl.name}`, priority: "medium", done: false, section: "afternoon" })
          .then(({ error }) => { if (error) console.error("Failed to save template task:", error); });
      }
    });
    flash(`Created ${tpl.items.length} tasks from "${tpl.name}"!`);
  };

  const deleteTemplate = async (id) => {
    const tpl = templates.find(t => t.id === id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    flash("Template deleted.");
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) { console.error("Failed to delete template:", error); if (tpl) setTemplates(prev => [...prev, tpl]); flash("Delete failed."); }
  };

  return {
    templates, setTemplates,
    showNewTemplate, setShowNewTemplate,
    newTemplateName, setNewTemplateName,
    newTemplateCategory, setNewTemplateCategory,
    newTemplateItems, setNewTemplateItems,
    createTemplate, useTemplate, deleteTemplate,
  };
}
