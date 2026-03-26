import { useState, useEffect, useRef, useCallback } from "react";
import {
  Home, ClipboardList, Timer, Trophy,
  Flame, Gift, Check,
  Search, Clock, CheckCircle2, ArrowLeft, Plus, X,
  RefreshCw, Inbox, Trash2, ChevronRight, Menu,
} from "lucide-react";
import { supabase, invokeFunction } from "./lib/supabase";
import {
  THEMES, WS_ICON_OPTIONS, WS_COLOR_OPTIONS, getWsIcon,
  INIT_WORKSPACES, INIT_TASKS, INIT_TIME_BLOCKS,
} from "./lib/constants";
import { Glass, Btn, Modal, Toast } from "./components/ui";
import { getUserId } from "./lib/getUserId";
import { logger } from "./lib/logger";
import { validateTitle, validateDescription, validateName, validateAmount, sanitizeText, MAX_TITLE, MAX_DESC, MAX_NAME } from "./lib/validate";
import { useFlash } from "./hooks/useFlash";
import { useHabits, daysForFrequency } from "./hooks/useHabits";
import { useInbox } from "./hooks/useInbox";
import { useWiki } from "./hooks/useWiki";
import { useFinance } from "./hooks/useFinance";
import { useHousehold } from "./hooks/useHousehold";
import Sidebar from "./components/Sidebar";
import RewardsPage from "./components/pages/RewardsPage";
import AllTasksPage from "./components/pages/AllTasksPage";
import InboxPage from "./components/pages/InboxPage";
import HabitsPage from "./components/pages/HabitsPage";
import WikiPage from "./components/pages/WikiPage";
import WikiArticlePage from "./components/pages/WikiArticlePage";
import CalendarPage from "./components/pages/CalendarPage";
import ReviewPage from "./components/pages/ReviewPage";
import FinancePage from "./components/pages/FinancePage";
import SettingsPage from "./components/pages/SettingsPage";
import TimerPage from "./components/pages/TimerPage";
import TodayPage from "./components/pages/TodayPage";
import WorkspacePage from "./components/pages/WorkspacePage";
import ProjectPage from "./components/pages/ProjectPage";
import TaskDetailPage from "./components/pages/TaskDetailPage";




