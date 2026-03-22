import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Home, ClipboardList, Timer, Trophy,
  Flame, Gift, Check,
  Search, Clock, CheckCircle2, ArrowLeft, Plus, X,
  Users, UserPlus, Mail, Phone, MessageSquare, MapPin,
  RefreshCw, Inbox, Trash2, ChevronRight, Menu,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import {
  THEMES, WS_ICON_OPTIONS, WS_COLOR_OPTIONS, getWsIcon,
  FINANCE_CATEGORIES,
  INIT_WORKSPACES, INIT_TASKS, INIT_TIME_BLOCKS,
} from "./lib/constants";
import { Glass, Btn, Modal, Toast } from "./components/ui";
import { getUserId } from "./lib/getUserId";
import { useFlash } from "./hooks/useFlash";
import { useBookmarks } from "./hooks/useBookmarks";
import { useHabits } from "./hooks/useHabits";
import { useInbox } from "./hooks/useInbox";
import { useWiki } from "./hooks/useWiki";
import { useGoals } from "./hooks/useGoals";
import { useContacts } from "./hooks/useContacts";
import { useTemplates } from "./hooks/useTemplates";
import { useFinance } from "./hooks/useFinance";
import Sidebar from "./components/Sidebar";
import RewardsPage from "./components/pages/RewardsPage";
import AllTasksPage from "./components/pages/AllTasksPage";
import BookmarksPage from "./components/pages/BookmarksPage";
import TemplatesPage from "./components/pages/TemplatesPage";
import InboxPage from "./components/pages/InboxPage";
import ContactsPage from "./components/pages/ContactsPage";
import ContactDetailPage from "./components/pages/ContactDetailPage";
import HabitsPage from "./components/pages/HabitsPage";
import GoalsPage from "./components/pages/GoalsPage";
import WikiPage from "./components/pages/WikiPage";
import WikiArticlePage from "./components/pages/WikiArticlePage";
import CalendarPage from "./components/pages/CalendarPage";
import ReviewPage from "./components/pages/ReviewPage";
import ScratchpadPage from "./components/pages/ScratchpadPage";
import FinancePage from "./components/pages/FinancePage";
import SettingsPage from "./components/pages/SettingsPage";
import TimerPage from "./components/pages/TimerPage";
import TodayPage from "./components/pages/TodayPage";
import WorkspacePage from "./components/pages/WorkspacePage";
import TaskDetailPage from "./components/pages/TaskDetailPage";




