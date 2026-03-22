import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { INIT_GOALS } from "../lib/constants";

export function useGoals(flash) {
  const [goals, setGoals] = useState(INIT_GOALS);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [expandedGoals, setExpandedGoals] = useState({});
  const [editingGoal, setEditingGoal] = useState(null);

  const createGoal = async () => {
    if (!newGoalTitle.trim()) return;
    const id = crypto.randomUUID();
    const title = newGoalTitle;
    setGoals(prev => [...prev, { id, title, quarter: "Q1 2026", status: "in-progress", progress: 0, keyResults: [], linkedTaskIds: [] }]);
    setNewGoalTitle(""); setShowNewGoal(false);
    flash("Goal created!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("goals").insert({ id, user_id: userId, title, quarter: "Q1 2026", status: "in-progress" });
    if (error) {
      console.error("Failed to save goal:", error);
      setGoals(prev => prev.filter(g => g.id !== id));
      flash("Failed to save goal.");
    }
  };

  const updateGoal = async (id, updates) => {
    const prev = goals.find(g => g.id === id);
    setGoals(gs => gs.map(g => g.id === id ? { ...g, ...updates } : g));
    setEditingGoal(null);
    flash("Goal updated!");
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.quarter !== undefined) dbUpdates.quarter = updates.quarter;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    const { error } = await supabase.from("goals").update(dbUpdates).eq("id", id);
    if (error) {
      console.error("Failed to update goal:", error);
      if (prev) setGoals(gs => gs.map(g => g.id === id ? prev : g));
      flash("Update failed.");
    }
  };

  const deleteGoal = async (id) => {
    const goal = goals.find(g => g.id === id);
    setGoals(prev => prev.filter(g => g.id !== id));
    flash("Goal deleted.");
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) { console.error("Failed to delete goal:", error); if (goal) setGoals(prev => [...prev, goal]); flash("Delete failed."); }
  };

  return {
    goals, setGoals,
    showNewGoal, setShowNewGoal,
    newGoalTitle, setNewGoalTitle,
    expandedGoals, setExpandedGoals,
    editingGoal, setEditingGoal,
    createGoal, updateGoal, deleteGoal,
  };
}