// ═══════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("today");
  const [activeWsId, setActiveWsId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [wsTab, setWsTab] = useState("Projects");
  const [collapsed, setCollapsed] = useState(false);
  const [themeName, setThemeName] = useState(() => localStorage.getItem("osvitae-theme") || "default");
  const theme = THEMES[themeName] || THEMES.default;
  const toggleTheme = () => {
    const next = themeName === "default" ? "halo" : "default";
    setThemeName(next);
    localStorage.setItem("osvitae-theme", next);
  };
  // Calculate pomos from start/end time: 1 pomo per 30 min, minimum 1
  const pomosFromTimes = (start, end) => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return null;
    return Math.max(1, Math.round(mins / 30));
  };
  const [sidebarSections, setSidebarSections] = useState({ home: true, track: false, library: false, workspaces: false });
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [totalPomosEver, setTotalPomosEver] = useState(0);
  const [totalTasksDone, setTotalTasksDone] = useState(0);

  const addXp = (amount) => {
    setXp(prev => {
      let next = prev + amount;
      if (next >= 500) { setLevel(l => l + 1); flash("Level up!"); return next - 500; }
      return next;
    });
  };

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [timerTaskId, setTimerTaskId] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const WORK_DURATION = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;
  const CYCLE_LENGTH = 4;
  const timerRef = useRef(null);

  // UI state
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskWs, setNewTaskWs] = useState(null);
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskDueTime, setNewTaskDueTime] = useState("");
  const [newTaskEndTime, setNewTaskEndTime] = useState("");
  const [newTaskSection, setNewTaskSection] = useState("afternoon");
  const [newTaskReward, setNewTaskReward] = useState("");
  const [newTaskPomos, setNewTaskPomos] = useState(2);
  const [newTaskSubtasks, setNewTaskSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [editSubtaskText, setEditSubtaskText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const { toast, flash } = useFlash();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [intentionText, setIntentionText] = useState("");
  const [editingIntention, setEditingIntention] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const [editingReward, setEditingReward] = useState(false);
  const [workspaces, setWorkspaces] = useState(INIT_WORKSPACES);
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsColor, setNewWsColor] = useState(WS_COLOR_OPTIONS[0]);
  const [newWsIcon, setNewWsIcon] = useState("Folder");
  const [editingWsId, setEditingWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");
  const [editWsColor, setEditWsColor] = useState("");
  const [editWsIcon, setEditWsIcon] = useState("");
  const [projects, setProjects] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(WS_COLOR_OPTIONS[0]);
  const [newProjectIcon, setNewProjectIcon] = useState("Folder");
  const [newProjectWsId, setNewProjectWsId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [newTaskProject, setNewTaskProject] = useState(null);
  const [wsNotes, setWsNotes] = useState([]);
  const [wsDocs, setWsDocs] = useState([]);
  const [showWsNote, setShowWsNote] = useState(false);
  const [wsNoteText, setWsNoteText] = useState("");
  const [wsNoteTitle, setWsNoteTitle] = useState("");
  const [showWsDoc, setShowWsDoc] = useState(false);
  const [wsDocName, setWsDocName] = useState("");
  const [wsDocType, setWsDocType] = useState("doc");

  // ─── PROFILE STATE ───
  const [profileData, setProfileData] = useState({
    preferred_name: "", country: "",
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── NEW FEATURE STATE ───

  // Habits
  const {
    habits, setHabits, showNewHabit, setShowNewHabit,
    newHabitName, setNewHabitName, newHabitFreq, setNewHabitFreq,
    newHabitDays, setNewHabitDays,
    newHabitColor, setNewHabitColor,
    editingHabit, setEditingHabit,
    toggleHabit, createHabit, updateHabit, deleteHabit,
  } = useHabits(flash, addXp);

  // Calendar
  const [timeBlocks, setTimeBlocks] = useState(INIT_TIME_BLOCKS);
  const [showNewBlock, setShowNewBlock] = useState(false);
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [newBlockStart, setNewBlockStart] = useState(9);
  const [newBlockEnd, setNewBlockEnd] = useState(10);
  const [editingBlock, setEditingBlock] = useState(null);

  // Inbox
  const {
    inbox, setInbox, newInboxText, setNewInboxText,
    editingInboxItem, setEditingInboxItem,
    addInboxItem, updateInboxItem, triageInbox, dismissInbox,
  } = useInbox(flash);

  // Wiki
  const {
    wiki, setWiki, showNewWiki, setShowNewWiki,
    newWikiTitle, setNewWikiTitle, newWikiCategory, setNewWikiCategory,
    newWikiContent, setNewWikiContent,
    activeWikiId, setActiveWikiId,
    editingWiki, setEditingWiki, editWikiContent, setEditWikiContent,
    createWikiArticle, saveWikiEdit, deleteWikiArticle: deleteWikiArticleHook,
  } = useWiki(flash);

  // Finance
  const {
    transactions, setTransactions,
    budgets, setBudgets,
    financeTab, setFinanceTab,
    showNewTransaction, setShowNewTransaction,
    newTxType, setNewTxType,
    newTxCategory, setNewTxCategory,
    newTxAmount, setNewTxAmount,
    newTxDesc, setNewTxDesc,
    newTxDate, setNewTxDate,
    newTxRecurring, setNewTxRecurring,
    editingBudget, setEditingBudget,
    editBudgetVal, setEditBudgetVal,
    newIncomeCategory, setNewIncomeCategory,
    newIncomeAmount, setNewIncomeAmount,
    newIncomeDesc, setNewIncomeDesc,
    newIncomeRecurring, setNewIncomeRecurring,
    bills, setBills,
    billPayments, setBillPayments,
    newBillName, setNewBillName,
    newBillAmount, setNewBillAmount,
    newBillDueDay, setNewBillDueDay,
    newBillCategory, setNewBillCategory,
    editingTransaction, setEditingTransaction,
    editingBill, setEditingBill,
    addTransaction, deleteTransaction, updateTransaction,
    saveBudget, addIncome, togglePaid,
    addBill, deleteBill, updateBill,
    customCategories, setCustomCategories, getCategories,
    addCategory, renameCategory, deleteCategory, seedDefaultCategories,
  } = useFinance(flash);

  const {
    household, members: householdMembers, pendingInvites, incomingInvite,
    loading: householdLoading, createHousehold, inviteMember, acceptInvite, declineInvite,
  } = useHousehold(flash);

  // Sidebar is hidden on tablets via CSS (hamburger menu used instead)

  // Timer — uses absolute end time to handle background tab throttling
  const endTimeRef = useRef(null);
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
      timerRef.current = setTimeout(() => {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      endTimeRef.current = null;
      setTimerActive(false);
      if (!isBreak) {
        addXp(15);
        setTotalPomosEver(p => p + 1);
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);
        if (timerTaskId) {
          setTasks(ts => ts.map(t => t.id === timerTaskId ? { ...t, donePomos: Math.min(t.donePomos + 1, t.totalPomos) } : t));
        }
        // Persist focus session to Supabase
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) supabase.from("focus_sessions").insert({ user_id: user.id, task_id: timerTaskId || null, duration_seconds: WORK_DURATION, is_break: false });
        });
        if (newSessionCount % CYCLE_LENGTH === 0) {
          flash("Great work! Take a longer break — you've earned it.");
          setIsBreak(true);
          setTimeLeft(LONG_BREAK);
        } else {
          flash(`Focus session ${newSessionCount} complete! +15 XP`);
          setIsBreak(true);
          setTimeLeft(SHORT_BREAK);
        }
      } else {
        flash("Break's over — ready for another round?");
        setIsBreak(false);
        setTimeLeft(WORK_DURATION);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeLeft]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newDone = !task.done;
    const newStatus = newDone ? "done" : "todo";
    if (newDone) { addXp(25); setTotalTasksDone(d => d + 1); flash("Task complete! +25 XP"); }
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: newDone, status: newStatus } : t));
    const { error } = await supabase.from("tasks").update({ done: newDone, status: newStatus }).eq("id", id);
    if (error) {
      logger.error("Failed to update task:", error);
      setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !newDone } : t));
      flash("Update failed — please try again.");
      return;
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newDone = newStatus === "done";
    const wasDone = task.done;
    if (newDone && !wasDone) { addXp(25); setTotalTasksDone(d => d + 1); flash("Task complete! +25 XP"); }
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: newStatus, done: newDone } : t));
    const { error } = await supabase.from("tasks").update({ status: newStatus, done: newDone }).eq("id", id);
    if (error) {
      logger.error("Failed to update task status:", error);
      setTasks(ts => ts.map(t => t.id === id ? { ...t, status: task.status, done: task.done } : t));
      flash("Status update failed.");
    }
  };

  const updateTaskField = async (id, field, value) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(ts => ts.map(t => t.id === id ? { ...t, [field]: value } : t));
    const dbField = field === "wsId" ? "workspace_id" : field === "projectId" ? "project_id" : field === "dueDate" ? "due_date" : field === "dueTime" ? "due_time" : field === "endTime" ? "end_time" : field;
    const { error } = await supabase.from("tasks").update({ [dbField]: value }).eq("id", id);
    if (error) {
      logger.error(`Failed to update task ${field}:`, error);
      setTasks(ts => ts.map(t => t.id === id ? { ...t, [field]: task[field] } : t));
      flash("Update failed.");
    }
  };

  const deleteTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    setTasks(ts => ts.filter(t => t.id !== id));
    // Also remove any associated time blocks from the calendar
    setTimeBlocks(bs => bs.filter(b => b.taskId !== id));
    await supabase.from("time_blocks").delete().eq("task_id", id);
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      logger.error("Failed to delete task:", error);
      if (task) setTasks(ts => [...ts, task]);
      flash("Delete failed — please try again.");
      return;
    }
    flash("Task deleted.");
  };

  const saveEditTask = async () => {
    if (!editingTask) return;
    setTasks(ts => ts.map(t => t.id === editingTask.id ? {
      ...t, title: editingTask.title, desc: editingTask.desc,
      description: editingTask.desc, priority: editingTask.priority,
      dueDate: editingTask.dueDate, dueTime: editingTask.dueTime, endTime: editingTask.endTime,
      section: editingTask.section, wsId: editingTask.wsId,
      projectId: editingTask.projectId, status: editingTask.status || t.status,
      reward: editingTask.reward, totalPomos: editingTask.totalPomos,
      subtasks: editingTask.subtasks,
    } : t));
    const { error } = await supabase.from("tasks").update({
      title: editingTask.title, description: editingTask.desc,
      priority: editingTask.priority, due_date: editingTask.dueDate || null,
      due_time: editingTask.dueTime || null, end_time: editingTask.endTime || null,
      section: editingTask.section || "afternoon",
      workspace_id: editingTask.wsId || null,
      project_id: editingTask.projectId || null,
      reward: editingTask.reward || null,
      total_pomos: editingTask.totalPomos || 0,
    }).eq("id", editingTask.id);
    if (error) logger.error("Failed to update task:", error);
    // Sync subtasks: delete removed, insert new
    const userId = await getUserId();
    if (userId) {
      const oldTask = tasks.find(t => t.id === editingTask.id);
      const oldIds = new Set((oldTask?.subtasks || []).map(s => s.id));
      const newIds = new Set((editingTask.subtasks || []).map(s => s.id));
      const removed = [...oldIds].filter(id => !newIds.has(id));
      const added = (editingTask.subtasks || []).filter(s => !oldIds.has(s.id));
      for (const rid of removed) {
        await supabase.from("subtasks").delete().eq("id", rid);
      }
      if (added.length > 0) {
        await supabase.from("subtasks").insert(
          added.map((s, i) => ({ id: s.id, user_id: userId, task_id: editingTask.id, text: s.text, done: false, xp: s.xp || 10, position: (oldTask?.subtasks?.length || 0) + i }))
        );
      }
    }
    setEditingTask(null);
    flash(error ? "Update failed — please try again." : "Task updated!");
  };

  const toggleSubtask = async (taskId, subId) => {
    let newDoneVal;
    setTasks(ts => ts.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.map(s => {
        if (s.id !== subId) return s;
        const newDone = !s.done;
        newDoneVal = newDone;
        if (newDone) { addXp(s.xp); flash(`+${s.xp} XP — step complete!`); }
        return { ...s, done: newDone };
      })};
    }));
    const { error } = await supabase.from("subtasks").update({ done: newDoneVal }).eq("id", subId);
    if (error) logger.error("Failed to update subtask:", error);
  };

  const createTask = async () => {
    const titleCheck = validateTitle(newTaskTitle);
    if (!titleCheck.valid) { flash(titleCheck.error); return; }
    const descCheck = validateDescription(newTaskDesc);
    const id = crypto.randomUUID();
    const title = titleCheck.value, desc = descCheck.value, priority = newTaskPriority, wsId = newTaskWs;
    const projectId = newTaskProject || null;
    const dueDate = newTaskDueDate || null, dueTime = newTaskDueTime || null;
    const endTime = newTaskEndTime || null;
    const section = newTaskSection, reward = newTaskReward || null, totalPomos = newTaskPomos;
    const subtaskObjs = newTaskSubtasks.map((text, i) => ({ id: crypto.randomUUID(), text, done: false, xp: 10, position: i }));
    const newTask = {
      id, title, desc, description: desc, priority,
      wsId, projectId, dueTime, endTime, dueDate, done: false, status: "todo", section,
      subtasks: subtaskObjs, notes: [], attachments: [], totalPomos, donePomos: 0, reward,
    };
    setTasks(ts => [...ts, newTask]);
    setNewTaskTitle(""); setNewTaskDesc(""); setNewTaskDueDate(""); setNewTaskDueTime(""); setNewTaskEndTime("");
    setNewTaskSection("afternoon"); setNewTaskReward(""); setNewTaskPomos(2);
    setNewTaskSubtasks([]); setNewSubtaskText(""); setShowNewTask(false);
    setNewTaskProject(null);
    flash("Task created!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("tasks").insert({
      id, user_id: userId, title, description: desc,
      priority, done: false, status: "todo", section,
      workspace_id: wsId || null,
      project_id: projectId,
      due_date: dueDate, due_time: dueTime, end_time: endTime,
      reward, total_pomos: totalPomos,
    });
    if (error) {
      logger.error("Failed to save task:", error);
      setTasks(ts => ts.filter(t => t.id !== id));
      flash("Failed to save task — please try again.");
      return;
    }
    if (subtaskObjs.length > 0) {
      const { error: subErr } = await supabase.from("subtasks").insert(
        subtaskObjs.map(s => ({ id: s.id, user_id: userId, task_id: id, text: s.text, done: false, xp: s.xp, position: s.position }))
      );
      if (subErr) logger.error("Failed to save subtasks:", subErr);
    }
  };

  const addNote = async () => {
    if (!newNoteText.trim() || !activeTaskId) return;
    const nid = crypto.randomUUID();
    const text = newNoteText, taskId = activeTaskId;
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, notes: [{ id: nid, text, time: "Just now" }, ...t.notes] } : t));
    setNewNoteText(""); setShowNewNote(false);
    flash("Note added!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("task_notes").insert({ id: nid, user_id: userId, task_id: taskId, text });
    if (error) {
      logger.error("Failed to save note:", error);
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, notes: t.notes.filter(n => n.id !== nid) } : t));
      flash("Failed to save note.");
    }
  };

  const startFocus = (taskId) => {
    setTimerTaskId(taskId);
    setTimerActive(false);
    setIsBreak(false);
    setTimeLeft(WORK_DURATION);
    endTimeRef.current = null;
    setPage("timer");
    setTimeout(() => setTimerActive(true), 300);
  };

  const createWorkspace = async () => {
    const nameCheck = validateName(newWsName);
    if (!nameCheck.valid) { flash(nameCheck.error); return; }
    const id = crypto.randomUUID();
    const name = nameCheck.value, icon = newWsIcon, color = newWsColor, pos = workspaces.length;
    setWorkspaces(prev => [...prev, { id, name, icon, color }]);
    setNewWsName(""); setNewWsColor(WS_COLOR_OPTIONS[0]); setNewWsIcon("Folder"); setShowNewWs(false);
    flash("Workspace created!");
    goWs(id);
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("workspaces").insert({ id, user_id: userId, name, icon, color, position: pos });
    if (error) {
      logger.error("Failed to save workspace:", error);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      flash("Failed to save workspace.");
    }
  };

  const openEditWs = (ws) => {
    setEditingWsId(ws.id); setEditWsName(ws.name); setEditWsColor(ws.color); setEditWsIcon(ws.icon);
  };

  const updateWorkspace = async () => {
    if (!editWsName.trim()) return;
    const id = editingWsId;
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name: editWsName.trim(), color: editWsColor, icon: editWsIcon } : w));
    setEditingWsId(null);
    flash("Workspace updated!");
    const { error } = await supabase.from("workspaces").update({ name: editWsName.trim(), color: editWsColor, icon: editWsIcon }).eq("id", id);
    if (error) logger.error("Failed to update workspace:", error);
  };

  const createProject = async () => {
    if (!newProjectName.trim() || !newProjectWsId) return;
    const id = crypto.randomUUID();
    const name = newProjectName, icon = newProjectIcon, color = newProjectColor, wsId = newProjectWsId;
    const pos = projects.filter(p => p.wsId === wsId).length;
    setProjects(prev => [...prev, { id, name, icon, color, wsId }]);
    setNewProjectName(""); setNewProjectColor(WS_COLOR_OPTIONS[0]); setNewProjectIcon("Folder"); setShowNewProject(false);
    flash("Project created!");
    goProject(id);
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("projects").insert({ id, user_id: userId, workspace_id: wsId, name, icon, color, position: pos });
    if (error) {
      logger.error("Failed to save project:", error);
      setProjects(prev => prev.filter(p => p.id !== id));
      flash("Failed to save project.");
    }
  };

  const deleteProject = async (id) => {
    const proj = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setPage("workspace");
    flash("Project deleted.");
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { logger.error("Failed to delete project:", error); if (proj) setProjects(prev => [...prev, proj]); flash("Delete failed."); }
  };

  const createWsNote = async () => {
    if (!wsNoteText.trim()) return;
    const nid = crypto.randomUUID();
    const title = wsNoteTitle.trim() || "Untitled Note";
    const text = wsNoteText, wsId = activeWsId;
    setWsNotes(prev => [...prev, { id: nid, title, text, wsId, time: "Just now" }]);
    setWsNoteTitle(""); setWsNoteText(""); setShowWsNote(false);
    flash("Note added!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("workspace_notes").insert({ id: nid, user_id: userId, workspace_id: wsId, title, text });
    if (error) {
      logger.error("Failed to save note:", error);
      setWsNotes(prev => prev.filter(n => n.id !== nid));
      flash("Failed to save note.");
    }
  };

  const createWsDoc = async () => {
    if (!wsDocName.trim()) return;
    const did = crypto.randomUUID();
    const typeIcons = { doc: "FileEdit", pdf: "FileText", code: "FileCode2", image: "ImageIcon", other: "FileText" };
    const name = wsDocName, wsId = activeWsId, type = wsDocType;
    setWsDocs(prev => [...prev, {
      id: did, name, wsId, type,
      icon: typeIcons[type] || "FileText", size: "—", time: "Just now",
    }]);
    setWsDocName(""); setWsDocType("doc"); setShowWsDoc(false);
    flash("Document added!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("workspace_docs").insert({ id: did, user_id: userId, workspace_id: wsId, name, type });
    if (error) {
      logger.error("Failed to save doc:", error);
      setWsDocs(prev => prev.filter(d => d.id !== did));
      flash("Failed to save document.");
    }
  };

  // ─── NAVIGATION-AWARE DELETE WRAPPERS ───
  const deleteWikiArticle = (id) => {
    const wasActive = deleteWikiArticleHook(id);
    if (wasActive) setPage("wiki");
  };

  const createTimeBlock = async () => {
    if (!newBlockTitle.trim()) return;
    const id = crypto.randomUUID();
    const blockDate = new Date().toISOString().split("T")[0];
    const title = newBlockTitle, startHour = newBlockStart, endHour = newBlockEnd;
    setTimeBlocks(prev => [...prev, { id, title, startHour, endHour, taskId: null, color: "#5B8DEF", type: "work", date: blockDate }]);
    setNewBlockTitle(""); setShowNewBlock(false);
    flash("Time block added!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("time_blocks").insert({
      id, user_id: userId, title, start_hour: startHour,
      end_hour: endHour, block_date: blockDate, color: "#5B8DEF", type: "work",
    });
    if (error) {
      logger.error("Failed to save time block:", error);
      setTimeBlocks(prev => prev.filter(b => b.id !== id));
      flash("Failed to save time block.");
    }
  };

  const createTimeBlockFromTask = async ({ taskId, title, color, startHour, endHour: endHourParam }) => {
    const blockDate = new Date().toISOString().split("T")[0];
    const endHour = endHourParam || startHour + 1;
    // Check local state first
    let alreadyExists = false;
    let id;
    setTimeBlocks(prev => {
      if (prev.some(b => b.taskId === taskId && b.date === blockDate)) {
        alreadyExists = true;
        return prev;
      }
      id = crypto.randomUUID();
      return [...prev, { id, title, startHour, endHour, taskId, color: color || "#5B8DEF", type: "work", date: blockDate }];
    });
    if (alreadyExists) return;
    const userId = await getUserId();
    if (!userId) return;
    // Check DB for existing block (local state may not be loaded yet)
    const { data: existing } = await supabase.from("time_blocks")
      .select("id").eq("task_id", taskId).eq("block_date", blockDate).limit(1);
    if (existing && existing.length > 0) {
      setTimeBlocks(prev => prev.filter(b => b.id !== id));
      return;
    }
    flash("Task added to calendar!");
    const { error } = await supabase.from("time_blocks").insert({
      id, user_id: userId, title, start_hour: startHour,
      end_hour: endHour, block_date: blockDate, color: color || "#5B8DEF", type: "work", task_id: taskId
    });
    if (error) {
      logger.error("Failed to save time block:", error);
      setTimeBlocks(prev => prev.filter(b => b.id !== id));
      flash("Failed to save time block.");
    }
  };

  // ─── DELETE HELPERS ───

  const deleteWsNote = async (id) => {
    const note = wsNotes.find(n => n.id === id);
    setWsNotes(prev => prev.filter(n => n.id !== id));
    flash("Note deleted.");
    const { error } = await supabase.from("workspace_notes").delete().eq("id", id);
    if (error) { logger.error("Failed to delete note:", error); if (note) setWsNotes(prev => [...prev, note]); flash("Delete failed."); }
  };

  const deleteWsDoc = async (id) => {
    const doc = wsDocs.find(d => d.id === id);
    setWsDocs(prev => prev.filter(d => d.id !== id));
    flash("Document deleted.");
    const { error } = await supabase.from("workspace_docs").delete().eq("id", id);
    if (error) { logger.error("Failed to delete doc:", error); if (doc) setWsDocs(prev => [...prev, doc]); flash("Delete failed."); }
  };

  const deleteWorkspace = async (id) => {
    const ws = workspaces.find(w => w.id === id);
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    setProjects(prev => prev.filter(p => p.wsId !== id));
    if (activeWsId === id) setPage("today");
    flash("Workspace deleted.");
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) { logger.error("Failed to delete workspace:", error); if (ws) setWorkspaces(prev => [...prev, ws]); flash("Delete failed."); }
  };

  const deleteTaskNote = async (taskId, noteId) => {
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, notes: t.notes.filter(n => n.id !== noteId) } : t));
    flash("Note deleted.");
    const { error } = await supabase.from("task_notes").delete().eq("id", noteId);
    if (error) logger.error("Failed to delete note:", error);
  };

  const updateTimeBlock = async (id, updates) => {
    const prev = timeBlocks.find(b => b.id === id);
    setTimeBlocks(bs => bs.map(b => b.id === id ? { ...b, ...updates } : b));
    setEditingBlock(null);
    flash("Time block updated!");
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.startHour !== undefined) dbUpdates.start_hour = updates.startHour;
    if (updates.endHour !== undefined) dbUpdates.end_hour = updates.endHour;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    const { error } = await supabase.from("time_blocks").update(dbUpdates).eq("id", id);
    if (error) {
      logger.error("Failed to update time block:", error);
      if (prev) setTimeBlocks(bs => bs.map(b => b.id === id ? prev : b));
      flash("Update failed.");
    }
  };

  const deleteTimeBlock = async (id) => {
    const prev = timeBlocks;
    setTimeBlocks(bs => bs.filter(b => b.id !== id));
    const { error } = await supabase.from("time_blocks").delete().eq("id", id);
    if (error) {
      logger.error("Failed to delete time block:", error);
      setTimeBlocks(prev);
      flash("Delete failed.");
      return;
    }
    flash("Time block deleted.");
  };

  // Computed
  const ws = workspaces;
  const activeWs = ws.find(w => w.id === activeWsId);
  const activeTask = tasks.find(t => t.id === activeTaskId);
  const timerTask = tasks.find(t => t.id === timerTaskId);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayOnly = tasks.filter(t => t.dueDate === todayStr);
  const doneTasks = todayOnly.filter(t => t.done).length;
  const totalTasks = todayOnly.length;
  const donePomos = todayOnly.reduce((s, t) => s + t.donePomos, 0);
  const totalPomos = todayOnly.reduce((s, t) => s + t.totalPomos, 0);
  const pColors = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E" };
  const hour = new Date().getHours();
  const firstName = profileData.preferred_name ? profileData.preferred_name.split(" ")[0] : "";
  const greeting = (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening") + (firstName ? `, ${firstName}` : "");
  const activeWiki = wiki.find(a => a.id === activeWikiId);

  const filteredTasks = searchQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.desc || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Navigate helpers
  const goTask = (id) => { setActiveTaskId(id); setPage("task"); setShowMobileSidebar(false); };
  const goWs = (id) => { setActiveWsId(id); setWsTab("Projects"); setPage("workspace"); setShowMobileSidebar(false); };
  const goProject = (id) => { setActiveProjectId(id); const proj = projects.find(p => p.id === id); if (proj) setActiveWsId(proj.wsId); setPage("project"); setShowMobileSidebar(false); };
  const goToday = () => { setPage("today"); setShowMobileSidebar(false); };
  const goWiki = (id) => { setActiveWikiId(id); setEditingWiki(false); setPage("wikiArticle"); };

  // ─── INPUT STYLE ───
  const inputStyle = {
    width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid var(--border)",
    background:"var(--input-bg)", fontFamily:"var(--body)", fontSize:13, color:"var(--text)",
    outline:"none", transition:"border 0.2s",
  };

  // ─── TASK ROW (reused in today & workspace & allTasks) ───
  const TaskRow = ({ task, idx, showWs = true, showProject = true }) => {
    const w = ws.find(x => x.id === task.wsId);
    const proj = projects.find(p => p.id === task.projectId);
    const subDone = task.subtasks.filter(s => s.done).length;
    return (
      <div style={{
        display:"flex",alignItems:"center",gap:14,padding:"12px 16px",
        background: task.done ? "var(--done-bg)" : "var(--card-bg)",
        borderRadius:10,border:"1px solid var(--card-border)",
        marginBottom:6,transition:"all 0.2s ease",opacity:task.done?0.55:1,cursor:"pointer",
        animation:`slideUp 0.3s ${idx*0.04}s both ease-out`,boxShadow:"var(--card-shadow-sm)",
      }}
        onMouseEnter={e => { if(!task.done){ e.currentTarget.style.borderColor="var(--border-hover)"; e.currentTarget.style.boxShadow="var(--hover-shadow)"; }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor="var(--card-border)"; e.currentTarget.style.boxShadow="var(--card-shadow-sm)"; }}
        onClick={() => goTask(task.id)}
      >
        <div onClick={e => { e.stopPropagation(); toggleTask(task.id); }} style={{
          width:20,height:20,borderRadius:6,flexShrink:0,
          background:task.done?(w?.color):"transparent",border:task.done?"none":"1.5px solid var(--checkbox-border)",
          display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",cursor:"pointer",transition:"all 0.2s",
        }}>{task.done && <Check size={12} />}</div>
        <div style={{ width:6,height:6,borderRadius:"50%",background:pColors[task.priority],flexShrink:0 }} />
        <div style={{ flex:1,minWidth:0 }}>
          <span style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:600,color:"var(--text)",textDecoration:task.done?"line-through":"none" }}>{task.title}</span>
          {task.desc && <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{task.desc}</div>}
          <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:6,flexWrap:"wrap" }}>
            {showWs && w && <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:`${w?.color}14`,padding:"2px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:w?.color,fontWeight:600 }}>{getWsIcon(w?.icon, 10)} {w?.name}</span>}
            {showProject && proj && <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:`${proj.color}14`,padding:"2px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:proj.color,fontWeight:600 }}>{getWsIcon(proj.icon, 10)} {proj.name}</span>}
            {task.subtasks.length > 0 && <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}><CheckCircle2 size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} /> {subDone}/{task.subtasks.length}</span>}
            {task.totalPomos > 0 && <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}><Timer size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} /> {task.donePomos}/{task.totalPomos}</span>}
            {task.dueDate && <span style={{ fontFamily:"var(--mono)",fontSize:10,fontWeight:600,color:"var(--muted)",background:"var(--subtle-bg)",padding:"2px 8px",borderRadius:8 }}>{task.dueDate}</span>}
            {task.dueTime && <span style={{ fontFamily:"var(--mono)",fontSize:10,fontWeight:600,color:task.priority==="high"?"var(--danger)":"var(--muted)",background:task.priority==="high"?"rgba(239,68,68,0.08)":"var(--subtle-bg)",padding:"2px 8px",borderRadius:8 }}><Clock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} /> {task.dueTime}</span>}
            {task.reward && <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"#F59E0B",background:"rgba(251,191,36,0.08)",padding:"2px 8px",borderRadius:8,fontWeight:600 }}>★ Reward</span>}
          </div>
        </div>
        <Btn primary color={w?.color} small onClick={e => { e.stopPropagation(); startFocus(task.id); }}>Focus</Btn>
        <div onClick={e => { e.stopPropagation(); if (confirm("Delete this task?")) deleteTask(task.id); }} style={{ cursor:"pointer",color:"var(--muted)",padding:4,borderRadius:6,display:"flex",alignItems:"center" }}
          onMouseEnter={e => e.currentTarget.style.color="#EF4444"}
          onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
        ><Trash2 size={14} /></div>
      </div>
    );
  };


  // ─── PROFILE FUNCTIONS ───

  const fetchProfile = async () => {
    try {
      const resp = await invokeFunction("profile", {
        body: { action: "read" },
      });
      const data = resp?.data;
      const error = resp?.error;
      if (error) { logger.warn("Profile fetch error:", error); return; }
      if (data) {
        setProfileData({
          preferred_name: data.preferred_name || "",
          country: data.country || "",
        });
        setProfileLoaded(true);
      }
    } catch (e) { logger.error("Failed to load profile:", e); }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const resp = await invokeFunction("profile", {
        body: {
          action: "write",
          preferred_name: sanitizeText(profileData.preferred_name, MAX_NAME) || null,
          country: sanitizeText(profileData.country, MAX_NAME) || null,
        },
      });
      const data = resp?.data;
      const error = resp?.error;
      if (data?.error) throw new Error(data.error);
      if (error) throw new Error(typeof error === "string" ? error : error?.message || JSON.stringify(error));
      flash("Profile saved!");
    } catch (e) {
      logger.error("Failed to save profile:", e?.message || e);
      flash("Failed to save profile: " + (e?.message || "unknown error"));
    }
    setProfileSaving(false);
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const { data, error } = await invokeFunction("export-data", {
        body: {},
      });
      if (error) throw error;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `osvitae-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      flash("Data exported!");
    } catch (e) {
      logger.error("Export failed:", e);
      flash("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { data, error } = await invokeFunction("delete-account", {
        body: { confirm: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
      }
      await supabase.auth.signOut();
    } catch (e) {
      logger.error("Account deletion failed:", e);
      flash("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
    }
    await supabase.auth.signOut();
  };

  const loadFromSupabase = async () => {
    const userId = await getUserId();
    if (!userId) return;
    try {

    // Load all data in parallel
    const [
      { data: dbBlocks }, { data: dbWorkspaces }, { data: dbProjects }, { data: dbTasks },
      { data: dbSubtasks }, { data: dbTaskNotes },
      { data: dbHabits }, { data: dbCompletions },
      { data: dbInbox }, { data: dbWiki },
      { data: dbWsNotes }, { data: dbWsDocs },
      { data: dbTransactions }, { data: dbBills }, { data: dbBillPayments }, { data: dbBudgets },
      { data: dbFinanceCategories },
      { data: dbProfile },
    ] = await Promise.all([
      supabase.from("time_blocks").select("*").eq("user_id", userId),
      supabase.from("workspaces").select("*").eq("user_id", userId).order("position"),
      supabase.from("projects").select("*").eq("user_id", userId).order("position"),
      supabase.from("tasks").select("*").eq("user_id", userId),
      supabase.from("subtasks").select("*").eq("user_id", userId),
      supabase.from("task_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("habits").select("*").eq("user_id", userId),
      supabase.from("habit_completions").select("*").eq("user_id", userId),
      supabase.from("inbox_items").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("wiki_articles").select("*").eq("user_id", userId),
      supabase.from("workspace_notes").select("*").eq("user_id", userId),
      supabase.from("workspace_docs").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("bills").select("*").eq("user_id", userId),
      supabase.from("bill_payments").select("*").eq("user_id", userId),
      supabase.from("budgets").select("*").eq("user_id", userId),
      supabase.from("finance_categories").select("*").eq("user_id", userId).order("sort_order"),
      supabase.from("profiles").select("intention_text, reward_text, xp, level, streak, total_pomos_ever, total_tasks_done").eq("id", userId).single(),
    ]);

    if (dbBlocks) {
      try {
        const mapped = dbBlocks.map(b => ({
          id: b.id, title: b.title, startHour: b.start_hour, endHour: b.end_hour,
          taskId: b.task_id || null, color: b.color || "#5B8DEF", type: b.type || "work",
          date: b.block_date, externalId: b.external_id,
        }));
        // Deduplicate: for blocks linked to the same task on the same date, keep only the first
        const seen = new Map();
        const keep = [];
        const dupeIds = [];
        for (const block of mapped) {
          // Use a strong composite key to catch identical orphaned blocks
          const key = `${block.title}-${block.date}-${block.startHour}`;
          if (seen.has(key)) {
            dupeIds.push(block.id);
          } else {
            seen.set(key, true);
            keep.push(block);
          }
        }
        setTimeBlocks(keep);
        // Clean up duplicates from database in background with a single mass-delete
        if (dupeIds.length > 0) {
          logger.info(`Cleaning up ${dupeIds.length} duplicate time blocks`);
          // Delete in batches of 100 to avoid query size limits just in case
          for (let i = 0; i < dupeIds.length; i += 100) {
            const batch = dupeIds.slice(i, i + 100);
            supabase.from("time_blocks").delete().in("id", batch).then(({ error }) => {
              if (error) logger.error("Failed to delete duplicate blocks:", error);
            });
          }
        }
      } catch (dedupErr) {
        logger.error("Dedup failed, loading all blocks:", dedupErr);
        setTimeBlocks(dbBlocks.map(b => ({
          id: b.id, title: b.title, startHour: b.start_hour, endHour: b.end_hour,
          taskId: b.task_id || null, color: b.color || "#5B8DEF", type: b.type || "work",
          date: b.block_date, externalId: b.external_id,
        })));
      }
    }
    if (dbWorkspaces) {
      setWorkspaces(dbWorkspaces.map(w => ({
        id: w.id, name: w.name, icon: w.icon || "Folder", color: w.color || "#5B8DEF",
      })));
    }
    if (dbProjects) {
      setProjects(dbProjects.map(p => ({
        id: p.id, name: p.name, icon: p.icon || "Folder", color: p.color || "#5B8DEF",
        wsId: p.workspace_id,
      })));
    }

    // Build subtask & note maps for tasks
    const subtasksByTask = {};
    (dbSubtasks || []).forEach(s => {
      if (!subtasksByTask[s.task_id]) subtasksByTask[s.task_id] = [];
      subtasksByTask[s.task_id].push({ id: s.id, text: s.text, done: s.done || false, xp: s.xp || 10 });
    });
    const notesByTask = {};
    (dbTaskNotes || []).forEach(n => {
      if (!notesByTask[n.task_id]) notesByTask[n.task_id] = [];
      notesByTask[n.task_id].push({ id: n.id, text: n.text, time: new Date(n.created_at).toLocaleDateString() });
    });

    if (dbTasks) {
      setTasks(dbTasks.map(t => ({
        id: t.id, title: t.title, desc: t.description || "",
        description: t.description || "",
        priority: t.priority || "medium", done: t.done || false,
        status: t.status || (t.done ? "done" : "todo"),
        dueDate: t.due_date, dueTime: t.due_time, endTime: t.end_time, section: t.section || "afternoon",
        externalId: t.external_id, caldav_href: t.caldav_href, caldav_etag: t.caldav_etag,
        subtasks: subtasksByTask[t.id] || [], notes: notesByTask[t.id] || [],
        attachments: [], donePomos: t.done_pomos || 0, totalPomos: t.total_pomos || 0,
        wsId: t.workspace_id || null, projectId: t.project_id || null, tags: [],
      })));
    }

    // Build completions map for habits
    const completionsByHabit = {};
    (dbCompletions || []).forEach(c => {
      if (!completionsByHabit[c.habit_id]) completionsByHabit[c.habit_id] = [];
      completionsByHabit[c.habit_id].push(c.completed_date);
    });
    if (dbHabits) {
      setHabits(dbHabits.map(h => ({
        id: h.id, name: h.name, icon: h.icon || "Star", color: h.color || "#5B8DEF",
        frequency: h.frequency || "daily", scheduleDays: h.schedule_days || null,
        streak: h.streak || 0,
        completions: completionsByHabit[h.id] || [],
      })));
    }

    if (dbInbox) {
      setInbox(dbInbox.map(i => ({
        id: i.id, text: i.text, triaged: i.triaged || false,
        createdAt: new Date(i.created_at).toLocaleDateString(),
      })));
    }

    if (dbWiki) {
      setWiki(dbWiki.map(a => ({
        id: a.id, title: a.title, category: a.category || "General",
        tags: a.tags || [], content: a.content || "",
        lastUpdated: new Date(a.updated_at || a.created_at).toLocaleDateString(),
      })));
    }

    if (dbWsNotes) {
      setWsNotes(dbWsNotes.map(n => ({
        id: n.id, title: n.title || "Untitled Note", text: n.text || "",
        wsId: n.workspace_id, time: new Date(n.created_at).toLocaleDateString(),
      })));
    }

    if (dbWsDocs) {
      setWsDocs(dbWsDocs.map(d => ({
        id: d.id, name: d.name, wsId: d.workspace_id, type: d.type || "doc",
        icon: { doc: "FileEdit", pdf: "FileText", code: "FileCode2", image: "ImageIcon", other: "FileText" }[d.type] || "FileText",
        size: d.size || "—", time: new Date(d.created_at).toLocaleDateString(),
      })));
    }

    if (dbTransactions) {
      setTransactions(dbTransactions.map(t => ({
        id: t.id, type: t.type, category: t.category || "", amount: parseFloat(t.amount),
        description: t.description || "", date: t.transaction_date, recurring: t.recurring || false,
      })));
    }

    if (dbBills) {
      setBills(dbBills.map(b => ({
        id: b.id, name: b.name, amount: parseFloat(b.amount),
        dueDay: b.due_day || 1, dueDays: b.due_days || [b.due_day || 1], category: b.category || "",
      })));
    }

    if (dbBillPayments) {
      const payments = {};
      dbBillPayments.forEach(p => { payments[`${p.bill_id}-${p.month_key}`] = p.paid_count || 1; });
      setBillPayments(payments);
    }

    if (dbBudgets) {
      setBudgets(dbBudgets.map(b => ({
        categoryId: b.category_id, limit: parseFloat(b.budget_limit),
      })));
    }

    if (dbFinanceCategories && dbFinanceCategories.length > 0) {
      setCustomCategories(dbFinanceCategories.map(c => ({
        id: c.category_id, type: c.type, label: c.label, color: c.color, icon: c.icon, sortOrder: c.sort_order,
      })));
    } else {
      // First load — seed defaults
      seedDefaultCategories();
    }

    if (dbProfile) {
      if (dbProfile.intention_text) setIntentionText(dbProfile.intention_text);
      if (dbProfile.reward_text) setRewardText(dbProfile.reward_text);
      if (dbProfile.xp != null) setXp(dbProfile.xp);
      if (dbProfile.level != null) setLevel(dbProfile.level);
      if (dbProfile.streak != null) setStreak(dbProfile.streak);
      if (dbProfile.total_pomos_ever != null) setTotalPomosEver(dbProfile.total_pomos_ever);
      if (dbProfile.total_tasks_done != null) setTotalTasksDone(dbProfile.total_tasks_done);
    }

    } catch (loadErr) {
      logger.error("loadFromSupabase crashed:", loadErr);
    }
  };

  useEffect(() => {
    let edgeFunctionsLoaded = false;
    const loadEdgeFunctions = () => {
      if (edgeFunctionsLoaded) return;
      edgeFunctionsLoaded = true;
      fetchProfile();
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return;
      // Always load DB data on any session event
      loadFromSupabase();
      // Only call edge functions after token is confirmed fresh
      if (event === 'PASSWORD_RECOVERY') {
        setPage('settings');
        flash('Set your new password below.');
        loadEdgeFunctions();
      } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        loadEdgeFunctions();
      } else if (event === 'INITIAL_SESSION') {
        // Token might be expired — refresh first, then load
        supabase.auth.refreshSession().then(() => loadEdgeFunctions());
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Persist gamification stats to profile when they change
  const statsLoadedRef = useRef(false);
  useEffect(() => {
    if (!statsLoadedRef.current) { statsLoadedRef.current = true; return; }
    const timer = setTimeout(async () => {
      const userId = await getUserId();
      if (userId) {
        const { error } = await supabase.from("profiles").update({ xp, level, streak, total_pomos_ever: totalPomosEver, total_tasks_done: totalTasksDone }).eq("id", userId);
        if (error) logger.error("Stats save failed:", error);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [xp, level, streak, totalPomosEver, totalTasksDone]);

  const autoScheduledTasks = useRef(new Set());
  // Auto-schedule task to calendar when time & date is set to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const tasksDueToday = tasks.filter(t => t.dueDate === today && t.dueTime && !t.done);
    tasksDueToday.forEach(t => {
      const scheduleKey = `${t.id}-${t.dueTime}`;
      if (autoScheduledTasks.current.has(scheduleKey)) return;
      
      const exists = timeBlocks.some(b => b.taskId === t.id && b.date === today);
      if (!exists) {
        autoScheduledTasks.current.add(scheduleKey);
        const [hh, mm] = t.dueTime.split(":").map(Number);
        const startHour = hh + (mm / 60);
        let endHour = startHour + 1;
        if (t.endTime) {
          const [eh, em] = t.endTime.split(":").map(Number);
          endHour = eh + (em / 60);
        }
        const color = pColors[t.priority] || "#5B8DEF";
        createTimeBlockFromTask({ taskId: t.id, title: t.title, color, startHour, endHour });
      } else {
        autoScheduledTasks.current.add(scheduleKey);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // ═══════════════════════════════════════
  //  BREADCRUMB
  // ═══════════════════════════════════════
  const breadcrumb = () => {
    const homeIcon = <Home size={14} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 4 }} />;
    const crumbs = {
      today: <><strong style={{ color:"var(--text)" }}>{homeIcon} Today</strong></>,
      allTasks: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>All Tasks</strong></>,
      timer: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Focus Timer</strong></>,
      rewards: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Rewards</strong></>,
      habits: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Habits</strong></>,
      calendar: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Calendar</strong></>,
      finance: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Finance</strong></>,
      review: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Weekly Review</strong></>,
      inbox: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Inbox</strong></>,
      wiki: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Wiki</strong></>,
      wikiArticle: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <span onClick={() => setPage("wiki")} style={{ cursor:"pointer" }}>Wiki</span> / <strong style={{ color:"var(--text)" }}>{activeWiki?.title}</strong></>,
    };
    if (page === "workspace") return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:activeWs?.color }}>{activeWs?.name}</strong></>;
    if (page === "project" && activeProject) { const w = ws.find(x=>x.id===activeProject.wsId); return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <span onClick={() => goWs(activeProject.wsId)} style={{ cursor:"pointer",color:w?.color }}>{w?.name}</span> / <strong style={{ color:activeProject.color }}>{activeProject.name}</strong></>; }
    if (page === "task" && activeTask) { const w = ws.find(x=>x.id===activeTask.wsId); const p = projects.find(x=>x.id===activeTask.projectId); return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span>{w && <> / <span onClick={() => goWs(activeTask.wsId)} style={{ cursor:"pointer",color:w?.color }}>{w?.name}</span></>}{p && <> / <span onClick={() => goProject(p.id)} style={{ cursor:"pointer",color:p.color }}>{p.name}</span></>} / <strong style={{ color:"var(--text)" }}>{activeTask.title}</strong></>; }
    return crumbs[page] || null;
  };

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════
  return (
    <div style={{
      ...theme,
      display:"flex",height:"100dvh",overflow:"hidden",
      background: themeName === "halo" ? "#0A120E" : "linear-gradient(135deg, #dfe7fd 0%, #e8dff5 25%, #f5e6f0 50%, #dceefb 75%, #e0f4f1 100%)",
      transition:"background 0.3s ease",position:"relative",
    }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        @keyframes haloGlow{0%,100%{box-shadow:0 0 8px rgba(0,209,178,0.15)}50%{box-shadow:0 0 16px rgba(0,209,178,0.3)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes orbFloat1{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(30px,-40px) scale(1.1)}50%{transform:translate(-20px,-60px) scale(0.95)}75%{transform:translate(-40px,-20px) scale(1.05)}}
        @keyframes orbFloat2{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(-40px,30px) scale(1.08)}50%{transform:translate(30px,50px) scale(0.92)}75%{transform:translate(50px,-10px) scale(1.03)}}
        @keyframes orbFloat3{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-30px,-50px) scale(1.12)}66%{transform:translate(40px,20px) scale(0.9)}}
        .glass-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.35;pointer-events:none;z-index:0}
        .glass-orb-1{width:400px;height:400px;background:radial-gradient(circle,#a78bfa,transparent 70%);top:5%;left:10%;animation:orbFloat1 20s ease-in-out infinite}
        .glass-orb-2{width:350px;height:350px;background:radial-gradient(circle,#6366f1,transparent 70%);top:50%;right:10%;animation:orbFloat2 25s ease-in-out infinite}
        .glass-orb-3{width:300px;height:300px;background:radial-gradient(circle,#ec4899,transparent 70%);bottom:10%;left:30%;animation:orbFloat3 22s ease-in-out infinite}
        .glass-orb-4{width:250px;height:250px;background:radial-gradient(circle,#14b8a6,transparent 70%);top:20%;right:35%;animation:orbFloat1 28s ease-in-out infinite reverse}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:3px}
        textarea:focus,input:focus{border-color:var(--focus-border)!important;box-shadow:var(--focus-shadow)!important}
        @media(pointer:coarse){[data-action]{opacity:0.7!important}}

        /* ── Mobile responsive ── */
        .mobile-hamburger{display:none}
        .sidebar-desktop{display:flex}
        .mobile-sidebar-overlay{display:none}
        .topbar-breadcrumb{display:block}
        .topbar-search{width:200px}
        .topbar-xp{display:flex;width:160px}

        /* ── iPhone 17 / 17 Pro (≤430px portrait) ── */
        @media(max-width:430px){
          .mobile-hamburger{display:flex}
          .sidebar-desktop{display:none!important}
          .mobile-sidebar-overlay{display:block}
          .topbar-breadcrumb{display:none}
          .topbar-search{width:auto;flex:1}
          .topbar-xp{display:none}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .today-layout{flex-direction:column!important}
          .today-sidebar{width:100%!important}
          .notes-grid{grid-template-columns:1fr!important}
          .rewards-stats{grid-template-columns:1fr!important}
          .achievements-grid{grid-template-columns:1fr!important}
          .main-content{padding:12px 14px!important}
          .modal-inner{width:calc(100vw - 24px)!important;max-width:none;margin:12px;max-height:calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px)!important}
          .today-heading{font-size:24px!important}
          .today-date{font-size:12px!important}
          .task-row-focus-btn{padding:4px 10px!important;font-size:10px!important}
        }

        /* ── Larger phones / small tablets (431-600px) ── */
        @media(min-width:431px) and (max-width:600px){
          .mobile-hamburger{display:flex}
          .sidebar-desktop{display:none!important}
          .mobile-sidebar-overlay{display:block}
          .topbar-breadcrumb{display:none}
          .topbar-search{width:auto;flex:1}
          .topbar-xp{display:none}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .today-layout{flex-direction:column!important}
          .today-sidebar{width:100%!important}
          .notes-grid{grid-template-columns:1fr!important}
          .rewards-stats{grid-template-columns:1fr!important}
          .achievements-grid{grid-template-columns:1fr!important}
          .main-content{padding:16px 18px!important}
          .modal-inner{width:calc(100vw - 32px)!important;max-width:520px;margin:16px}
        }

        /* ── iPad mini portrait (601-820px, 744px CSS width) ── */
        @media(min-width:601px) and (max-width:820px){
          .mobile-hamburger{display:flex}
          .sidebar-desktop{display:none!important}
          .mobile-sidebar-overlay{display:block}
          .topbar-breadcrumb{display:none}
          .topbar-search{width:auto;flex:1}
          .topbar-xp{display:none}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .today-layout{flex-direction:column!important}
          .today-sidebar{width:100%!important}
          .notes-grid{grid-template-columns:1fr!important}
          .rewards-stats{grid-template-columns:1fr!important}
          .achievements-grid{grid-template-columns:1fr!important}
          .main-content{padding:16px 18px!important}
          .modal-inner{width:calc(100vw - 32px)!important;max-width:520px;margin:16px}
        }

        /* ── iPad 10th gen / iPadOS desktop-mode viewport (821-1024px) — same as mobile ── */
        @media(min-width:821px) and (max-width:1024px){
          .mobile-hamburger{display:flex}
          .sidebar-desktop{display:none!important}
          .mobile-sidebar-overlay{display:block}
          .topbar-breadcrumb{display:none}
          .topbar-search{width:auto;flex:1}
          .topbar-xp{display:none}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .today-layout{flex-direction:column!important}
          .today-sidebar{width:100%!important}
          .notes-grid{grid-template-columns:1fr!important}
          .rewards-stats{grid-template-columns:1fr!important}
          .achievements-grid{grid-template-columns:1fr!important}
          .main-content{padding:16px 18px!important}
          .modal-inner{width:calc(100vw - 32px)!important;max-width:520px;margin:16px}
        }

        /* ── All phones & tablets: safe area for fixed elements ── */
        @media(max-width:1024px){
          .toast-container{bottom:calc(24px + env(safe-area-inset-bottom))!important}
          .mobile-topbar{padding-top:env(safe-area-inset-top)!important}
        }
      `}</style>

      {/* Liquid glass background orbs */}
      {themeName === "default" && <>
        <div className="glass-orb glass-orb-1" />
        <div className="glass-orb glass-orb-2" />
        <div className="glass-orb glass-orb-3" />
        <div className="glass-orb glass-orb-4" />
      </>}

      {/* Mobile sidebar overlay */}
      {showMobileSidebar && (
        <div className="mobile-sidebar-overlay" style={{ position:"fixed",inset:0,zIndex:50 }}>
          <div onClick={() => setShowMobileSidebar(false)} style={{ position:"absolute",inset:0,background:"var(--overlay-heavy)",backdropFilter:"blur(2px)" }} />
          <div className="mobile-sidebar-panel" style={{ position:"relative",width:"min(280px, calc(100vw - 60px))",height:"100%",zIndex:51,paddingTop:"env(safe-area-inset-top)",paddingBottom:"env(safe-area-inset-bottom)" }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} page={page} setPage={setPage} themeName={themeName} toggleTheme={toggleTheme} timerActive={timerActive} timeLeft={timeLeft} fmt={fmt} inbox={inbox} ws={ws} tasks={tasks} projects={projects} activeWsId={activeWsId} activeProjectId={activeProjectId} goWs={goWs} goProject={goProject} goToday={goToday} sidebarSections={sidebarSections} setSidebarSections={setSidebarSections} setShowNewWs={setShowNewWs} setShowNewProject={setShowNewProject} setNewProjectWsId={setNewProjectWsId} setShowMobileSidebar={setShowMobileSidebar} setTimerTaskId={setTimerTaskId} doneTasks={doneTasks} totalTasks={totalTasks} signOut={handleSignOut} />
          </div>
        </div>
      )}

      <div className="sidebar-desktop">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} page={page} setPage={setPage} themeName={themeName} toggleTheme={toggleTheme} timerActive={timerActive} timeLeft={timeLeft} fmt={fmt} inbox={inbox} ws={ws} tasks={tasks} projects={projects} activeWsId={activeWsId} activeProjectId={activeProjectId} goWs={goWs} goProject={goProject} goToday={goToday} sidebarSections={sidebarSections} setSidebarSections={setSidebarSections} setShowNewWs={setShowNewWs} setShowNewProject={setShowNewProject} setNewProjectWsId={setNewProjectWsId} setShowMobileSidebar={setShowMobileSidebar} setTimerTaskId={setTimerTaskId} doneTasks={doneTasks} totalTasks={totalTasks} signOut={handleSignOut} />
      </div>

      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Top bar */}
        <div className="mobile-topbar" style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",gap:10,
          background:"var(--card-bg)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid var(--border-light)",transition:"background 0.3s ease",flexShrink:0,
        }}>
          <div className="mobile-hamburger" onClick={() => setShowMobileSidebar(true)} style={{ width:36,height:36,borderRadius:10,background:"var(--subtle-bg)",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}><Menu size={18} /></div>
          <span className="topbar-breadcrumb" style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>{breadcrumb()}</span>
          <div style={{ display:"flex",alignItems:"center",gap:10,flex:1,justifyContent:"flex-end" }}>
            <div className="topbar-search" onClick={() => setShowSearch(true)} style={{ background:"var(--subtle-bg)",borderRadius:10,padding:"7px 14px",fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",display:"flex",alignItems:"center",gap:6,cursor:"pointer",border:"1px solid var(--subtle-bg)" }}><Search size={14} /> Search...</div>
            <div className="topbar-xp" style={{ alignItems:"center",gap:8 }}>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--xp-color)",fontWeight:700 }}>LVL {level}</span>
              <div style={{ flex:1,height:5,background:"var(--card-border)",borderRadius:8,overflow:"hidden" }}>
                <div style={{ width:`${(xp/500)*100}%`,height:"100%",borderRadius:8,background:themeName === "halo" ? "linear-gradient(90deg, #FFB000, #4ADE80)" : "linear-gradient(90deg, #A78BFA, #6366F1, #818CF8)",transition:"width 0.8s" }} />
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:4 }}>
              <span style={{ display: "flex" }}><Flame size={14} color="var(--danger)" /></span>
              <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--danger)",fontWeight:700 }}>{streak}</span>
            </div>
            <div onClick={() => setPage("rewards")} style={{ width:32,height:32,borderRadius:10,background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--body)",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",flexShrink:0 }}>{profileData.preferred_name ? profileData.preferred_name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "?"}</div>
          </div>
        </div>

        <div className="main-content" style={{ flex:1,overflow:"auto",padding: page === "timer" ? "28px 28px" : "24px 28px", minHeight: 0, display:"flex", flexDirection:"column" }}>
          {page === "today" && <TodayPage greeting={greeting} totalTasks={totalTasks} doneTasks={doneTasks} totalPomos={totalPomos} donePomos={donePomos} habits={habits} toggleHabit={toggleHabit} streak={streak} themeName={themeName} timerActive={timerActive} timeLeft={timeLeft} fmt={fmt} setTimerTaskId={setTimerTaskId} setPage={setPage} tasks={tasks} ws={ws} projects={projects} goTask={goTask} TaskRow={TaskRow} inbox={inbox} intentionText={intentionText} setIntentionText={setIntentionText} editingIntention={editingIntention} setEditingIntention={setEditingIntention} setNewTaskWs={setNewTaskWs} setShowNewTask={setShowNewTask} flash={flash} inputStyle={inputStyle} timeBlocks={timeBlocks} updateTimeBlock={updateTimeBlock} setShowNewBlock={setShowNewBlock} deleteTimeBlock={deleteTimeBlock} setEditingBlock={setEditingBlock} rewardText={rewardText} setRewardText={setRewardText} editingReward={editingReward} setEditingReward={setEditingReward} createTimeBlockFromTask={createTimeBlockFromTask} xp={xp} level={level} />}
          {page === "workspace" && <WorkspacePage activeWs={activeWs} activeWsId={activeWsId} tasks={tasks} projects={projects} wsNotes={wsNotes} wsDocs={wsDocs} wsTab={wsTab} setWsTab={setWsTab} setNewTaskWs={setNewTaskWs} setNewTaskProject={setNewTaskProject} setShowNewTask={setShowNewTask} setShowWsNote={setShowWsNote} setShowWsDoc={setShowWsDoc} deleteWorkspace={deleteWorkspace} deleteWsNote={deleteWsNote} deleteWsDoc={deleteWsDoc} openEditWs={openEditWs} goTask={goTask} goProject={goProject} setShowNewProject={setShowNewProject} setNewProjectWsId={setNewProjectWsId} deleteProject={deleteProject} TaskRow={TaskRow} />}
          {page === "project" && <ProjectPage activeProject={activeProject} activeProjectId={activeProjectId} activeWs={activeWs} tasks={tasks} wsNotes={wsNotes} wsDocs={wsDocs} setNewTaskWs={setNewTaskWs} setNewTaskProject={setNewTaskProject} setShowNewTask={setShowNewTask} setShowWsNote={setShowWsNote} setShowWsDoc={setShowWsDoc} deleteProject={deleteProject} deleteWsNote={deleteWsNote} deleteWsDoc={deleteWsDoc} goTask={goTask} goWs={goWs} TaskRow={TaskRow} />}
          {page === "task" && <TaskDetailPage activeTask={activeTask} ws={ws} pColors={pColors} setPage={setPage} page={page} startFocus={startFocus} toggleTask={toggleTask} toggleSubtask={toggleSubtask} setEditingTask={setEditingTask} deleteTask={deleteTask} setShowNewNote={setShowNewNote} deleteTaskNote={deleteTaskNote} flash={flash} />}
          {page === "timer" && <TimerPage timerTask={timerTask} ws={ws} timeLeft={timeLeft} setTimeLeft={setTimeLeft} timerActive={timerActive} setTimerActive={setTimerActive} isBreak={isBreak} setIsBreak={setIsBreak} sessionCount={sessionCount} endTimeRef={endTimeRef} WORK_DURATION={WORK_DURATION} SHORT_BREAK={SHORT_BREAK} LONG_BREAK={LONG_BREAK} CYCLE_LENGTH={CYCLE_LENGTH} fmt={fmt} goToday={goToday} flash={flash} streak={streak} themeName={themeName} />}
          {page === "rewards" && <RewardsPage level={level} xp={xp} themeName={themeName} streak={streak} totalPomosEver={totalPomosEver} donePomos={donePomos} doneTasks={doneTasks} totalTasksDone={totalTasksDone} />}
          {page === "allTasks" && <AllTasksPage filteredTasks={filteredTasks} setShowNewTask={setShowNewTask} TaskRow={TaskRow} ws={ws} projects={projects} pColors={pColors} goTask={goTask} toggleTask={toggleTask} deleteTask={deleteTask} startFocus={startFocus} updateTaskStatus={updateTaskStatus} updateTaskField={updateTaskField} />}
          {page === "habits" && <HabitsPage habits={habits} setShowNewHabit={setShowNewHabit} toggleHabit={toggleHabit} deleteHabit={deleteHabit} setEditingHabit={setEditingHabit} />}
          {page === "calendar" && <CalendarPage timeBlocks={timeBlocks} tasks={tasks} ws={ws} projects={projects} setShowNewBlock={setShowNewBlock} deleteTimeBlock={deleteTimeBlock} setEditingBlock={setEditingBlock} goTask={goTask} updateTimeBlock={updateTimeBlock} />}
          {page === "finance" && <FinancePage transactions={transactions} financeTab={financeTab} setFinanceTab={setFinanceTab} setShowNewTransaction={setShowNewTransaction} deleteTransaction={deleteTransaction} setEditingTransaction={setEditingTransaction} saveBudget={saveBudget} addIncome={addIncome} togglePaid={togglePaid} addBill={addBill} deleteBill={deleteBill} setEditingBill={setEditingBill} budgets={budgets} editingBudget={editingBudget} setEditingBudget={setEditingBudget} editBudgetVal={editBudgetVal} setEditBudgetVal={setEditBudgetVal} newIncomeCategory={newIncomeCategory} setNewIncomeCategory={setNewIncomeCategory} newIncomeAmount={newIncomeAmount} setNewIncomeAmount={setNewIncomeAmount} newIncomeDesc={newIncomeDesc} setNewIncomeDesc={setNewIncomeDesc} newIncomeRecurring={newIncomeRecurring} setNewIncomeRecurring={setNewIncomeRecurring} bills={bills} billPayments={billPayments} newBillName={newBillName} setNewBillName={setNewBillName} newBillAmount={newBillAmount} setNewBillAmount={setNewBillAmount} newBillDueDay={newBillDueDay} setNewBillDueDay={setNewBillDueDay} newBillCategory={newBillCategory} setNewBillCategory={setNewBillCategory} inputStyle={inputStyle} getCategories={getCategories} addCategory={addCategory} renameCategory={renameCategory} deleteCategory={deleteCategory} />}
          {page === "review" && <ReviewPage tasks={tasks} inbox={inbox} habits={habits} toggleHabit={toggleHabit} goTask={goTask} pColors={pColors} />}
          {page === "inbox" && <InboxPage inbox={inbox} newInboxText={newInboxText} setNewInboxText={setNewInboxText} addInboxItem={addInboxItem} triageInbox={triageInbox} dismissInbox={dismissInbox} updateInboxItem={updateInboxItem} setTasks={setTasks} flash={flash} inputStyle={inputStyle} />}
          {page === "wiki" && <WikiPage wiki={wiki} setShowNewWiki={setShowNewWiki} goWiki={goWiki} />}
          {page === "wikiArticle" && <WikiArticlePage activeWiki={activeWiki} setPage={setPage} editingWiki={editingWiki} setEditingWiki={setEditingWiki} editWikiContent={editWikiContent} setEditWikiContent={setEditWikiContent} saveWikiEdit={saveWikiEdit} deleteWikiArticle={deleteWikiArticle} inputStyle={inputStyle} />}
          {page === "settings" && <SettingsPage profileData={profileData} setProfileData={setProfileData} saveProfile={saveProfile} profileSaving={profileSaving} themeName={themeName} exportData={exportData} exporting={exporting} deleteAccount={deleteAccount} deleting={deleting} inputStyle={inputStyle} household={household} householdMembers={householdMembers} pendingInvites={pendingInvites} incomingInvite={incomingInvite} householdLoading={householdLoading} createHousehold={createHousehold} inviteMember={inviteMember} acceptInvite={acceptInvite} declineInvite={declineInvite} />}
        </div>
      </div>

      {/* ─── MODALS ─── */}
      <Modal open={showNewTask} onClose={() => setShowNewTask(false)} title="New Task">
        <div style={{ maxHeight:"70vh",overflowY:"auto",paddingRight:4 }}>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
          <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="What needs to be done?" style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Description</label>
          <textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Add details..." style={{ ...inputStyle, minHeight:70, resize:"vertical" }} />
        </div>
        <div style={{ display:"flex",gap:14,marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Priority</label>
            <div style={{ display:"flex",gap:6 }}>
              {["low","medium","high"].map(p => (
                <div key={p} onClick={() => setNewTaskPriority(p)} style={{
                  flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                  background: newTaskPriority === p ? `${pColors[p]}18` : "var(--hover-bg)",
                  border: newTaskPriority === p ? `2px solid ${pColors[p]}` : "2px solid transparent",
                  fontFamily:"var(--body)",fontSize:12,fontWeight:600,color:newTaskPriority===p?pColors[p]:"var(--muted)",
                  textTransform:"capitalize",transition:"all 0.15s",
                }}>{p}</div>
              ))}
            </div>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Workspace</label>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {ws.map(w => (
                <div key={w.id} onClick={() => { setNewTaskWs(w.id); setNewTaskProject(null); }} style={{
                  padding:"6px 12px",borderRadius:10,cursor:"pointer",
                  background: newTaskWs === w.id ? `${w.color}18` : "var(--hover-bg)",
                  border: newTaskWs === w.id ? `2px solid ${w.color}` : "2px solid transparent",
                  fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newTaskWs===w.id?w.color:"var(--muted)",
                  transition:"all 0.15s",display:"flex",alignItems:"center",gap:4,
                }}>{getWsIcon(w.icon, 11)} {w.name}</div>
              ))}
            </div>
          </div>
        </div>
        {newTaskWs && projects.filter(p => p.wsId === newTaskWs).length > 0 && (
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Project</label>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {projects.filter(p => p.wsId === newTaskWs).map(p => (
              <div key={p.id} onClick={() => setNewTaskProject(p.id)} style={{
                padding:"6px 12px",borderRadius:10,cursor:"pointer",
                background: newTaskProject === p.id ? `${p.color}18` : "var(--hover-bg)",
                border: newTaskProject === p.id ? `2px solid ${p.color}` : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newTaskProject===p.id?p.color:"var(--muted)",
                transition:"all 0.15s",display:"flex",alignItems:"center",gap:4,
              }}>{getWsIcon(p.icon, 11)} {p.name}</div>
            ))}
          </div>
        </div>
        )}
        <div style={{ display:"flex",gap:14,marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Due Date</label>
            <input type="date" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Start Time</label>
            <input type="time" value={newTaskDueTime} onChange={e => { setNewTaskDueTime(e.target.value); const p = pomosFromTimes(e.target.value, newTaskEndTime); if (p) setNewTaskPomos(p); }} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>End Time</label>
            <input type="time" value={newTaskEndTime} onChange={e => { setNewTaskEndTime(e.target.value); const p = pomosFromTimes(newTaskDueTime, e.target.value); if (p) setNewTaskPomos(p); }} style={inputStyle} />
          </div>
        </div>
        <div style={{ display:"flex",gap:14,marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Section</label>
            <div style={{ display:"flex",gap:6 }}>
              {["morning","afternoon","evening"].map(s => (
                <div key={s} onClick={() => setNewTaskSection(s)} style={{
                  flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                  background: newTaskSection === s ? "var(--primary-bg)" : "var(--hover-bg)",
                  border: newTaskSection === s ? "2px solid var(--primary)" : "2px solid transparent",
                  fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newTaskSection===s?"var(--primary)":"var(--muted)",
                  textTransform:"capitalize",transition:"all 0.15s",
                }}>{s === "morning" ? "AM" : s === "afternoon" ? "PM" : "EVE"}</div>
              ))}
            </div>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Pomodoros</label>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div onClick={() => setNewTaskPomos(Math.max(1, newTaskPomos - 1))} style={{ width:32,height:32,borderRadius:8,background:"var(--hover-bg)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:"var(--body)",fontSize:16,fontWeight:700,color:"var(--muted)",userSelect:"none" }}>−</div>
              <span style={{ fontFamily:"var(--mono)",fontSize:14,fontWeight:700,color:"var(--text)",minWidth:20,textAlign:"center" }}>{newTaskPomos}</span>
              <div onClick={() => setNewTaskPomos(Math.min(12, newTaskPomos + 1))} style={{ width:32,height:32,borderRadius:8,background:"var(--hover-bg)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:"var(--body)",fontSize:16,fontWeight:700,color:"var(--muted)",userSelect:"none" }}>+</div>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Steps</label>
          <div style={{ display:"flex",gap:8,marginBottom:8 }}>
            <input value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)} placeholder="Add a step..." style={{ ...inputStyle, flex:1 }}
              onKeyDown={e => { if (e.key === "Enter" && newSubtaskText.trim()) { setNewTaskSubtasks(prev => [...prev, newSubtaskText.trim()]); setNewSubtaskText(""); }}} />
            <Btn small onClick={() => { if (newSubtaskText.trim()) { setNewTaskSubtasks(prev => [...prev, newSubtaskText.trim()]); setNewSubtaskText(""); }}}>Add</Btn>
          </div>
          {newTaskSubtasks.map((st, i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--input-bg)",borderRadius:8,marginBottom:4,border:"1px solid var(--border-light)" }}>
              <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",fontWeight:600 }}>{i+1}.</span>
              <span style={{ flex:1,fontFamily:"var(--body)",fontSize:13,color:"var(--text)" }}>{st}</span>
              <div onClick={() => setNewTaskSubtasks(prev => prev.filter((_, j) => j !== i))} style={{ cursor:"pointer",color:"var(--muted)",display:"flex",alignItems:"center" }}
                onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
              ><X size={14} /></div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Reward (after completing)</label>
          <input value={newTaskReward} onChange={e => setNewTaskReward(e.target.value)} placeholder="e.g. Coffee break, 15 min gaming..." style={inputStyle} />
        </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:10,borderTop:"1px solid var(--border-light)" }}>
          <Btn onClick={() => setShowNewTask(false)}>Cancel</Btn>
          <Btn primary onClick={createTask}>Create Task</Btn>
        </div>
      </Modal>

      <Modal open={!!editingTask} onClose={() => { setEditingTask(null); setEditSubtaskText(""); }} title="Edit Task">
        {editingTask && (<>
        <div style={{ maxHeight:"70vh",overflowY:"auto",paddingRight:4 }}>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
          <input value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Description</label>
          <textarea value={editingTask.desc || ""} onChange={e => setEditingTask({ ...editingTask, desc: e.target.value })} style={{ ...inputStyle, minHeight:70, resize:"vertical" }} />
        </div>
        <div style={{ display:"flex",gap:14,marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Priority</label>
            <div style={{ display:"flex",gap:6 }}>
              {["low","medium","high"].map(p => (
                <div key={p} onClick={() => setEditingTask({ ...editingTask, priority: p })} style={{
                  flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                  background: editingTask.priority === p ? `${pColors[p]}18` : "var(--hover-bg)",
                  border: editingTask.priority === p ? `2px solid ${pColors[p]}` : "2px solid transparent",
                  fontFamily:"var(--body)",fontSize:12,fontWeight:600,color:editingTask.priority===p?pColors[p]:"var(--muted)",
                  textTransform:"capitalize",transition:"all 0.15s",
                }}>{p}</div>
              ))}
            </div>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Workspace</label>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              <div onClick={() => setEditingTask({ ...editingTask, wsId: null, projectId: null })} style={{
                padding:"6px 10px",borderRadius:10,cursor:"pointer",
                background: !editingTask.wsId ? "var(--primary-bg)" : "var(--hover-bg)",
                border: !editingTask.wsId ? "2px solid var(--primary)" : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:!editingTask.wsId?"var(--primary)":"var(--muted)",
                transition:"all 0.15s",
              }}>None</div>
              {ws.map(w => (
                <div key={w.id} onClick={() => setEditingTask({ ...editingTask, wsId: w.id, projectId: null })} style={{
                  padding:"6px 10px",borderRadius:10,cursor:"pointer",
                  background: editingTask.wsId === w.id ? `${w.color}18` : "var(--hover-bg)",
                  border: editingTask.wsId === w.id ? `2px solid ${w.color}` : "2px solid transparent",
                  fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:editingTask.wsId===w.id?w.color:"var(--muted)",
                  transition:"all 0.15s",display:"flex",alignItems:"center",gap:4,
                }}>{getWsIcon(w.icon, 11)} {w.name}</div>
              ))}
            </div>
          </div>
        </div>
        {editingTask.wsId && projects.filter(p => p.wsId === editingTask.wsId).length > 0 && (
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Project</label>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            <div onClick={() => setEditingTask({ ...editingTask, projectId: null })} style={{
              padding:"6px 10px",borderRadius:10,cursor:"pointer",
              background: !editingTask.projectId ? "var(--primary-bg)" : "var(--hover-bg)",
              border: !editingTask.projectId ? "2px solid var(--primary)" : "2px solid transparent",
              fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:!editingTask.projectId?"var(--primary)":"var(--muted)",
              transition:"all 0.15s",
            }}>None</div>
            {projects.filter(p => p.wsId === editingTask.wsId).map(p => (
              <div key={p.id} onClick={() => setEditingTask({ ...editingTask, projectId: p.id })} style={{
                padding:"6px 10px",borderRadius:10,cursor:"pointer",
                background: editingTask.projectId === p.id ? `${p.color}18` : "var(--hover-bg)",
                border: editingTask.projectId === p.id ? `2px solid ${p.color}` : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:editingTask.projectId===p.id?p.color:"var(--muted)",
                transition:"all 0.15s",display:"flex",alignItems:"center",gap:4,
              }}>{getWsIcon(p.icon, 11)} {p.name}</div>
            ))}
          </div>
        </div>
        )}
        <div style={{ display:"flex",gap:14,marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Due Date</label>
            <input type="date" value={editingTask.dueDate || ""} onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Start Time</label>
            <input type="time" value={editingTask.dueTime || ""} onChange={e => { const p = pomosFromTimes(e.target.value, editingTask.endTime); setEditingTask({ ...editingTask, dueTime: e.target.value, ...(p ? { totalPomos: p } : {}) }); }} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>End Time</label>
            <input type="time" value={editingTask.endTime || ""} onChange={e => { const p = pomosFromTimes(editingTask.dueTime, e.target.value); setEditingTask({ ...editingTask, endTime: e.target.value, ...(p ? { totalPomos: p } : {}) }); }} style={inputStyle} />
          </div>
        </div>
        <div style={{ display:"flex",gap:14,marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Section</label>
            <div style={{ display:"flex",gap:6 }}>
              {["morning","afternoon","evening"].map(s => (
                <div key={s} onClick={() => setEditingTask({ ...editingTask, section: s })} style={{
                  flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                  background: editingTask.section === s ? "var(--primary-bg)" : "var(--hover-bg)",
                  border: editingTask.section === s ? "2px solid var(--primary)" : "2px solid transparent",
                  fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:editingTask.section===s?"var(--primary)":"var(--muted)",
                  textTransform:"capitalize",transition:"all 0.15s",
                }}>{s === "morning" ? "AM" : s === "afternoon" ? "PM" : "EVE"}</div>
              ))}
            </div>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Pomodoros</label>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div onClick={() => setEditingTask({ ...editingTask, totalPomos: Math.max(1, (editingTask.totalPomos || 1) - 1) })} style={{ width:32,height:32,borderRadius:8,background:"var(--hover-bg)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:"var(--body)",fontSize:16,fontWeight:700,color:"var(--muted)",userSelect:"none" }}>−</div>
              <span style={{ fontFamily:"var(--mono)",fontSize:14,fontWeight:700,color:"var(--text)",minWidth:20,textAlign:"center" }}>{editingTask.totalPomos || 0}</span>
              <div onClick={() => setEditingTask({ ...editingTask, totalPomos: Math.min(12, (editingTask.totalPomos || 0) + 1) })} style={{ width:32,height:32,borderRadius:8,background:"var(--hover-bg)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:"var(--body)",fontSize:16,fontWeight:700,color:"var(--muted)",userSelect:"none" }}>+</div>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Steps</label>
          <div style={{ display:"flex",gap:8,marginBottom:8 }}>
            <input value={editSubtaskText} onChange={e => setEditSubtaskText(e.target.value)} placeholder="Add a step..." style={{ ...inputStyle, flex:1 }}
              onKeyDown={e => { if (e.key === "Enter" && editSubtaskText.trim()) { setEditingTask({ ...editingTask, subtasks: [...(editingTask.subtasks || []), { id: crypto.randomUUID(), text: editSubtaskText.trim(), done: false, xp: 10 }] }); setEditSubtaskText(""); }}} />
            <Btn small onClick={() => { if (editSubtaskText.trim()) { setEditingTask({ ...editingTask, subtasks: [...(editingTask.subtasks || []), { id: crypto.randomUUID(), text: editSubtaskText.trim(), done: false, xp: 10 }] }); setEditSubtaskText(""); }}}>Add</Btn>
          </div>
          {(editingTask.subtasks || []).map((st, i) => (
            <div key={st.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--input-bg)",borderRadius:8,marginBottom:4,border:"1px solid var(--border-light)" }}>
              <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",fontWeight:600 }}>{i+1}.</span>
              <span style={{ flex:1,fontFamily:"var(--body)",fontSize:13,color:"var(--text)",textDecoration:st.done?"line-through":"none",opacity:st.done?0.5:1 }}>{st.text}</span>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>+{st.xp} XP</span>
              <div onClick={() => setEditingTask({ ...editingTask, subtasks: editingTask.subtasks.filter(s => s.id !== st.id) })} style={{ cursor:"pointer",color:"var(--muted)",display:"flex",alignItems:"center" }}
                onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
              ><X size={14} /></div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Reward (after completing)</label>
          <input value={editingTask.reward || ""} onChange={e => setEditingTask({ ...editingTask, reward: e.target.value })} placeholder="e.g. Coffee break, 15 min gaming..." style={inputStyle} />
        </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:10,borderTop:"1px solid var(--border-light)" }}>
          <Btn onClick={() => { setEditingTask(null); setEditSubtaskText(""); }}>Cancel</Btn>
          <Btn primary onClick={saveEditTask}>Save Changes</Btn>
        </div>
        </>)}
      </Modal>

      <Modal open={showNewNote} onClose={() => setShowNewNote(false)} title="Add Note">
        <textarea value={newNoteText} onChange={e => setNewNoteText(e.target.value)} placeholder="Write your thought..." style={{ ...inputStyle, minHeight:120, resize:"vertical" }} autoFocus />
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:14 }}>
          <Btn onClick={() => setShowNewNote(false)}>Cancel</Btn>
          <Btn primary onClick={addNote}>Save Note</Btn>
        </div>
      </Modal>

      <Modal open={showSearch} onClose={() => { setShowSearch(false); setSearchQuery(""); }} title="Search">
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tasks, notes, docs..." style={inputStyle} autoFocus />
        <div style={{ marginTop:14,maxHeight:300,overflow:"auto" }}>
          {searchQuery && filteredTasks.map(t => {
            const w = ws.find(x => x.id === t.wsId);
            return (
              <div key={t.id} onClick={() => { goTask(t.id); setShowSearch(false); setSearchQuery(""); }} style={{
                display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--subtle-bg)",cursor:"pointer",
              }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:pColors[t.priority] }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{t.title}</div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:w?.color }}>{getWsIcon(w?.icon, 10)} {w?.name}</div>
                </div>
              </div>
            );
          })}
          {searchQuery && filteredTasks.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",textAlign:"center",padding:20 }}>No results found</div>}
        </div>
      </Modal>

      <Modal open={showNewWs} onClose={() => setShowNewWs(false)} title="New Workspace">
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
          <input value={newWsName} onChange={e => setNewWsName(e.target.value)} placeholder="e.g. Research, Side Project..." style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:8 }}>Color</label>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {WS_COLOR_OPTIONS.map(c => (
              <div key={c} onClick={() => setNewWsColor(c)} style={{
                width:28,height:28,borderRadius:8,background:c,cursor:"pointer",
                border: newWsColor === c ? "2.5px solid var(--text)" : "2.5px solid transparent",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all 0.15s",transform: newWsColor === c ? "scale(1.15)" : "scale(1)",
              }}>{newWsColor === c && <Check size={14} color="#fff" />}</div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:8 }}>Icon</label>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {WS_ICON_OPTIONS.map(opt => {
              const IconComp = opt.component;
              return (
                <div key={opt.key} onClick={() => setNewWsIcon(opt.key)} style={{
                  width:36,height:36,borderRadius:8,cursor:"pointer",
                  background: newWsIcon === opt.key ? `${newWsColor}18` : "var(--hover-bg)",
                  border: newWsIcon === opt.key ? `2px solid ${newWsColor}` : "2px solid transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color: newWsIcon === opt.key ? newWsColor : "var(--muted)",
                  transition:"all 0.15s",
                }}><IconComp size={18} /></div>
              );
            })}
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:`${newWsColor}18`,display:"flex",alignItems:"center",justifyContent:"center",color:newWsColor }}>{getWsIcon(newWsIcon, 18)}</div>
            <span style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{newWsName || "Preview"}</span>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <Btn onClick={() => setShowNewWs(false)}>Cancel</Btn>
            <Btn primary onClick={createWorkspace}>Create Workspace</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={!!editingWsId} onClose={() => setEditingWsId(null)} title="Edit Workspace">
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
          <input value={editWsName} onChange={e => setEditWsName(e.target.value)} style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:8 }}>Color</label>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {WS_COLOR_OPTIONS.map(c => (
              <div key={c} onClick={() => setEditWsColor(c)} style={{
                width:28,height:28,borderRadius:8,background:c,cursor:"pointer",
                border: editWsColor === c ? "2.5px solid var(--text)" : "2.5px solid transparent",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all 0.15s",transform: editWsColor === c ? "scale(1.15)" : "scale(1)",
              }}>{editWsColor === c && <Check size={14} color="#fff" />}</div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:8 }}>Icon</label>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {WS_ICON_OPTIONS.map(opt => {
              const IconComp = opt.component;
              return (
                <div key={opt.key} onClick={() => setEditWsIcon(opt.key)} style={{
                  width:36,height:36,borderRadius:8,cursor:"pointer",
                  background: editWsIcon === opt.key ? `${editWsColor}18` : "var(--hover-bg)",
                  border: editWsIcon === opt.key ? `2px solid ${editWsColor}` : "2px solid transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color: editWsIcon === opt.key ? editWsColor : "var(--muted)",
                  transition:"all 0.15s",
                }}><IconComp size={18} /></div>
              );
            })}
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:`${editWsColor}18`,display:"flex",alignItems:"center",justifyContent:"center",color:editWsColor }}>{getWsIcon(editWsIcon, 18)}</div>
            <span style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{editWsName || "Preview"}</span>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <Btn onClick={() => setEditingWsId(null)}>Cancel</Btn>
            <Btn primary onClick={updateWorkspace}>Save</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={showNewProject} onClose={() => setShowNewProject(false)} title="New Project">
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
          <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="e.g. Website Redesign, Q2 Marketing..." style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:8 }}>Color</label>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {WS_COLOR_OPTIONS.map(c => (
              <div key={c} onClick={() => setNewProjectColor(c)} style={{
                width:28,height:28,borderRadius:8,background:c,cursor:"pointer",
                border: newProjectColor === c ? "2.5px solid var(--text)" : "2.5px solid transparent",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all 0.15s",transform: newProjectColor === c ? "scale(1.15)" : "scale(1)",
              }}>{newProjectColor === c && <Check size={14} color="#fff" />}</div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:8 }}>Icon</label>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {WS_ICON_OPTIONS.map(opt => {
              const IconComp = opt.component;
              return (
                <div key={opt.key} onClick={() => setNewProjectIcon(opt.key)} style={{
                  width:36,height:36,borderRadius:8,cursor:"pointer",
                  background: newProjectIcon === opt.key ? `${newProjectColor}18` : "var(--hover-bg)",
                  border: newProjectIcon === opt.key ? `2px solid ${newProjectColor}` : "2px solid transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color: newProjectIcon === opt.key ? newProjectColor : "var(--muted)",
                  transition:"all 0.15s",
                }}><IconComp size={18} /></div>
              );
            })}
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:`${newProjectColor}18`,display:"flex",alignItems:"center",justifyContent:"center",color:newProjectColor }}>{getWsIcon(newProjectIcon, 18)}</div>
            <span style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{newProjectName || "Preview"}</span>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <Btn onClick={() => setShowNewProject(false)}>Cancel</Btn>
            <Btn primary onClick={createProject}>Create Project</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={showWsNote} onClose={() => setShowWsNote(false)} title="New Note">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title (optional)</label>
          <input value={wsNoteTitle} onChange={e => setWsNoteTitle(e.target.value)} placeholder="Give your note a title..." style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Content</label>
          <textarea value={wsNoteText} onChange={e => setWsNoteText(e.target.value)} placeholder="Write your note..." style={{ ...inputStyle, minHeight:120, resize:"vertical" }} />
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowWsNote(false)}>Cancel</Btn>
          <Btn primary onClick={createWsNote}>Save Note</Btn>
        </div>
      </Modal>

      <Modal open={showWsDoc} onClose={() => setShowWsDoc(false)} title="Add Document">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>File Name</label>
          <input value={wsDocName} onChange={e => setWsDocName(e.target.value)} placeholder="e.g. research_notes.pdf" style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Type</label>
          <div style={{ display:"flex",gap:6 }}>
            {[{key:"doc",label:"Document"},{key:"pdf",label:"PDF"},{key:"code",label:"Code"},{key:"image",label:"Image"},{key:"other",label:"Other"}].map(t => (
              <div key={t.key} onClick={() => setWsDocType(t.key)} style={{
                flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                background: wsDocType === t.key ? `${activeWs?.color || "#5B8DEF"}18` : "var(--hover-bg)",
                border: wsDocType === t.key ? `2px solid ${activeWs?.color || "#5B8DEF"}` : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:11,fontWeight:600,
                color: wsDocType === t.key ? (activeWs?.color || "#5B8DEF") : "var(--muted)",
                transition:"all 0.15s",
              }}>{t.label}</div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowWsDoc(false)}>Cancel</Btn>
          <Btn primary onClick={createWsDoc}>Add Document</Btn>
        </div>
      </Modal>

      {/* ─── NEW FEATURE MODALS ─── */}

      <Modal open={showNewHabit} onClose={() => setShowNewHabit(false)} title="New Habit">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
          <input value={newHabitName} onChange={e => setNewHabitName(e.target.value)} placeholder="e.g. Meditate, Walk 10k steps..." style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Schedule</label>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {["daily","weekdays","weekends","custom"].map(f => (
              <div key={f} onClick={() => { setNewHabitFreq(f); if (f !== "custom") setNewHabitDays(daysForFrequency(f)); }} style={{
                flex:"1 0 auto",padding:"8px 12px",textAlign:"center",borderRadius:10,cursor:"pointer",
                background: newHabitFreq === f ? "rgba(34,197,94,0.1)" : "var(--hover-bg)",
                border: newHabitFreq === f ? "2px solid #22C55E" : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:12,fontWeight:600,color:newHabitFreq===f?"#22C55E":"var(--muted)",
                textTransform:"capitalize",transition:"all 0.15s",
              }}>{f}</div>
            ))}
          </div>
        </div>
        {newHabitFreq === "custom" && (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Pick days</label>
            <div style={{ display:"flex",gap:6 }}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => {
                const active = newHabitDays.includes(i);
                return (
                  <div key={d} onClick={() => setNewHabitDays(prev => active ? prev.filter(x => x !== i) : [...prev, i].sort((a,b)=>a-b))} style={{
                    flex:1,padding:"8px 0",textAlign:"center",borderRadius:8,cursor:"pointer",
                    background: active ? "rgba(34,197,94,0.15)" : "var(--hover-bg)",
                    border: active ? "2px solid #22C55E" : "2px solid transparent",
                    fontFamily:"var(--mono)",fontSize:11,fontWeight:600,color: active ? "#22C55E" : "var(--muted)",
                    transition:"all 0.15s",
                  }}>{d}</div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:8 }}>Color</label>
          <div style={{ display:"flex",gap:8 }}>
            {WS_COLOR_OPTIONS.map(c => (
              <div key={c} onClick={() => setNewHabitColor(c)} style={{
                width:28,height:28,borderRadius:8,background:c,cursor:"pointer",
                border: newHabitColor === c ? "2.5px solid var(--text)" : "2.5px solid transparent",
                transition:"all 0.15s",transform: newHabitColor === c ? "scale(1.15)" : "scale(1)",
              }} />
            ))}
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewHabit(false)}>Cancel</Btn>
          <Btn primary onClick={createHabit}>Create Habit</Btn>
        </div>
      </Modal>

      <Modal open={showNewBlock} onClose={() => setShowNewBlock(false)} title="Add Time Block">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
          <input value={newBlockTitle} onChange={e => setNewBlockTitle(e.target.value)} placeholder="What are you blocking time for?" style={inputStyle} autoFocus />
        </div>
        <div style={{ display:"flex",gap:14,marginBottom:20 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Start Hour</label>
            <input type="number" min="6" max="21" value={newBlockStart} onChange={e => setNewBlockStart(parseInt(e.target.value))} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>End Hour</label>
            <input type="number" min="7" max="22" value={newBlockEnd} onChange={e => setNewBlockEnd(parseInt(e.target.value))} style={inputStyle} />
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewBlock(false)}>Cancel</Btn>
          <Btn primary onClick={createTimeBlock}>Add Block</Btn>
        </div>
      </Modal>

      <Modal open={showNewWiki} onClose={() => setShowNewWiki(false)} title="New Article">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
          <input value={newWikiTitle} onChange={e => setNewWikiTitle(e.target.value)} placeholder="Article title" style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Category</label>
          <input value={newWikiCategory} onChange={e => setNewWikiCategory(e.target.value)} placeholder="e.g. Teaching, Engineering..." style={inputStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Content</label>
          <textarea value={newWikiContent} onChange={e => setNewWikiContent(e.target.value)} placeholder="Write your article..." style={{ ...inputStyle, minHeight:160, resize:"vertical",fontFamily:"var(--mono)",fontSize:13 }} />
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewWiki(false)}>Cancel</Btn>
          <Btn primary onClick={createWikiArticle}>Create Article</Btn>
        </div>
      </Modal>

      {/* ─── FINANCE MODAL ─── */}
      <Modal open={showNewTransaction} onClose={() => setShowNewTransaction(false)} title="Add Transaction">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Type</label>
          <div style={{ display:"flex",gap:6 }}>
            {["expense","income"].map(t => (
              <div key={t} onClick={() => { setNewTxType(t); setNewTxCategory(t === "income" ? "salary" : "food"); }} style={{
                flex:1,padding:"10px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                background: newTxType === t ? (t === "income" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)") : "var(--hover-bg)",
                border: newTxType === t ? `2px solid ${t === "income" ? "#22C55E" : "#EF4444"}` : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:12,fontWeight:600,color:newTxType===t?(t==="income"?"#22C55E":"#EF4444"):"var(--muted)",
                transition:"all 0.15s",textTransform:"capitalize",
              }}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Category</label>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            {getCategories()[newTxType].map(cat => (
              <div key={cat.id} onClick={() => setNewTxCategory(cat.id)} style={{
                padding:"6px 12px",borderRadius:8,cursor:"pointer",
                background:newTxCategory===cat.id?`${cat.color}18`:"var(--hover-bg)",
                border:newTxCategory===cat.id?`2px solid ${cat.color}`:"2px solid transparent",
                fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newTxCategory===cat.id?cat.color:"var(--muted)",
                transition:"all 0.15s",
              }}>{cat.label}</div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Amount ($)</label>
          <input value={newTxAmount} onChange={e => setNewTxAmount(e.target.value)} placeholder="0.00" type="number" step="0.01" style={inputStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Description</label>
          <input value={newTxDesc} onChange={e => setNewTxDesc(e.target.value)} placeholder="What was this for?" style={inputStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Date</label>
          <input value={newTxDate} onChange={e => setNewTxDate(e.target.value)} type="date" style={inputStyle} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label onClick={() => setNewTxRecurring(!newTxRecurring)} style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600 }}>
            <div style={{ width:18,height:18,borderRadius:5,border:newTxRecurring?"none":"2px solid var(--checkbox-border)",background:newTxRecurring?"#5B8DEF":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
              {newTxRecurring && <Check size={12} color="#fff"/>}
            </div>
            Recurring (monthly)
          </label>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewTransaction(false)}>Cancel</Btn>
          <Btn primary onClick={addTransaction}>Add Transaction</Btn>
        </div>
      </Modal>

      {/* ─── EDIT MODALS ─── */}
      <Modal open={!!editingBlock} onClose={() => setEditingBlock(null)} title="Edit Time Block">
        {editingBlock && (() => {
          const set = (k, v) => setEditingBlock(b => ({ ...b, [k]: v }));
          const timeOptions = [];
          for (let h = 6; h <= 22; h++) {
            for (let m = 0; m < 60; m += 15) {
              if (h === 22 && m > 0) break;
              const val = h + m / 60;
              const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
              const ampm = h >= 12 ? "PM" : "AM";
              const label = `${hr}:${m.toString().padStart(2,"0")} ${ampm}`;
              timeOptions.push({ val, label });
            }
          }
          return <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
              <input value={editingBlock.title} onChange={e => set("title", e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ display:"flex",gap:14,marginBottom:20 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Start Time</label>
                <select value={editingBlock.startHour} onChange={e => set("startHour", parseFloat(e.target.value))} style={inputStyle}>
                  {timeOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>End Time</label>
                <select value={editingBlock.endHour} onChange={e => set("endHour", parseFloat(e.target.value))} style={inputStyle}>
                  {timeOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <Btn onClick={() => setEditingBlock(null)}>Cancel</Btn>
              <Btn primary onClick={() => updateTimeBlock(editingBlock.id, { title: editingBlock.title, startHour: editingBlock.startHour, endHour: editingBlock.endHour })}>Save</Btn>
            </div>
          </>;
        })()}
      </Modal>

      <Modal open={!!editingHabit} onClose={() => setEditingHabit(null)} title="Edit Habit">
        {editingHabit && (() => {
          const set = (k, v) => setEditingHabit(h => ({ ...h, [k]: v }));
          const editDays = editingHabit.scheduleDays || daysForFrequency(editingHabit.frequency);
          return <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
              <input value={editingHabit.name} onChange={e => set("name", e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Schedule</label>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {["daily","weekdays","weekends","custom"].map(f => (
                  <div key={f} onClick={() => { set("frequency", f); if (f !== "custom") set("scheduleDays", daysForFrequency(f)); }} style={{
                    flex:"1 0 auto",padding:"8px 12px",textAlign:"center",borderRadius:10,cursor:"pointer",
                    background: editingHabit.frequency === f ? "rgba(34,197,94,0.1)" : "var(--hover-bg)",
                    border: editingHabit.frequency === f ? "2px solid #22C55E" : "2px solid transparent",
                    fontFamily:"var(--body)",fontSize:12,fontWeight:600,color:editingHabit.frequency===f?"#22C55E":"var(--muted)",
                    textTransform:"capitalize",transition:"all 0.15s",
                  }}>{f}</div>
                ))}
              </div>
            </div>
            {editingHabit.frequency === "custom" && (
              <div style={{ marginBottom:14 }}>
                <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Pick days</label>
                <div style={{ display:"flex",gap:6 }}>
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => {
                    const active = editDays.includes(i);
                    return (
                      <div key={d} onClick={() => set("scheduleDays", active ? editDays.filter(x => x !== i) : [...editDays, i].sort((a,b)=>a-b))} style={{
                        flex:1,padding:"8px 0",textAlign:"center",borderRadius:8,cursor:"pointer",
                        background: active ? "rgba(34,197,94,0.15)" : "var(--hover-bg)",
                        border: active ? "2px solid #22C55E" : "2px solid transparent",
                        fontFamily:"var(--mono)",fontSize:11,fontWeight:600,color: active ? "#22C55E" : "var(--muted)",
                        transition:"all 0.15s",
                      }}>{d}</div>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:8 }}>Color</label>
              <div style={{ display:"flex",gap:8 }}>
                {WS_COLOR_OPTIONS.map(c => (
                  <div key={c} onClick={() => set("color", c)} style={{
                    width:28,height:28,borderRadius:8,background:c,cursor:"pointer",
                    border: editingHabit.color === c ? "2.5px solid var(--text)" : "2.5px solid transparent",
                    transition:"all 0.15s",transform: editingHabit.color === c ? "scale(1.15)" : "scale(1)",
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <Btn onClick={() => setEditingHabit(null)}>Cancel</Btn>
              <Btn primary onClick={() => updateHabit(editingHabit.id, { name: editingHabit.name, frequency: editingHabit.frequency, scheduleDays: editingHabit.scheduleDays || daysForFrequency(editingHabit.frequency), color: editingHabit.color })}>Save</Btn>
            </div>
          </>;
        })()}
      </Modal>

      <Modal open={!!editingTransaction} onClose={() => setEditingTransaction(null)} title="Edit Transaction">
        {editingTransaction && (() => {
          const set = (k, v) => setEditingTransaction(t => ({ ...t, [k]: v }));
          const cats = getCategories()[editingTransaction.type] || getCategories().expense;
          return <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Description</label>
              <input value={editingTransaction.description} onChange={e => set("description", e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Amount</label>
              <input type="number" step="0.01" value={editingTransaction.amount} onChange={e => set("amount", parseFloat(e.target.value) || 0)} style={inputStyle} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Category</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {cats.map(cat => (
                  <div key={cat.id} onClick={() => set("category", cat.id)} style={{
                    padding:"6px 12px",borderRadius:8,cursor:"pointer",
                    background:editingTransaction.category===cat.id?`${cat.color}18`:"var(--hover-bg)",
                    border:editingTransaction.category===cat.id?`2px solid ${cat.color}`:"2px solid transparent",
                    fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:editingTransaction.category===cat.id?cat.color:"var(--muted)",
                    transition:"all 0.15s",
                  }}>{cat.label}</div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Date</label>
              <input type="date" value={editingTransaction.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <Btn onClick={() => setEditingTransaction(null)}>Cancel</Btn>
              <Btn primary onClick={() => updateTransaction(editingTransaction.id, { description: editingTransaction.description, amount: editingTransaction.amount, category: editingTransaction.category, date: editingTransaction.date, recurring: editingTransaction.recurring })}>Save</Btn>
            </div>
          </>;
        })()}
      </Modal>

      <Modal open={!!editingBill} onClose={() => setEditingBill(null)} title="Edit Bill">
        {editingBill && (() => {
          const set = (k, v) => setEditingBill(b => ({ ...b, [k]: v }));
          const dueDays = editingBill.dueDays || [editingBill.dueDay || 1];
          const editCats = getCategories().expense;
          return <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
              <input value={editingBill.name} onChange={e => set("name", e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Amount</label>
              <input type="number" step="0.01" value={editingBill.amount} onChange={e => set("amount", parseFloat(e.target.value) || 0)} style={inputStyle} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Category</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {editCats.map(cat => (
                  <div key={cat.id} onClick={() => set("category", cat.id)} style={{
                    padding:"6px 12px",borderRadius:8,cursor:"pointer",
                    background:editingBill.category===cat.id?`${cat.color}18`:"var(--hover-bg)",
                    border:editingBill.category===cat.id?`2px solid ${cat.color}`:"2px solid transparent",
                    fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:editingBill.category===cat.id?cat.color:"var(--muted)",
                    transition:"all 0.15s",
                  }}>{cat.label}</div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Due Days (of month)</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:8 }}>
                {dueDays.map((day, idx) => (
                  <div key={idx} style={{ display:"flex",alignItems:"center",gap:4,background:"var(--subtle-bg)",borderRadius:8,padding:"4px 8px" }}>
                    <input type="number" min="1" max="31" value={day} onChange={e => {
                      const newDays = [...dueDays]; newDays[idx] = parseInt(e.target.value) || 1;
                      set("dueDays", newDays); set("dueDay", newDays[0]);
                    }} style={{ width:50,padding:"4px 6px",borderRadius:6,border:"1px solid var(--border)",fontFamily:"var(--mono)",fontSize:12,outline:"none",background:"transparent",color:"var(--text)",textAlign:"center" }} />
                    {dueDays.length > 1 && <div onClick={() => { const newDays = dueDays.filter((_,i) => i !== idx); set("dueDays", newDays); set("dueDay", newDays[0]); }} style={{ cursor:"pointer",color:"var(--muted)",fontSize:12 }}><X size={12}/></div>}
                  </div>
                ))}
                <div onClick={() => { set("dueDays", [...dueDays, 15]); }} style={{
                  display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,
                  border:"2px dashed var(--border)",cursor:"pointer",color:"var(--muted)",fontSize:14,
                }} title="Add another due date">+</div>
              </div>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <Btn onClick={() => setEditingBill(null)}>Cancel</Btn>
              <Btn primary onClick={() => updateBill(editingBill.id, { name: editingBill.name, amount: editingBill.amount, dueDay: dueDays[0], dueDays, category: editingBill.category })}>Save</Btn>
            </div>
          </>;
        })()}
      </Modal>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}