// ═══════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("today");
  const [activeWsId, setActiveWsId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [wsTab, setWsTab] = useState("Tasks");
  const [collapsed, setCollapsed] = useState(false);
  const [themeName, setThemeName] = useState(() => localStorage.getItem("osvitae-theme") || "default");
  const theme = THEMES[themeName] || THEMES.default;
  const toggleTheme = () => {
    const next = themeName === "default" ? "halo" : "default";
    setThemeName(next);
    localStorage.setItem("osvitae-theme", next);
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
  const [newNoteText, setNewNoteText] = useState("");
  const { toast, flash } = useFlash();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [intentionText, setIntentionText] = useState("");
  const [editingIntention, setEditingIntention] = useState(false);
  const [workspaces, setWorkspaces] = useState(INIT_WORKSPACES);
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsColor, setNewWsColor] = useState(WS_COLOR_OPTIONS[0]);
  const [newWsIcon, setNewWsIcon] = useState("Folder");
  const [wsNotes, setWsNotes] = useState([]);
  const [wsDocs, setWsDocs] = useState([]);
  const [showWsNote, setShowWsNote] = useState(false);
  const [wsNoteText, setWsNoteText] = useState("");
  const [wsNoteTitle, setWsNoteTitle] = useState("");
  const [showWsDoc, setShowWsDoc] = useState(false);
  const [wsDocName, setWsDocName] = useState("");
  const [wsDocType, setWsDocType] = useState("doc");

  // ─── APPLE CALENDAR STATE ───
  const [appleConnected, setAppleConnected] = useState(false);
  const [appleIdInput, setAppleIdInput] = useState("");
  const [appleAppPassword, setAppleAppPassword] = useState("");
  const [appleCalendars, setAppleCalendars] = useState([]);
  const [appleReminderLists, setAppleReminderLists] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState("");
  const [selectedRemindersId, setSelectedRemindersId] = useState("");
  const [syncStatus, setSyncStatus] = useState("idle");
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [showAppleConnect, setShowAppleConnect] = useState(false);
  const [appleConnecting, setAppleConnecting] = useState(false);

  // ─── PROFILE STATE ───
  const [profileData, setProfileData] = useState({
    full_name: "", date_of_birth: "", phone: "", email: "",
    address_line1: "", address_line2: "", city: "", state: "", zip: "", country: "",
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // ─── NEW FEATURE STATE ───
  // Contacts
  // Contacts
  const {
    contacts, setContacts, activeContactId, setActiveContactId,
    showNewContact, setShowNewContact,
    newContactName, setNewContactName,
    newContactEmail, setNewContactEmail,
    newContactContext, setNewContactContext,
    showNewInteraction, setShowNewInteraction,
    newInteractionText, setNewInteractionText,
    newInteractionType, setNewInteractionType,
    editingContact, setEditingContact,
    createContact, updateContact, addInteraction, deleteContact: deleteContactHook,
  } = useContacts(flash);

  // Habits
  const {
    habits, setHabits, showNewHabit, setShowNewHabit,
    newHabitName, setNewHabitName, newHabitFreq, setNewHabitFreq,
    newHabitColor, setNewHabitColor,
    editingHabit, setEditingHabit,
    toggleHabit, createHabit, updateHabit, deleteHabit,
  } = useHabits(flash, addXp);

  // Goals
  const {
    goals, setGoals, showNewGoal, setShowNewGoal,
    newGoalTitle, setNewGoalTitle, expandedGoals, setExpandedGoals,
    editingGoal, setEditingGoal,
    createGoal, updateGoal, deleteGoal,
  } = useGoals(flash);

  // Calendar
  const [timeBlocks, setTimeBlocks] = useState(INIT_TIME_BLOCKS);
  const [showNewBlock, setShowNewBlock] = useState(false);
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [newBlockStart, setNewBlockStart] = useState(9);
  const [newBlockEnd, setNewBlockEnd] = useState(10);
  const [editingBlock, setEditingBlock] = useState(null);

  // Bookmarks
  const {
    bookmarks, setBookmarks, showNewBookmark, setShowNewBookmark,
    newBmTitle, setNewBmTitle, newBmUrl, setNewBmUrl,
    newBmDesc, setNewBmDesc, newBmWs, setNewBmWs,
    editingBookmark, setEditingBookmark,
    createBookmark, updateBookmark, deleteBookmark,
  } = useBookmarks(flash);

  // Inbox
  const {
    inbox, setInbox, newInboxText, setNewInboxText,
    editingInboxItem, setEditingInboxItem,
    addInboxItem, updateInboxItem, triageInbox, dismissInbox,
  } = useInbox(flash);

  // Templates
  const {
    templates, setTemplates, showNewTemplate, setShowNewTemplate,
    newTemplateName, setNewTemplateName,
    newTemplateCategory, setNewTemplateCategory,
    newTemplateItems, setNewTemplateItems,
    createTemplate, useTemplate, deleteTemplate,
  } = useTemplates(flash, setTasks);

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
  } = useFinance(flash);

  // Scratchpad (Apple Pencil canvas)
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#111827");
  const [penSize, setPenSize] = useState(3);
  const [eraserMode, setEraserMode] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const lastPoint = useRef(null);



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
    if (newDone) { addXp(25); setTotalTasksDone(d => d + 1); flash("Task complete! +25 XP"); }
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: newDone } : t));
    const { error } = await supabase.from("tasks").update({ done: newDone }).eq("id", id);
    if (error) {
      console.error("Failed to update task:", error);
      setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !newDone } : t));
      flash("Update failed — please try again.");
      return;
    }
    if (task.externalId) {
      supabase.functions.invoke("caldav-item", {
        body: { action: "update-todo", href: task.caldav_href, uid: task.externalId,
          title: task.title, done: newDone, priority: task.priority,
          description: task.description, etag: task.caldav_etag },
      }).catch(e => console.warn("CalDAV sync skipped:", e.message));
    }
  };

  const deleteTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    setTasks(ts => ts.filter(t => t.id !== id));
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete task:", error);
      if (task) setTasks(ts => [...ts, task]);
      flash("Delete failed — please try again.");
      return;
    }
    if (task?.caldav_href) {
      supabase.functions.invoke("caldav-item", {
        body: { action: "delete", href: task.caldav_href, etag: task.caldav_etag },
      }).catch(e => console.warn("CalDAV delete skipped:", e.message));
    }
    flash("Task deleted.");
  };

  const saveEditTask = async () => {
    if (!editingTask) return;
    setTasks(ts => ts.map(t => t.id === editingTask.id ? {
      ...t, title: editingTask.title, desc: editingTask.desc,
      description: editingTask.desc, priority: editingTask.priority,
      dueDate: editingTask.dueDate, dueTime: editingTask.dueTime,
    } : t));
    const { error } = await supabase.from("tasks").update({
      title: editingTask.title, description: editingTask.desc,
      priority: editingTask.priority, due_date: editingTask.dueDate || null,
      due_time: editingTask.dueTime || null,
    }).eq("id", editingTask.id);
    if (error) console.error("Failed to update task:", error);
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
    if (error) console.error("Failed to update subtask:", error);
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;
    const id = crypto.randomUUID();
    const title = newTaskTitle, desc = newTaskDesc, priority = newTaskPriority, wsId = newTaskWs;
    const newTask = {
      id, title, desc, priority,
      wsId, dueTime: null, dueDate: null, done: false, section: "afternoon",
      subtasks: [], notes: [], attachments: [], totalPomos: 2, donePomos: 0, reward: null,
    };
    setTasks(ts => [...ts, newTask]);
    setNewTaskTitle(""); setNewTaskDesc(""); setShowNewTask(false);
    flash("Task created!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("tasks").insert({
      id, user_id: userId, title, description: desc,
      priority, done: false, section: "afternoon",
      workspace_id: wsId || null,
    });
    if (error) {
      console.error("Failed to save task:", error);
      setTasks(ts => ts.filter(t => t.id !== id));
      flash("Failed to save task — please try again.");
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
      console.error("Failed to save note:", error);
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
    if (!newWsName.trim()) return;
    const id = crypto.randomUUID();
    const name = newWsName, icon = newWsIcon, color = newWsColor, pos = workspaces.length;
    setWorkspaces(prev => [...prev, { id, name, icon, color }]);
    setNewWsName(""); setNewWsColor(WS_COLOR_OPTIONS[0]); setNewWsIcon("Folder"); setShowNewWs(false);
    flash("Workspace created!");
    goWs(id);
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("workspaces").insert({ id, user_id: userId, name, icon, color, position: pos });
    if (error) {
      console.error("Failed to save workspace:", error);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      flash("Failed to save workspace.");
    }
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
      console.error("Failed to save note:", error);
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
      console.error("Failed to save doc:", error);
      setWsDocs(prev => prev.filter(d => d.id !== did));
      flash("Failed to save document.");
    }
  };

  // ─── NAVIGATION-AWARE DELETE WRAPPERS ───
  const deleteContact = async (id) => {
    const wasActive = await deleteContactHook(id);
    if (wasActive) setPage("contacts");
  };
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
      console.error("Failed to save time block:", error);
      setTimeBlocks(prev => prev.filter(b => b.id !== id));
      flash("Failed to save time block.");
    } else {
      syncAll();
    }
  };

  // ─── DELETE HELPERS ───

  const deleteWsNote = async (id) => {
    const note = wsNotes.find(n => n.id === id);
    setWsNotes(prev => prev.filter(n => n.id !== id));
    flash("Note deleted.");
    const { error } = await supabase.from("workspace_notes").delete().eq("id", id);
    if (error) { console.error("Failed to delete note:", error); if (note) setWsNotes(prev => [...prev, note]); flash("Delete failed."); }
  };

  const deleteWsDoc = async (id) => {
    const doc = wsDocs.find(d => d.id === id);
    setWsDocs(prev => prev.filter(d => d.id !== id));
    flash("Document deleted.");
    const { error } = await supabase.from("workspace_docs").delete().eq("id", id);
    if (error) { console.error("Failed to delete doc:", error); if (doc) setWsDocs(prev => [...prev, doc]); flash("Delete failed."); }
  };

  const deleteWorkspace = async (id) => {
    const ws = workspaces.find(w => w.id === id);
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    if (activeWsId === id) setPage("today");
    flash("Workspace deleted.");
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) { console.error("Failed to delete workspace:", error); if (ws) setWorkspaces(prev => [...prev, ws]); flash("Delete failed."); }
  };

  const deleteTaskNote = async (taskId, noteId) => {
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, notes: t.notes.filter(n => n.id !== noteId) } : t));
    flash("Note deleted.");
    const { error } = await supabase.from("task_notes").delete().eq("id", noteId);
    if (error) console.error("Failed to delete note:", error);
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
      console.error("Failed to update time block:", error);
      if (prev) setTimeBlocks(bs => bs.map(b => b.id === id ? prev : b));
      flash("Update failed.");
    }
  };

  const deleteTimeBlock = (id) => {
    setTimeBlocks(prev => prev.filter(b => b.id !== id));
    supabase.from("time_blocks").delete().eq("id", id);
    flash("Time block deleted.");
  };

  // ─── SCRATCHPAD (Apple Pencil) HELPERS ───

  const saveCanvasSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapshot = canvas.toDataURL();
    setCanvasHistory(prev => [...prev.slice(-30), snapshot]);
  }, []);

  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure || 0.5,
    };
  }, []);

  const handleCanvasPointerDown = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    saveCanvasSnapshot();
    const pt = getCanvasPoint(e);
    lastPoint.current = pt;
    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (eraserMode) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = penSize * 6;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = Math.max(1, penSize * (0.5 + pt.pressure));
    }
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    // Draw a dot for taps
    ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
    ctx.stroke();
  }, [eraserMode, penColor, penSize, getCanvasPoint, saveCanvasSnapshot]);

  const handleCanvasPointerMove = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt = getCanvasPoint(e);
    const ctx = canvas.getContext("2d");
    if (eraserMode) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = penSize * 6;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = Math.max(1, penSize * (0.5 + pt.pressure));
    }
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPoint.current = pt;
  }, [isDrawing, eraserMode, penColor, penSize, getCanvasPoint]);

  const handleCanvasPointerUp = useCallback((e) => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const undoCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasHistory.length === 0) return;
    const prev = canvasHistory[canvasHistory.length - 1];
    setCanvasHistory(h => h.slice(0, -1));
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prev;
  }, [canvasHistory]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveCanvasSnapshot();
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flash("Canvas cleared");
  }, [saveCanvasSnapshot]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `scratchpad-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    flash("Image saved!");
  }, []);

  // Computed
  const ws = workspaces;
  const activeWs = ws.find(w => w.id === activeWsId);
  const activeTask = tasks.find(t => t.id === activeTaskId);
  const timerTask = tasks.find(t => t.id === timerTaskId);
  const doneTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const donePomos = tasks.reduce((s, t) => s + t.donePomos, 0);
  const totalPomos = tasks.reduce((s, t) => s + t.totalPomos, 0);
  const pColors = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E" };
  const hour = new Date().getHours();
  const firstName = profileData.full_name ? profileData.full_name.split(" ")[0] : "";
  const greeting = (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening") + (firstName ? `, ${firstName}` : "");
  const activeContact = contacts.find(c => c.id === activeContactId);
  const activeWiki = wiki.find(a => a.id === activeWikiId);

  const filteredTasks = searchQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.desc || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  // Navigate helpers
  const goTask = (id) => { setActiveTaskId(id); setPage("task"); setShowMobileSidebar(false); };
  const goWs = (id) => { setActiveWsId(id); setWsTab("Tasks"); setPage("workspace"); setShowMobileSidebar(false); };
  const goToday = () => { setPage("today"); setShowMobileSidebar(false); };
  const goContact = (id) => { setActiveContactId(id); setPage("contactDetail"); };
  const goWiki = (id) => { setActiveWikiId(id); setEditingWiki(false); setPage("wikiArticle"); };

  // ─── INPUT STYLE ───
  const inputStyle = {
    width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid var(--border)",
    background:"var(--input-bg)", fontFamily:"var(--body)", fontSize:13, color:"var(--text)",
    outline:"none", transition:"border 0.2s",
  };

  const healthColors = { strong: "#22C55E", "needs-attention": "#F59E0B", fading: "#EF4444" };
  const healthLabels = { strong: "Strong", "needs-attention": "Needs attention", fading: "Fading" };
  const goalStatusColors = { "in-progress": "#5B8DEF", "on-track": "#22C55E", "at-risk": "#EF4444", "completed": "#A78BFA" };

  // ─── TASK ROW (reused in today & workspace & allTasks) ───
  const TaskRow = ({ task, idx, showWs = true }) => {
    const w = ws.find(x => x.id === task.wsId);
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
          <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",marginTop:2 }}>{task.desc}</div>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:6,flexWrap:"wrap" }}>
            {showWs && <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:`${w?.color}14`,padding:"2px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:w?.color,fontWeight:600 }}>{getWsIcon(w?.icon, 10)} {w?.name}</span>}
            {task.subtasks.length > 0 && <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}><CheckCircle2 size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} /> {subDone}/{task.subtasks.length}</span>}
            <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}><Timer size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} /> {task.donePomos}/{task.totalPomos}</span>
            {task.dueTime && <span style={{ fontFamily:"var(--mono)",fontSize:10,fontWeight:600,color:task.priority==="high"?"var(--danger)":"var(--muted)",background:task.priority==="high"?"rgba(239,68,68,0.08)":"var(--subtle-bg)",padding:"2px 8px",borderRadius:8 }}><Clock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} /> {task.dueTime}</span>}
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
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, date_of_birth, phone, email, address_line1, address_line2, city, state, zip, country")
        .single();
      if (error) return;
      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          date_of_birth: data.date_of_birth || "",
          phone: data.phone || "",
          email: data.email || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          country: data.country || "",
        });
        setProfileLoaded(true);
      }
    } catch (e) { console.error("Failed to load profile:", e); }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name || null,
          date_of_birth: profileData.date_of_birth || null,
          phone: profileData.phone || null,
          email: profileData.email || null,
          address_line1: profileData.address_line1 || null,
          address_line2: profileData.address_line2 || null,
          city: profileData.city || null,
          state: profileData.state || null,
          zip: profileData.zip || null,
          country: profileData.country || null,
        })
        .eq("id", await getUserId());
      if (error) throw error;
      flash("Profile saved!");
    } catch (e) {
      console.error("Failed to save profile:", e);
      flash("Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // ─── APPLE CALENDAR FUNCTIONS ───

  const fetchAppleStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("apple-credentials", {
        body: { action: "status" },
      });
      if (error) return;
      if (data?.connected) {
        setAppleConnected(true);
        setLastSyncAt(data.last_sync_at);
        setSelectedCalendarId(data.selected_calendar_id || "");
        setSelectedRemindersId(data.selected_reminders_id || "");
      }
    } catch (_e) { /* not connected */ }
  };

  const connectApple = async () => {
    if (!appleIdInput.trim() || !appleAppPassword.trim()) return;
    setAppleConnecting(true);
    setSyncError(null);
    try {
      const { data, error } = await supabase.functions.invoke("apple-credentials", {
        body: { action: "connect", apple_id: appleIdInput, app_password: appleAppPassword },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setAppleConnected(true);
      setAppleCalendars(data.calendars || []);
      setAppleReminderLists(data.reminderLists || []);
      setShowAppleConnect(false);
      setAppleIdInput("");
      setAppleAppPassword("");
      flash("Apple Calendar connected!");
    } catch (e) {
      setSyncError(e.message);
    } finally {
      setAppleConnecting(false);
    }
  };

  const disconnectApple = async () => {
    await supabase.functions.invoke("apple-credentials", {
      body: { action: "disconnect" },
    });
    setAppleConnected(false);
    setAppleCalendars([]);
    setAppleReminderLists([]);
    setSelectedCalendarId("");
    setSelectedRemindersId("");
    setLastSyncAt(null);
    flash("Apple Calendar disconnected.");
  };

  const saveCalendarSelection = async () => {
    await supabase.functions.invoke("apple-credentials", {
      body: { action: "update", selected_calendar_id: selectedCalendarId },
    });
    flash("Calendar selection saved!");
  };

  const rediscoverCalendars = async () => {
    setSyncError(null);
    try {
      const { data, error } = await supabase.functions.invoke("caldav-discover", {
        body: {},
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setAppleCalendars(data.calendars || []);
      setAppleReminderLists(data.reminderLists || []);
    } catch (e) {
      setSyncError("Load calendars failed: " + e.message);
    }
  };

  const loadFromSupabase = async () => {
    const userId = await getUserId();
    if (!userId) return;

    // Load all data in parallel
    const [
      { data: dbBlocks }, { data: dbWorkspaces }, { data: dbTasks },
      { data: dbSubtasks }, { data: dbTaskNotes },
      { data: dbContacts }, { data: dbInteractions },
      { data: dbHabits }, { data: dbCompletions },
      { data: dbGoals },
      { data: dbBookmarks },
      { data: dbInbox }, { data: dbTemplates }, { data: dbWiki },
      { data: dbWsNotes }, { data: dbWsDocs },
      { data: dbTransactions }, { data: dbBills }, { data: dbBillPayments }, { data: dbBudgets },
      { data: dbProfile },
    ] = await Promise.all([
      supabase.from("time_blocks").select("*").eq("user_id", userId),
      supabase.from("workspaces").select("*").eq("user_id", userId).order("position"),
      supabase.from("tasks").select("*").eq("user_id", userId),
      supabase.from("subtasks").select("*").eq("user_id", userId),
      supabase.from("task_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("contacts").select("*").eq("user_id", userId),
      supabase.from("contact_interactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("habits").select("*").eq("user_id", userId),
      supabase.from("habit_completions").select("*").eq("user_id", userId),
      supabase.from("goals").select("*").eq("user_id", userId),
      supabase.from("bookmarks").select("*").eq("user_id", userId),
      supabase.from("inbox_items").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("templates").select("*").eq("user_id", userId),
      supabase.from("wiki_articles").select("*").eq("user_id", userId),
      supabase.from("workspace_notes").select("*").eq("user_id", userId),
      supabase.from("workspace_docs").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("bills").select("*").eq("user_id", userId),
      supabase.from("bill_payments").select("*").eq("user_id", userId),
      supabase.from("budgets").select("*").eq("user_id", userId),
      supabase.from("profiles").select("intention_text, xp, level, streak, total_pomos_ever, total_tasks_done").eq("id", userId).single(),
    ]);

    if (dbBlocks) {
      setTimeBlocks(dbBlocks.map(b => ({
        id: b.id, title: b.title, startHour: b.start_hour, endHour: b.end_hour,
        taskId: null, color: b.color || "#5B8DEF", type: b.type || "work",
        date: b.block_date, externalId: b.external_id,
      })));
    }
    if (dbWorkspaces) {
      setWorkspaces(dbWorkspaces.map(w => ({
        id: w.id, name: w.name, icon: w.icon || "Folder", color: w.color || "#5B8DEF",
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
        dueDate: t.due_date, dueTime: t.due_time, section: t.section || "afternoon",
        externalId: t.external_id, caldav_href: t.caldav_href, caldav_etag: t.caldav_etag,
        subtasks: subtasksByTask[t.id] || [], notes: notesByTask[t.id] || [],
        attachments: [], donePomos: t.done_pomos || 0, totalPomos: t.total_pomos || 0,
        wsId: t.workspace_id || null, tags: [],
      })));
    }

    // Build interaction map for contacts
    const interactionsByContact = {};
    (dbInteractions || []).forEach(i => {
      if (!interactionsByContact[i.contact_id]) interactionsByContact[i.contact_id] = [];
      interactionsByContact[i.contact_id].push({ id: i.id, type: i.type, text: i.text, date: i.interaction_date || new Date(i.created_at).toLocaleDateString() });
    });
    if (dbContacts) {
      setContacts(dbContacts.map(c => ({
        id: c.id, name: c.name, email: c.email || "", phone: c.phone || null,
        context: c.context || null, tags: c.tags || [], health: c.health || "strong",
        lastContact: c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString() : "Never",
        nextFollowUp: c.next_follow_up, notes: c.notes || "",
        interactions: interactionsByContact[c.id] || [],
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
        frequency: h.frequency || "daily", streak: h.streak || 0,
        completions: completionsByHabit[h.id] || [],
      })));
    }

    if (dbGoals) {
      setGoals(dbGoals.map(g => ({
        id: g.id, title: g.title, quarter: g.quarter || "", status: g.status || "in-progress",
        progress: g.progress || 0, keyResults: [], linkedTaskIds: [],
      })));
    }

    if (dbBookmarks) {
      setBookmarks(dbBookmarks.map(b => ({
        id: b.id, title: b.title, url: b.url || "", description: b.description || "",
        tags: b.tags || [], wsId: b.workspace_id || null,
        createdAt: new Date(b.created_at).toLocaleDateString(),
      })));
    }


    if (dbInbox) {
      setInbox(dbInbox.map(i => ({
        id: i.id, text: i.text, triaged: i.triaged || false,
        createdAt: new Date(i.created_at).toLocaleDateString(),
      })));
    }

    if (dbTemplates) {
      setTemplates(dbTemplates.map(t => ({
        id: t.id, name: t.name, category: t.category || "General",
        description: t.description || "", items: t.items || [],
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
        dueDay: b.due_day || 1, category: b.category || "",
      })));
    }

    if (dbBillPayments) {
      const payments = {};
      dbBillPayments.forEach(p => { payments[`${p.bill_id}-${p.month_key}`] = true; });
      setBillPayments(payments);
    }

    if (dbBudgets) {
      setBudgets(dbBudgets.map(b => ({
        categoryId: b.category_id, limit: parseFloat(b.budget_limit),
      })));
    }

    if (dbProfile) {
      if (dbProfile.intention_text) setIntentionText(dbProfile.intention_text);
      if (dbProfile.xp != null) setXp(dbProfile.xp);
      if (dbProfile.level != null) setLevel(dbProfile.level);
      if (dbProfile.streak != null) setStreak(dbProfile.streak);
      if (dbProfile.total_pomos_ever != null) setTotalPomosEver(dbProfile.total_pomos_ever);
      if (dbProfile.total_tasks_done != null) setTotalTasksDone(dbProfile.total_tasks_done);
    }

  };

  const syncingRef = useRef(false);
  const syncAll = async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncStatus("syncing");
    setSyncError(null);
    try {
      const [calRes] = await Promise.allSettled([
        supabase.functions.invoke("caldav-sync-calendar", { body: {} }),
      ]);
      const errors = [calRes]
        .filter(r => r.status === "rejected" || r.value?.data?.error)
        .map(r => r.status === "rejected" ? r.reason?.message : r.value?.data?.error);
      if (errors.length > 0) {
        setSyncError(errors.join("; "));
        setSyncStatus("error");
      } else {
        await loadFromSupabase();
        setSyncStatus("success");
        setLastSyncAt(new Date().toISOString());
        flash("Sync complete!");
      }
    } catch (e) {
      setSyncError(e.message);
      setSyncStatus("error");
    } finally {
      syncingRef.current = false;
    }
  };

  useEffect(() => { fetchAppleStatus(); fetchProfile(); loadFromSupabase(); }, []);

  // Persist gamification stats to profile when they change
  const statsLoadedRef = useRef(false);
  useEffect(() => {
    if (!statsLoadedRef.current) { statsLoadedRef.current = true; return; }
    const timer = setTimeout(async () => {
      const userId = await getUserId();
      if (userId) {
        const { error } = await supabase.from("profiles").update({ xp, level, streak, total_pomos_ever: totalPomosEver, total_tasks_done: totalTasksDone }).eq("id", userId);
        if (error) console.error("Stats save failed:", error);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [xp, level, streak, totalPomosEver, totalTasksDone]);

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
      contacts: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Contacts</strong></>,
      contactDetail: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <span onClick={() => setPage("contacts")} style={{ cursor:"pointer" }}>Contacts</span> / <strong style={{ color:"var(--text)" }}>{activeContact?.name}</strong></>,
      habits: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Habits</strong></>,
      goals: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Goals</strong></>,
      calendar: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Calendar</strong></>,
      bookmarks: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Bookmarks</strong></>,
      finance: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Finance</strong></>,
      review: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Weekly Review</strong></>,
      inbox: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Inbox</strong></>,
      templates: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Templates</strong></>,
      scratchpad: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Scratchpad</strong></>,
      wiki: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Wiki</strong></>,
      wikiArticle: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <span onClick={() => setPage("wiki")} style={{ cursor:"pointer" }}>Wiki</span> / <strong style={{ color:"var(--text)" }}>{activeWiki?.title}</strong></>,
    };
    if (page === "workspace") return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:activeWs?.color }}>{activeWs?.name}</strong></>;
    if (page === "task" && activeTask) { const w = ws.find(x=>x.id===activeTask.wsId); return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <span onClick={() => goWs(activeTask.wsId)} style={{ cursor:"pointer",color:w?.color }}>{w?.name}</span> / <strong style={{ color:"var(--text)" }}>{activeTask.title}</strong></>; }
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        @keyframes haloGlow{0%,100%{box-shadow:0 0 8px rgba(0,209,178,0.15)}50%{box-shadow:0 0 16px rgba(0,209,178,0.3)}}
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
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} page={page} setPage={setPage} themeName={themeName} toggleTheme={toggleTheme} timerActive={timerActive} timeLeft={timeLeft} fmt={fmt} inbox={inbox} ws={ws} tasks={tasks} activeWsId={activeWsId} goWs={goWs} goToday={goToday} sidebarSections={sidebarSections} setSidebarSections={setSidebarSections} setShowNewWs={setShowNewWs} setShowMobileSidebar={setShowMobileSidebar} setTimerTaskId={setTimerTaskId} />
          </div>
        </div>
      )}

      <div className="sidebar-desktop">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} page={page} setPage={setPage} themeName={themeName} toggleTheme={toggleTheme} timerActive={timerActive} timeLeft={timeLeft} fmt={fmt} inbox={inbox} ws={ws} tasks={tasks} activeWsId={activeWsId} goWs={goWs} goToday={goToday} sidebarSections={sidebarSections} setSidebarSections={setSidebarSections} setShowNewWs={setShowNewWs} setShowMobileSidebar={setShowMobileSidebar} setTimerTaskId={setTimerTaskId} />
      </div>

      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Top bar */}
        <div className="mobile-topbar" style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",gap:10,
          background:"var(--card-bg)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid var(--border-light)",transition:"background 0.3s ease",flexShrink:0,
        }}>
          <div className="mobile-hamburger" onClick={() => { setSidebarSections({ home: true, track: true, library: true, workspaces: true }); setShowMobileSidebar(true); }} style={{ width:36,height:36,borderRadius:10,background:"var(--subtle-bg)",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}><Menu size={18} /></div>
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
            <div onClick={() => setPage("rewards")} style={{ width:32,height:32,borderRadius:10,background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--body)",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",flexShrink:0 }}>{profileData.full_name ? profileData.full_name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "?"}</div>
          </div>
        </div>

        <div className="main-content" style={{ flex:1,overflow: page === "scratchpad" ? "hidden" : "auto",padding: page === "timer" || page === "scratchpad" ? "28px 28px" : "24px 28px", minHeight: 0, display:"flex", flexDirection:"column" }}>
          {page === "today" && <TodayPage greeting={greeting} totalTasks={totalTasks} doneTasks={doneTasks} totalPomos={totalPomos} donePomos={donePomos} habits={habits} toggleHabit={toggleHabit} streak={streak} themeName={themeName} timerActive={timerActive} timeLeft={timeLeft} fmt={fmt} setTimerTaskId={setTimerTaskId} setPage={setPage} tasks={tasks} goTask={goTask} TaskRow={TaskRow} inbox={inbox} contacts={contacts} goContact={goContact} intentionText={intentionText} setIntentionText={setIntentionText} editingIntention={editingIntention} setEditingIntention={setEditingIntention} setNewTaskWs={setNewTaskWs} setShowNewTask={setShowNewTask} flash={flash} inputStyle={inputStyle} />}
          {page === "workspace" && <WorkspacePage activeWs={activeWs} activeWsId={activeWsId} tasks={tasks} wsNotes={wsNotes} wsDocs={wsDocs} wsTab={wsTab} setWsTab={setWsTab} setNewTaskWs={setNewTaskWs} setShowNewTask={setShowNewTask} setShowWsNote={setShowWsNote} setShowWsDoc={setShowWsDoc} deleteWorkspace={deleteWorkspace} deleteWsNote={deleteWsNote} deleteWsDoc={deleteWsDoc} goTask={goTask} TaskRow={TaskRow} />}
          {page === "task" && <TaskDetailPage activeTask={activeTask} ws={ws} pColors={pColors} setPage={setPage} page={page} startFocus={startFocus} toggleTask={toggleTask} toggleSubtask={toggleSubtask} setEditingTask={setEditingTask} deleteTask={deleteTask} setShowNewNote={setShowNewNote} deleteTaskNote={deleteTaskNote} flash={flash} />}
          {page === "timer" && <TimerPage timerTask={timerTask} ws={ws} timeLeft={timeLeft} setTimeLeft={setTimeLeft} timerActive={timerActive} setTimerActive={setTimerActive} isBreak={isBreak} setIsBreak={setIsBreak} sessionCount={sessionCount} endTimeRef={endTimeRef} WORK_DURATION={WORK_DURATION} SHORT_BREAK={SHORT_BREAK} LONG_BREAK={LONG_BREAK} CYCLE_LENGTH={CYCLE_LENGTH} fmt={fmt} goToday={goToday} flash={flash} streak={streak} themeName={themeName} />}
          {page === "rewards" && <RewardsPage level={level} xp={xp} themeName={themeName} streak={streak} totalPomosEver={totalPomosEver} donePomos={donePomos} doneTasks={doneTasks} totalTasksDone={totalTasksDone} />}
          {page === "allTasks" && <AllTasksPage filteredTasks={filteredTasks} setShowNewTask={setShowNewTask} TaskRow={TaskRow} />}
          {page === "contacts" && <ContactsPage contacts={contacts} setShowNewContact={setShowNewContact} goContact={goContact} />}
          {page === "contactDetail" && <ContactDetailPage activeContact={activeContact} setPage={setPage} deleteContact={deleteContact} setShowNewInteraction={setShowNewInteraction} setEditingContact={setEditingContact} />}
          {page === "habits" && <HabitsPage habits={habits} setShowNewHabit={setShowNewHabit} toggleHabit={toggleHabit} deleteHabit={deleteHabit} setEditingHabit={setEditingHabit} />}
          {page === "goals" && <GoalsPage goals={goals} setShowNewGoal={setShowNewGoal} expandedGoals={expandedGoals} setExpandedGoals={setExpandedGoals} deleteGoal={deleteGoal} setEditingGoal={setEditingGoal} tasks={tasks} goTask={goTask} />}
          {page === "calendar" && <CalendarPage timeBlocks={timeBlocks} setShowNewBlock={setShowNewBlock} deleteTimeBlock={deleteTimeBlock} setEditingBlock={setEditingBlock} goTask={goTask} />}
          {page === "bookmarks" && <BookmarksPage bookmarks={bookmarks} ws={ws} setShowNewBookmark={setShowNewBookmark} deleteBookmark={deleteBookmark} setEditingBookmark={setEditingBookmark} />}
          {page === "finance" && <FinancePage transactions={transactions} financeTab={financeTab} setFinanceTab={setFinanceTab} setShowNewTransaction={setShowNewTransaction} deleteTransaction={deleteTransaction} setEditingTransaction={setEditingTransaction} saveBudget={saveBudget} addIncome={addIncome} togglePaid={togglePaid} addBill={addBill} deleteBill={deleteBill} setEditingBill={setEditingBill} budgets={budgets} editingBudget={editingBudget} setEditingBudget={setEditingBudget} editBudgetVal={editBudgetVal} setEditBudgetVal={setEditBudgetVal} newIncomeCategory={newIncomeCategory} setNewIncomeCategory={setNewIncomeCategory} newIncomeAmount={newIncomeAmount} setNewIncomeAmount={setNewIncomeAmount} newIncomeDesc={newIncomeDesc} setNewIncomeDesc={setNewIncomeDesc} newIncomeRecurring={newIncomeRecurring} setNewIncomeRecurring={setNewIncomeRecurring} bills={bills} billPayments={billPayments} newBillName={newBillName} setNewBillName={setNewBillName} newBillAmount={newBillAmount} setNewBillAmount={setNewBillAmount} newBillDueDay={newBillDueDay} setNewBillDueDay={setNewBillDueDay} newBillCategory={newBillCategory} setNewBillCategory={setNewBillCategory} inputStyle={inputStyle} />}
          {page === "review" && <ReviewPage tasks={tasks} contacts={contacts} inbox={inbox} habits={habits} goals={goals} toggleHabit={toggleHabit} goTask={goTask} goContact={goContact} pColors={pColors} />}
          {page === "inbox" && <InboxPage inbox={inbox} newInboxText={newInboxText} setNewInboxText={setNewInboxText} addInboxItem={addInboxItem} triageInbox={triageInbox} dismissInbox={dismissInbox} updateInboxItem={updateInboxItem} setTasks={setTasks} flash={flash} inputStyle={inputStyle} />}
          {page === "templates" && <TemplatesPage templates={templates} setShowNewTemplate={setShowNewTemplate} useTemplate={useTemplate} deleteTemplate={deleteTemplate} />}
          {page === "wiki" && <WikiPage wiki={wiki} setShowNewWiki={setShowNewWiki} goWiki={goWiki} />}
          {page === "wikiArticle" && <WikiArticlePage activeWiki={activeWiki} setPage={setPage} editingWiki={editingWiki} setEditingWiki={setEditingWiki} editWikiContent={editWikiContent} setEditWikiContent={setEditWikiContent} saveWikiEdit={saveWikiEdit} deleteWikiArticle={deleteWikiArticle} inputStyle={inputStyle} />}
          {page === "scratchpad" && <ScratchpadPage canvasRef={canvasRef} eraserMode={eraserMode} setEraserMode={setEraserMode} penColor={penColor} setPenColor={setPenColor} penSize={penSize} setPenSize={setPenSize} undoCanvas={undoCanvas} clearCanvas={clearCanvas} downloadCanvas={downloadCanvas} handleCanvasPointerDown={handleCanvasPointerDown} handleCanvasPointerMove={handleCanvasPointerMove} handleCanvasPointerUp={handleCanvasPointerUp} />}
          {page === "settings" && <SettingsPage profileData={profileData} setProfileData={setProfileData} saveProfile={saveProfile} profileSaving={profileSaving} themeName={themeName} appleConnected={appleConnected} showAppleConnect={showAppleConnect} setShowAppleConnect={setShowAppleConnect} appleIdInput={appleIdInput} setAppleIdInput={setAppleIdInput} appleAppPassword={appleAppPassword} setAppleAppPassword={setAppleAppPassword} appleConnecting={appleConnecting} connectApple={connectApple} syncError={syncError} setSyncError={setSyncError} appleCalendars={appleCalendars} selectedCalendarId={selectedCalendarId} setSelectedCalendarId={setSelectedCalendarId} saveCalendarSelection={saveCalendarSelection} rediscoverCalendars={rediscoverCalendars} syncAll={syncAll} syncStatus={syncStatus} lastSyncAt={lastSyncAt} disconnectApple={disconnectApple} inputStyle={inputStyle} />}
        </div>
      </div>

      {/* ─── MODALS ─── */}
      <Modal open={showNewTask} onClose={() => setShowNewTask(false)} title="New Task">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
          <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="What needs to be done?" style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Description</label>
          <textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Add details..." style={{ ...inputStyle, minHeight:70, resize:"vertical" }} />
        </div>
        <div style={{ display:"flex",gap:14,marginBottom:20 }}>
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
                <div key={w.id} onClick={() => setNewTaskWs(w.id)} style={{
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
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewTask(false)}>Cancel</Btn>
          <Btn primary onClick={createTask}>Create Task</Btn>
        </div>
      </Modal>

      <Modal open={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && (<>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
          <input value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Description</label>
          <textarea value={editingTask.desc || ""} onChange={e => setEditingTask({ ...editingTask, desc: e.target.value })} style={{ ...inputStyle, minHeight:70, resize:"vertical" }} />
        </div>
        <div style={{ marginBottom:14 }}>
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
        <div style={{ display:"flex",gap:14,marginBottom:20 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Due Date</label>
            <input type="date" value={editingTask.dueDate || ""} onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Due Time</label>
            <input type="time" value={editingTask.dueTime || ""} onChange={e => setEditingTask({ ...editingTask, dueTime: e.target.value })} style={inputStyle} />
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setEditingTask(null)}>Cancel</Btn>
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

      <Modal open={showNewContact} onClose={() => setShowNewContact(false)} title="Add Contact">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
          <input value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder="Full name" style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Email</label>
          <input value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} placeholder="email@example.com" style={inputStyle} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Context</label>
          <div style={{ display:"flex",gap:6 }}>
            {["Academic","Client","Student","Community","Personal"].map(ctx => (
              <div key={ctx} onClick={() => setNewContactContext(ctx)} style={{
                flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                background: newContactContext === ctx ? "var(--primary-bg)" : "var(--hover-bg)",
                border: newContactContext === ctx ? "2px solid #5B8DEF" : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newContactContext===ctx?"#5B8DEF":"var(--muted)",
                transition:"all 0.15s",
              }}>{ctx}</div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewContact(false)}>Cancel</Btn>
          <Btn primary onClick={createContact}>Add Contact</Btn>
        </div>
      </Modal>

      <Modal open={showNewInteraction} onClose={() => setShowNewInteraction(false)} title="Log Interaction">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Type</label>
          <div style={{ display:"flex",gap:6 }}>
            {["message","email","meeting","call"].map(t => (
              <div key={t} onClick={() => setNewInteractionType(t)} style={{
                flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                background: newInteractionType === t ? "var(--primary-bg)" : "var(--hover-bg)",
                border: newInteractionType === t ? "2px solid #5B8DEF" : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newInteractionType===t?"#5B8DEF":"var(--muted)",
                textTransform:"capitalize",transition:"all 0.15s",
              }}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Details</label>
          <textarea value={newInteractionText} onChange={e => setNewInteractionText(e.target.value)} placeholder="What happened?" style={{ ...inputStyle, minHeight:80, resize:"vertical" }} autoFocus />
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewInteraction(false)}>Cancel</Btn>
          <Btn primary onClick={addInteraction}>Log Interaction</Btn>
        </div>
      </Modal>

      <Modal open={showNewHabit} onClose={() => setShowNewHabit(false)} title="New Habit">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
          <input value={newHabitName} onChange={e => setNewHabitName(e.target.value)} placeholder="e.g. Meditate, Walk 10k steps..." style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Frequency</label>
          <div style={{ display:"flex",gap:6 }}>
            {["daily","weekly"].map(f => (
              <div key={f} onClick={() => setNewHabitFreq(f)} style={{
                flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                background: newHabitFreq === f ? "rgba(34,197,94,0.1)" : "var(--hover-bg)",
                border: newHabitFreq === f ? "2px solid #22C55E" : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:12,fontWeight:600,color:newHabitFreq===f?"#22C55E":"var(--muted)",
                textTransform:"capitalize",transition:"all 0.15s",
              }}>{f}</div>
            ))}
          </div>
        </div>
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

      <Modal open={showNewGoal} onClose={() => setShowNewGoal(false)} title="New Goal">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Objective</label>
          <input value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} placeholder="What do you want to achieve?" style={inputStyle} autoFocus />
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewGoal(false)}>Cancel</Btn>
          <Btn primary onClick={createGoal}>Create Goal</Btn>
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

      <Modal open={showNewBookmark} onClose={() => setShowNewBookmark(false)} title="Save Bookmark">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
          <input value={newBmTitle} onChange={e => setNewBmTitle(e.target.value)} placeholder="Article or resource name" style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>URL</label>
          <input value={newBmUrl} onChange={e => setNewBmUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Description (optional)</label>
          <textarea value={newBmDesc} onChange={e => setNewBmDesc(e.target.value)} placeholder="Why is this useful?" style={{ ...inputStyle, minHeight:60, resize:"vertical" }} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Workspace (optional)</label>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            <div onClick={() => setNewBmWs("")} style={{
              padding:"6px 12px",borderRadius:10,cursor:"pointer",
              background: !newBmWs ? "var(--primary-bg)" : "var(--hover-bg)",
              border: !newBmWs ? "2px solid #5B8DEF" : "2px solid transparent",
              fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:!newBmWs?"#5B8DEF":"var(--muted)",
            }}>None</div>
            {ws.map(w => (
              <div key={w.id} onClick={() => setNewBmWs(w.id)} style={{
                padding:"6px 12px",borderRadius:10,cursor:"pointer",
                background: newBmWs === w.id ? `${w.color}18` : "var(--hover-bg)",
                border: newBmWs === w.id ? `2px solid ${w.color}` : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newBmWs===w.id?w.color:"var(--muted)",
                display:"flex",alignItems:"center",gap:4,
              }}>{getWsIcon(w.icon, 11)} {w.name}</div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewBookmark(false)}>Cancel</Btn>
          <Btn primary onClick={createBookmark}>Save Bookmark</Btn>
        </div>
      </Modal>

      <Modal open={showNewTemplate} onClose={() => setShowNewTemplate(false)} title="New Template">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
          <input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="Template name" style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Category</label>
          <input value={newTemplateCategory} onChange={e => setNewTemplateCategory(e.target.value)} placeholder="e.g. Teaching, Productivity..." style={inputStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Items (one per line)</label>
          <textarea value={newTemplateItems} onChange={e => setNewTemplateItems(e.target.value)} placeholder="Step 1&#10;Step 2&#10;Step 3" style={{ ...inputStyle, minHeight:120, resize:"vertical" }} />
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewTemplate(false)}>Cancel</Btn>
          <Btn primary onClick={createTemplate}>Create Template</Btn>
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
            {FINANCE_CATEGORIES[newTxType].map(cat => (
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
            <div style={{ width:18,height:18,borderRadius:5,border:newTxRecurring?"none":"2px solid rgba(0,0,0,0.15)",background:newTxRecurring?"#5B8DEF":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
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
          return <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
              <input value={editingBlock.title} onChange={e => set("title", e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ display:"flex",gap:14,marginBottom:20 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Start Hour</label>
                <input type="number" min="6" max="21" value={editingBlock.startHour} onChange={e => set("startHour", parseInt(e.target.value))} style={inputStyle} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>End Hour</label>
                <input type="number" min="7" max="22" value={editingBlock.endHour} onChange={e => set("endHour", parseInt(e.target.value))} style={inputStyle} />
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
          return <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
              <input value={editingHabit.name} onChange={e => set("name", e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Frequency</label>
              <div style={{ display:"flex",gap:6 }}>
                {["daily","weekly"].map(f => (
                  <div key={f} onClick={() => set("frequency", f)} style={{
                    flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                    background: editingHabit.frequency === f ? "rgba(34,197,94,0.1)" : "var(--hover-bg)",
                    border: editingHabit.frequency === f ? "2px solid #22C55E" : "2px solid transparent",
                    fontFamily:"var(--body)",fontSize:12,fontWeight:600,color:editingHabit.frequency===f?"#22C55E":"var(--muted)",
                    textTransform:"capitalize",transition:"all 0.15s",
                  }}>{f}</div>
                ))}
              </div>
            </div>
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
              <Btn primary onClick={() => updateHabit(editingHabit.id, { name: editingHabit.name, frequency: editingHabit.frequency, color: editingHabit.color })}>Save</Btn>
            </div>
          </>;
        })()}
      </Modal>

      <Modal open={!!editingBookmark} onClose={() => setEditingBookmark(null)} title="Edit Bookmark">
        {editingBookmark && (() => {
          const set = (k, v) => setEditingBookmark(b => ({ ...b, [k]: v }));
          return <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Title</label>
              <input value={editingBookmark.title} onChange={e => set("title", e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>URL</label>
              <input value={editingBookmark.url} onChange={e => set("url", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Description</label>
              <textarea value={editingBookmark.description} onChange={e => set("description", e.target.value)} style={{ ...inputStyle, minHeight:60, resize:"vertical" }} />
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <Btn onClick={() => setEditingBookmark(null)}>Cancel</Btn>
              <Btn primary onClick={() => updateBookmark(editingBookmark.id, { title: editingBookmark.title, url: editingBookmark.url, description: editingBookmark.description, wsId: editingBookmark.wsId })}>Save</Btn>
            </div>
          </>;
        })()}
      </Modal>

      <Modal open={!!editingGoal} onClose={() => setEditingGoal(null)} title="Edit Goal">
        {editingGoal && (() => {
          const set = (k, v) => setEditingGoal(g => ({ ...g, [k]: v }));
          return <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Objective</label>
              <input value={editingGoal.title} onChange={e => set("title", e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Quarter</label>
              <input value={editingGoal.quarter} onChange={e => set("quarter", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Status</label>
              <div style={{ display:"flex",gap:6 }}>
                {["in-progress","on-track","at-risk","completed"].map(s => {
                  const colors = { "in-progress":"#5B8DEF","on-track":"#22C55E","at-risk":"#EF4444","completed":"#A78BFA" };
                  return <div key={s} onClick={() => set("status", s)} style={{
                    flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                    background: editingGoal.status === s ? `${colors[s]}14` : "var(--hover-bg)",
                    border: editingGoal.status === s ? `2px solid ${colors[s]}` : "2px solid transparent",
                    fontFamily:"var(--body)",fontSize:10,fontWeight:600,color:editingGoal.status===s?colors[s]:"var(--muted)",
                    transition:"all 0.15s",
                  }}>{s}</div>;
                })}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Progress (%)</label>
              <input type="number" min="0" max="100" value={editingGoal.progress} onChange={e => set("progress", parseInt(e.target.value) || 0)} style={inputStyle} />
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <Btn onClick={() => setEditingGoal(null)}>Cancel</Btn>
              <Btn primary onClick={() => updateGoal(editingGoal.id, { title: editingGoal.title, quarter: editingGoal.quarter, status: editingGoal.status, progress: editingGoal.progress })}>Save</Btn>
            </div>
          </>;
        })()}
      </Modal>

      <Modal open={!!editingContact} onClose={() => setEditingContact(null)} title="Edit Contact">
        {editingContact && (() => {
          const set = (k, v) => setEditingContact(c => ({ ...c, [k]: v }));
          return <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Name</label>
              <input value={editingContact.name} onChange={e => set("name", e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Email</label>
              <input value={editingContact.email || ""} onChange={e => set("email", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Phone</label>
              <input value={editingContact.phone || ""} onChange={e => set("phone", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Context</label>
              <div style={{ display:"flex",gap:6 }}>
                {["Academic","Client","Student","Community","Personal"].map(ctx => (
                  <div key={ctx} onClick={() => set("context", ctx)} style={{
                    flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                    background: editingContact.context === ctx ? "var(--primary-bg)" : "var(--hover-bg)",
                    border: editingContact.context === ctx ? "2px solid #5B8DEF" : "2px solid transparent",
                    fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:editingContact.context===ctx?"#5B8DEF":"var(--muted)",
                    transition:"all 0.15s",
                  }}>{ctx}</div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Notes</label>
              <textarea value={editingContact.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Notes about this contact..." style={{ ...inputStyle, minHeight:60, resize:"vertical" }} />
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <Btn onClick={() => setEditingContact(null)}>Cancel</Btn>
              <Btn primary onClick={() => updateContact(editingContact.id, { name: editingContact.name, email: editingContact.email, phone: editingContact.phone, context: editingContact.context, notes: editingContact.notes })}>Save</Btn>
            </div>
          </>;
        })()}
      </Modal>

      <Modal open={!!editingTransaction} onClose={() => setEditingTransaction(null)} title="Edit Transaction">
        {editingTransaction && (() => {
          const set = (k, v) => setEditingTransaction(t => ({ ...t, [k]: v }));
          const cats = FINANCE_CATEGORIES[editingTransaction.type] || FINANCE_CATEGORIES.expense;
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
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Due Day (of month)</label>
              <input type="number" min="1" max="31" value={editingBill.dueDay} onChange={e => set("dueDay", parseInt(e.target.value) || 1)} style={inputStyle} />
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <Btn onClick={() => setEditingBill(null)}>Cancel</Btn>
              <Btn primary onClick={() => updateBill(editingBill.id, { name: editingBill.name, amount: editingBill.amount, dueDay: editingBill.dueDay, category: editingBill.category })}>Save</Btn>
            </div>
          </>;
        })()}
      </Modal>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}
