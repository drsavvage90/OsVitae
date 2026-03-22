import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { logger } from "../lib/logger";
import { validateName } from "../lib/validate";
import { INIT_HABITS } from "../lib/constants";

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKENDS = [0, 6];

export function daysForFrequency(freq, customDays) {
  if (freq === "daily") return ALL_DAYS;
  if (freq === "weekdays") return WEEKDAYS;
  if (freq === "weekends") return WEEKENDS;
  return customDays || ALL_DAYS;
}

export function frequencyLabel(freq, scheduleDays) {
  if (freq === "daily") return "Every day";
  if (freq === "weekdays") return "Weekdays";
  if (freq === "weekends") return "Weekends";
  if (freq === "custom" && scheduleDays?.length) {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return scheduleDays.sort((a, b) => a - b).map(d => names[d]).join(", ");
  }
  return "Custom";
}

export function useHabits(flash, addXp) {
  const [habits, setHabits] = useState(INIT_HABITS);
  const [showNewHabit, setShowNewHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitFreq, setNewHabitFreq] = useState("daily");
  const [newHabitDays, setNewHabitDays] = useState([...ALL_DAYS]);
  const [newHabitColor, setNewHabitColor] = useState("#22C55E");
  const [editingHabit, setEditingHabit] = useState(null);

  const toggleHabit = async (id) => {
    const today = new Date().toISOString().split("T")[0];
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const wasDone = habit.completions.includes(today);
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      if (wasDone) return { ...h, completions: h.completions.filter(d => d !== today), streak: Math.max(0, h.streak - 1) };
      addXp(10); flash("+10 XP — habit complete!");
      return { ...h, completions: [...h.completions, today], streak: h.streak + 1 };
    }));
    const userId = await getUserId();
    if (!userId) return;
    if (wasDone) {
      await supabase.from("habit_completions").delete().eq("habit_id", id).eq("completed_date", today);
      await supabase.from("habits").update({ streak: Math.max(0, habit.streak - 1) }).eq("id", id);
    } else {
      await supabase.from("habit_completions").insert({ user_id: userId, habit_id: id, completed_date: today });
      await supabase.from("habits").update({ streak: habit.streak + 1 }).eq("id", id);
    }
  };

  const createHabit = async () => {
    const nameCheck = validateName(newHabitName);
    if (!nameCheck.valid) { flash(nameCheck.error); return; }
    const id = crypto.randomUUID();
    const name = nameCheck.value, color = newHabitColor, freq = newHabitFreq;
    const scheduleDays = daysForFrequency(freq, newHabitDays);
    setHabits(prev => [...prev, { id, name, icon: "Star", color, frequency: freq, scheduleDays, completions: [], streak: 0 }]);
    setNewHabitName(""); setNewHabitFreq("daily"); setNewHabitDays([...ALL_DAYS]); setShowNewHabit(false);
    flash("Habit created!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("habits").insert({ id, user_id: userId, name, icon: "Star", color, frequency: freq, schedule_days: scheduleDays });
    if (error) {
      logger.error("Failed to save habit:", error);
      setHabits(prev => prev.filter(h => h.id !== id));
      flash("Failed to save habit.");
    }
  };

  const updateHabit = async (id, updates) => {
    const prev = habits.find(h => h.id === id);
    setHabits(hs => hs.map(h => h.id === id ? { ...h, ...updates } : h));
    setEditingHabit(null);
    flash("Habit updated!");
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.scheduleDays !== undefined) dbUpdates.schedule_days = updates.scheduleDays;
    const { error } = await supabase.from("habits").update(dbUpdates).eq("id", id);
    if (error) {
      logger.error("Failed to update habit:", error);
      if (prev) setHabits(hs => hs.map(h => h.id === id ? prev : h));
      flash("Update failed.");
    }
  };

  const deleteHabit = async (id) => {
    const habit = habits.find(h => h.id === id);
    setHabits(prev => prev.filter(h => h.id !== id));
    flash("Habit deleted.");
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (error) { logger.error("Failed to delete habit:", error); if (habit) setHabits(prev => [...prev, habit]); flash("Delete failed."); }
  };

  return {
    habits, setHabits,
    showNewHabit, setShowNewHabit,
    newHabitName, setNewHabitName,
    newHabitFreq, setNewHabitFreq,
    newHabitDays, setNewHabitDays,
    newHabitColor, setNewHabitColor,
    editingHabit, setEditingHabit,
    toggleHabit, createHabit, updateHabit, deleteHabit,
  };
}
