import { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor, Brain, Book, Leaf, Briefcase, FileCode2, Image as ImageIcon,
  FileText, FileEdit, Sprout, TreePine, Mountain, Zap, Target,
  Bird, Waves, Home, ClipboardList, Timer, Trophy, Sunrise, Sun,
  Moon, Flame, Gift, Check, Play, Pause, RotateCcw, SkipForward,
  Paperclip, Search, Clock, CheckCircle2, ArrowLeft, Plus, X,
  Palette, Hash, Folder, Heart, Star, Coffee, Music, Camera,
  Globe, Lightbulb, Rocket, Compass, Anchor, Award, Bell,
  // New feature icons
  User, Users, UserPlus, Mail, Phone, MessageSquare, Save, MapPin,
  Repeat, TrendingUp, Flag, BookOpen, Smile, Frown, Meh,
  Calendar, Bookmark, Link, ExternalLink, Activity,
  BarChart3, RefreshCw, Eye, Inbox, Send, ArrowRight,
  Layout, Copy, Library, Trash2, ChevronRight, ChevronDown,
  Tag, AlertCircle, Pencil, Dumbbell, HeartPulse, Menu,
  PenTool, Eraser, Undo2, Download,
  DollarSign, Wallet, ArrowUpRight, ArrowDownRight, CreditCard, PiggyBank, Receipt,
  Settings
} from "lucide-react";
import { supabase } from "./lib/supabase";


// ═══════════════════════════════════════
//  DATA & STATE
// ═══════════════════════════════════════
const INIT_WORKSPACES = [];

const WS_ICON_OPTIONS = [
  { key: "Monitor", component: Monitor },
  { key: "Brain", component: Brain },
  { key: "Book", component: Book },
  { key: "Leaf", component: Leaf },
  { key: "Briefcase", component: Briefcase },
  { key: "Folder", component: Folder },
  { key: "Heart", component: Heart },
  { key: "Star", component: Star },
  { key: "Coffee", component: Coffee },
  { key: "Music", component: Music },
  { key: "Camera", component: Camera },
  { key: "Globe", component: Globe },
  { key: "Lightbulb", component: Lightbulb },
  { key: "Rocket", component: Rocket },
  { key: "Compass", component: Compass },
  { key: "Palette", component: Palette },
  { key: "Hash", component: Hash },
  { key: "Anchor", component: Anchor },
  { key: "Award", component: Award },
  { key: "Bell", component: Bell },
];

const WS_COLOR_OPTIONS = [
  "#5B8DEF", "#E87B7B", "#A78BFA", "#4ADE80", "#FBBF24",
  "#F97316", "#EC4899", "#14B8A6", "#6366F1", "#8B5CF6",
];

const getWsIcon = (iconKey, size = 16) => {
  const found = WS_ICON_OPTIONS.find(o => o.key === iconKey);
  if (found) {
    const IconComp = found.component;
    return <IconComp size={size} />;
  }
  return <Folder size={size} />;
};

const INIT_TASKS = [];

const ACHIEVEMENTS = [
  { id: "a1", icon: <Sprout size={24} />, title: "First Sprout", desc: "Complete your first pomodoro", earned: false },
  { id: "a2", icon: <Leaf size={16} />, title: "Growing Strong", desc: "Complete 10 pomodoros", earned: false },
  { id: "a3", icon: <TreePine size={24} />, title: "Deep Roots", desc: "Maintain a 7-day streak", earned: false },
  { id: "a4", icon: <Mountain size={24} />, title: "Summit", desc: "Complete 50 pomodoros", earned: false },
  { id: "a5", icon: <Zap size={24} />, title: "Lightning Focus", desc: "5 pomodoros in one day", earned: false },
  { id: "a6", icon: <Target size={24} />, title: "Bullseye", desc: "Complete all daily tasks 3 days running", earned: false },
  { id: "a7", icon: <Bird size={24} />, title: "Night Owl", desc: "Complete a task after 10pm", earned: false },
  { id: "a8", icon: <Waves size={24} />, title: "Flow Master", desc: "Maintain a 30-day streak", earned: false },
];

const TODAY_STR = new Date().toISOString().split("T")[0];

const INIT_CONTACTS = [];
const INIT_HABITS = [];
const INIT_GOALS = [];
const INIT_JOURNAL = [];
const INIT_TIME_BLOCKS = [];
const INIT_BOOKMARKS = [];
const INIT_WORKOUTS = [];
const INIT_HEALTH_METRICS = { weight: null, sleep: null, steps: null, water: null };
const INIT_INBOX = [];
const INIT_TEMPLATES = [];
const INIT_WIKI = [];


// ═══════════════════════════════════════
//  THEMES
// ═══════════════════════════════════════
const THEMES = {
  default: {
    "--app-bg": "linear-gradient(135deg, #dfe7fd 0%, #e8dff5 25%, #f5e6f0 50%, #dceefb 75%, #e0f4f1 100%)",
    "--sidebar-bg": "rgba(255,255,255,0.55)",
    "--card-bg": "rgba(255,255,255,0.45)",
    "--done-bg": "rgba(245,245,250,0.5)",
    "--input-bg": "rgba(255,255,255,0.4)",
    "--subtle-bg": "rgba(255,255,255,0.35)",
    "--hover-bg": "rgba(255,255,255,0.5)",
    "--card-border": "rgba(255,255,255,0.6)",
    "--border": "rgba(255,255,255,0.5)",
    "--border-light": "rgba(255,255,255,0.45)",
    "--border-hover": "rgba(255,255,255,0.7)",
    "--sidebar-border": "rgba(255,255,255,0.4)",
    "--text": "#1a1a2e",
    "--muted": "rgba(30,30,60,0.5)",
    "--text-on-primary": "#fff",
    "--primary": "#6366F1",
    "--primary-bg": "rgba(99,102,241,0.12)",
    "--primary-hover-bg": "rgba(99,102,241,0.18)",
    "--accent-gradient": "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",
    "--btn-gradient": "linear-gradient(135deg, #6366F1, #8B5CF6)",
    "--xp-gradient": "linear-gradient(90deg, #A78BFA, #6366F1, #818CF8)",
    "--xp-color": "#8B5CF6",
    "--danger": "#EF4444",
    "--warning": "#F59E0B",
    "--success": "#22C55E",
    "--card-shadow": "0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
    "--card-shadow-sm": "0 1px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.5)",
    "--card-hover-shadow": "0 8px 32px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
    "--hover-shadow": "0 4px 16px rgba(99,102,241,0.08)",
    "--modal-shadow": "0 24px 80px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.05)",
    "--toast-shadow": "0 8px 32px rgba(0,0,0,0.15)",
    "--overlay": "rgba(200,200,220,0.35)",
    "--overlay-heavy": "rgba(180,180,210,0.45)",
    "--toast-bg": "rgba(30,30,60,0.75)",
    "--scrollbar-thumb": "rgba(99,102,241,0.2)",
    "--focus-border": "rgba(99,102,241,0.5)",
    "--focus-shadow": "0 0 0 3px rgba(99,102,241,0.12)",
    "--checkbox-border": "rgba(99,102,241,0.3)",
    "--heading": "'Inter','SF Pro Display',-apple-system,sans-serif",
    "--body": "'Inter','SF Pro Text',-apple-system,sans-serif",
    "--mono": "'JetBrains Mono','SF Mono',monospace",
  },
  halo: {
    "--app-bg": "#0A120E",
    "--sidebar-bg": "#0F1A14",
    "--card-bg": "#152119",
    "--done-bg": "#111B15",
    "--input-bg": "rgba(74,222,128,0.04)",
    "--subtle-bg": "rgba(74,222,128,0.06)",
    "--hover-bg": "rgba(74,222,128,0.05)",
    "--card-border": "rgba(74,222,128,0.10)",
    "--border": "rgba(74,222,128,0.14)",
    "--border-light": "rgba(74,222,128,0.08)",
    "--border-hover": "rgba(74,222,128,0.25)",
    "--sidebar-border": "rgba(74,222,128,0.10)",
    "--text": "#E2E8F0",
    "--muted": "rgba(255,255,255,0.45)",
    "--text-on-primary": "#fff",
    "--primary": "#4ADE80",
    "--primary-bg": "rgba(74,222,128,0.12)",
    "--primary-hover-bg": "rgba(74,222,128,0.18)",
    "--accent-gradient": "linear-gradient(135deg, #4ADE80, #FFB000)",
    "--btn-gradient": "linear-gradient(135deg, #4ADE80, #22C55E)",
    "--xp-gradient": "linear-gradient(90deg, #FFB000, #4ADE80)",
    "--xp-color": "#FFB000",
    "--danger": "#FF3D3D",
    "--warning": "#FFB000",
    "--success": "#00E676",
    "--card-shadow": "0 1px 4px rgba(0,0,0,0.3)",
    "--card-shadow-sm": "0 1px 3px rgba(0,0,0,0.2)",
    "--card-hover-shadow": "0 4px 20px rgba(74,222,128,0.12)",
    "--hover-shadow": "0 2px 12px rgba(74,222,128,0.08)",
    "--modal-shadow": "0 20px 60px rgba(0,0,0,0.5)",
    "--toast-shadow": "0 8px 32px rgba(0,0,0,0.4)",
    "--overlay": "rgba(0,0,0,0.5)",
    "--overlay-heavy": "rgba(0,0,0,0.6)",
    "--toast-bg": "rgba(10,18,14,0.92)",
    "--scrollbar-thumb": "rgba(74,222,128,0.20)",
    "--focus-border": "rgba(74,222,128,0.5)",
    "--focus-shadow": "0 0 0 3px rgba(74,222,128,0.15)",
    "--checkbox-border": "rgba(255,255,255,0.25)",
    "--heading": "'Inter','SF Pro Display',-apple-system,sans-serif",
    "--body": "'Inter','SF Pro Text',-apple-system,sans-serif",
    "--mono": "'JetBrains Mono','SF Mono',monospace",
  },
};


// ═══════════════════════════════════════
//  FINANCE DATA
// ═══════════════════════════════════════
const FINANCE_CATEGORIES = {
  income: [
    { id: "salary", label: "Salary", color: "#22C55E", icon: "Wallet" },
    { id: "freelance", label: "Freelance", color: "#5B8DEF", icon: "Briefcase" },
    { id: "investments", label: "Investments", color: "#A78BFA", icon: "TrendingUp" },
    { id: "other_income", label: "Other", color: "#14B8A6", icon: "Plus" },
  ],
  expense: [
    { id: "rent", label: "Rent/Housing", color: "#EF4444", icon: "Home" },
    { id: "food", label: "Food & Groceries", color: "#F97316", icon: "Coffee" },
    { id: "transport", label: "Transport", color: "#FBBF24", icon: "Compass" },
    { id: "utilities", label: "Utilities", color: "#6366F1", icon: "Zap" },
    { id: "entertainment", label: "Entertainment", color: "#EC4899", icon: "Music" },
    { id: "shopping", label: "Shopping", color: "#8B5CF6", icon: "CreditCard" },
    { id: "subscriptions", label: "Subscriptions", color: "#14B8A6", icon: "Repeat" },
    { id: "health_fin", label: "Health", color: "#10B981", icon: "HeartPulse" },
    { id: "education", label: "Education", color: "#5B8DEF", icon: "Book" },
    { id: "other_expense", label: "Other", color: "#94A3B8", icon: "Receipt" },
  ],
};

const ALL_FINANCE_CATS = [...FINANCE_CATEGORIES.income, ...FINANCE_CATEGORIES.expense];

const INIT_TRANSACTIONS = [];
const INIT_BUDGETS = [];

// ═══════════════════════════════════════
//  REUSABLE COMPONENTS
// ═══════════════════════════════════════
const Glass = ({ children, style = {}, hover = false, onClick, className }) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--card-bg)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderRadius: 14, border: "1px solid var(--card-border)",
        boxShadow: h && hover ? "var(--card-hover-shadow)" : "var(--card-shadow)",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        transform: h && hover ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default", ...style,
      }}>{children}</div>
  );
};

const Ring = ({ percent, size = 56, stroke = 5, color = "#5B8DEF" }) => {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--card-border)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (percent/100)*c} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
};

const Btn = ({ children, primary, color, small, style = {}, onClick }) => (
  <button onClick={onClick} style={{
    background: primary ? (color || "var(--text)") : "var(--subtle-bg)",
    color: primary ? "var(--text-on-primary)" : "var(--muted)", border: primary ? "none" : "1px solid var(--border)",
    borderRadius: small ? 8 : 11, padding: small ? "5px 12px" : "8px 18px",
    fontFamily: "var(--body)", fontSize: small ? 11 : 12, fontWeight: 600,
    cursor: "pointer", transition: "all 0.2s", ...style,
  }}
    onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
  >{children}</button>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)" }}
      onClick={onClose}>
      <div style={{ position:"absolute",inset:0,background:"var(--overlay)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)" }} />
      <div className="modal-inner" onClick={e => e.stopPropagation()} style={{
        position:"relative",width:520,maxHeight:"80dvh",overflow:"auto",
        background:"var(--card-bg)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",
        borderRadius:20,border:"1px solid var(--card-border)",
        boxShadow:"var(--modal-shadow)",padding:28,
        animation:"scaleIn 0.2s ease",
        WebkitOverflowScrolling:"touch",
      }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:700,color:"var(--text)",margin:0 }}>{title}</h3>
          <div onClick={onClose} style={{ width:32,height:32,borderRadius:8,background:"var(--subtle-bg)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"var(--muted)" }}><X size={16} /></div>
        </div>
        {children}
      </div>
    </div>
  );
};

const Toast = ({ message, visible }) => (
  <div className="toast-container" style={{
    position:"fixed",bottom:"calc(24px + env(safe-area-inset-bottom, 0px))",left:"50%",transform:`translateX(-50%) translateY(${visible ? 0 : 20}px)`,
    opacity:visible?1:0,transition:"all 0.3s ease",zIndex:200,
    background:"var(--toast-bg)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",color:"var(--text-on-primary)",
    padding:"10px 24px",borderRadius:14,fontFamily:"var(--body)",fontSize:13,fontWeight:600,
    boxShadow:"var(--toast-shadow)",pointerEvents:"none",maxWidth:"calc(100vw - 32px)",textAlign:"center",
  }}>{message}</div>
);

// ═══════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("today");
  const [activeWsId, setActiveWsId] = useState("cs301");
  const [activeTaskId, setActiveTaskId] = useState(null);
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
  const [newTaskWs, setNewTaskWs] = useState("cs301");
  const [newNoteText, setNewNoteText] = useState("");
  const [toast, setToast] = useState({ msg: "", visible: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [intentionText, setIntentionText] = useState("Finish BST implementation and start graph theory reading. Take real breaks between sessions.");
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
  const [contacts, setContacts] = useState(INIT_CONTACTS);
  const [activeContactId, setActiveContactId] = useState(null);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactContext, setNewContactContext] = useState("Community");
  const [showNewInteraction, setShowNewInteraction] = useState(false);
  const [newInteractionText, setNewInteractionText] = useState("");
  const [newInteractionType, setNewInteractionType] = useState("message");

  // Habits
  const [habits, setHabits] = useState(INIT_HABITS);
  const [showNewHabit, setShowNewHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitFreq, setNewHabitFreq] = useState("daily");
  const [newHabitColor, setNewHabitColor] = useState("#22C55E");

  // Goals
  const [goals, setGoals] = useState(INIT_GOALS);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [expandedGoals, setExpandedGoals] = useState({});

  // Journal
  const [journal, setJournal] = useState(INIT_JOURNAL);
  const [showNewJournal, setShowNewJournal] = useState(false);
  const [newJournalContent, setNewJournalContent] = useState("");
  const [newJournalMood, setNewJournalMood] = useState(3);
  const [newJournalEnergy, setNewJournalEnergy] = useState(3);
  const [newJournalWins, setNewJournalWins] = useState("");
  const [newJournalBlockers, setNewJournalBlockers] = useState("");

  // Calendar
  const [timeBlocks, setTimeBlocks] = useState(INIT_TIME_BLOCKS);
  const [showNewBlock, setShowNewBlock] = useState(false);
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [newBlockStart, setNewBlockStart] = useState(9);
  const [newBlockEnd, setNewBlockEnd] = useState(10);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState(INIT_BOOKMARKS);
  const [showNewBookmark, setShowNewBookmark] = useState(false);
  const [newBmTitle, setNewBmTitle] = useState("");
  const [newBmUrl, setNewBmUrl] = useState("");
  const [newBmDesc, setNewBmDesc] = useState("");
  const [newBmWs, setNewBmWs] = useState("");

  // Health
  const [workouts, setWorkouts] = useState(INIT_WORKOUTS);
  const [healthMetrics] = useState(INIT_HEALTH_METRICS);
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  const [newWorkoutType, setNewWorkoutType] = useState("Run");
  const [newWorkoutDuration, setNewWorkoutDuration] = useState("");
  const [newWorkoutNotes, setNewWorkoutNotes] = useState("");
  const [healthTab, setHealthTab] = useState("Workouts");

  // Inbox
  const [inbox, setInbox] = useState(INIT_INBOX);
  const [newInboxText, setNewInboxText] = useState("");

  // Templates
  const [templates, setTemplates] = useState(INIT_TEMPLATES);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("");
  const [newTemplateItems, setNewTemplateItems] = useState("");

  // Wiki
  const [wiki, setWiki] = useState(INIT_WIKI);
  const [showNewWiki, setShowNewWiki] = useState(false);
  const [newWikiTitle, setNewWikiTitle] = useState("");
  const [newWikiCategory, setNewWikiCategory] = useState("");
  const [newWikiContent, setNewWikiContent] = useState("");
  const [activeWikiId, setActiveWikiId] = useState(null);
  const [editingWiki, setEditingWiki] = useState(false);
  const [editWikiContent, setEditWikiContent] = useState("");

  // Finance
  const [transactions, setTransactions] = useState(INIT_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INIT_BUDGETS);
  const [financeTab, setFinanceTab] = useState("Transactions");
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [newTxType, setNewTxType] = useState("expense");
  const [newTxCategory, setNewTxCategory] = useState("food");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxDesc, setNewTxDesc] = useState("");
  const [newTxDate, setNewTxDate] = useState("2026-03-21");
  const [newTxRecurring, setNewTxRecurring] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editBudgetVal, setEditBudgetVal] = useState("");
  const [newIncomeCategory, setNewIncomeCategory] = useState("salary");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeDesc, setNewIncomeDesc] = useState("");
  const [newIncomeRecurring, setNewIncomeRecurring] = useState(true);
  const [bills, setBills] = useState([]);
  const [billPayments, setBillPayments] = useState({});
  const [newBillName, setNewBillName] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillDueDay, setNewBillDueDay] = useState("1");
  const [newBillCategory, setNewBillCategory] = useState("rent");

  // Scratchpad (Apple Pencil canvas)
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#111827");
  const [penSize, setPenSize] = useState(3);
  const [eraserMode, setEraserMode] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const lastPoint = useRef(null);

  // Show toast
  const flash = (msg) => { setToast({ msg, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200); };

  // Auto-collapse sidebar on iPad mini width range (601-820px)
  useEffect(() => {
    const w = window.innerWidth;
    if (w >= 601 && w <= 820) {
      setCollapsed(true);
    }
  }, []);

  // Timer
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      if (!isBreak) {
        addXp(15);
        setTotalPomosEver(p => p + 1);
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);
        if (timerTaskId) {
          setTasks(ts => ts.map(t => t.id === timerTaskId ? { ...t, donePomos: Math.min(t.donePomos + 1, t.totalPomos) } : t));
        }
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

  const addXp = (amount) => {
    setXp(prev => {
      let next = prev + amount;
      if (next >= 500) { setLevel(l => l + 1); flash("Level up!"); return next - 500; }
      return next;
    });
  };

  const toggleTask = (id) => {
    setTasks(ts => ts.map(t => {
      if (t.id !== id) return t;
      const newDone = !t.done;
      if (newDone) { addXp(25); setTotalTasksDone(d => d + 1); flash("Task complete! +25 XP"); }
      return { ...t, done: newDone };
    }));
  };

  const toggleSubtask = (taskId, subId) => {
    setTasks(ts => ts.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.map(s => {
        if (s.id !== subId) return s;
        const newDone = !s.done;
        if (newDone) { addXp(s.xp); flash(`+${s.xp} XP — step complete!`); }
        return { ...s, done: newDone };
      })};
    }));
  };

  const createTask = () => {
    if (!newTaskTitle.trim()) return;
    const id = "t" + Date.now();
    setTasks(ts => [...ts, {
      id, title: newTaskTitle, desc: newTaskDesc, priority: newTaskPriority,
      wsId: newTaskWs, dueTime: null, dueDate: null, done: false, section: "afternoon",
      subtasks: [], notes: [], attachments: [], totalPomos: 2, donePomos: 0, reward: null,
    }]);
    setNewTaskTitle(""); setNewTaskDesc(""); setShowNewTask(false);
    flash("Task created!");
  };

  const addNote = () => {
    if (!newNoteText.trim() || !activeTaskId) return;
    const nid = "n" + Date.now();
    setTasks(ts => ts.map(t => t.id === activeTaskId ? { ...t, notes: [{ id: nid, text: newNoteText, time: "Just now" }, ...t.notes] } : t));
    setNewNoteText(""); setShowNewNote(false);
    flash("Note added!");
  };

  const startFocus = (taskId) => {
    setTimerTaskId(taskId);
    setTimerActive(false);
    setIsBreak(false);
    setTimeLeft(WORK_DURATION);
    setPage("timer");
    setTimeout(() => setTimerActive(true), 300);
  };

  const createWorkspace = () => {
    if (!newWsName.trim()) return;
    const id = "ws" + Date.now();
    setWorkspaces(prev => [...prev, { id, name: newWsName, icon: newWsIcon, color: newWsColor }]);
    setNewWsName(""); setNewWsColor(WS_COLOR_OPTIONS[0]); setNewWsIcon("Folder"); setShowNewWs(false);
    flash("Workspace created!");
    goWs(id);
  };

  const createWsNote = () => {
    if (!wsNoteText.trim()) return;
    const nid = "wn" + Date.now();
    setWsNotes(prev => [...prev, {
      id: nid, title: wsNoteTitle.trim() || "Untitled Note", text: wsNoteText,
      wsId: activeWsId, time: "Just now",
    }]);
    setWsNoteTitle(""); setWsNoteText(""); setShowWsNote(false);
    flash("Note added!");
  };

  const createWsDoc = () => {
    if (!wsDocName.trim()) return;
    const did = "wd" + Date.now();
    const typeIcons = { doc: "FileEdit", pdf: "FileText", code: "FileCode2", image: "ImageIcon", other: "FileText" };
    setWsDocs(prev => [...prev, {
      id: did, name: wsDocName, wsId: activeWsId, type: wsDocType,
      icon: typeIcons[wsDocType] || "FileText", size: "—", time: "Just now",
    }]);
    setWsDocName(""); setWsDocType("doc"); setShowWsDoc(false);
    flash("Document added!");
  };

  // ─── NEW FEATURE HELPERS ───

  const createContact = () => {
    if (!newContactName.trim()) return;
    const id = "c" + Date.now();
    setContacts(prev => [...prev, { id, name: newContactName, email: newContactEmail, phone: null, context: newContactContext, tags: [], lastContact: "Just now", nextFollowUp: null, health: "strong", notes: "", interactions: [] }]);
    setNewContactName(""); setNewContactEmail(""); setShowNewContact(false);
    flash("Contact added!");
  };

  const addInteraction = () => {
    if (!newInteractionText.trim() || !activeContactId) return;
    const iid = "ci" + Date.now();
    setContacts(prev => prev.map(c => c.id === activeContactId ? { ...c, lastContact: "Just now", health: "strong", interactions: [{ id: iid, type: newInteractionType, text: newInteractionText, date: "Today" }, ...c.interactions] } : c));
    setNewInteractionText(""); setShowNewInteraction(false);
    flash("Interaction logged!");
  };

  const toggleHabit = (id) => {
    const today = new Date().toISOString().split("T")[0];
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const done = h.completions.includes(today);
      if (done) return { ...h, completions: h.completions.filter(d => d !== today), streak: Math.max(0, h.streak - 1) };
      addXp(10); flash("+10 XP — habit complete!");
      return { ...h, completions: [...h.completions, today], streak: h.streak + 1 };
    }));
  };

  const createHabit = () => {
    if (!newHabitName.trim()) return;
    const id = "h" + Date.now();
    setHabits(prev => [...prev, { id, name: newHabitName, icon: "Star", color: newHabitColor, frequency: newHabitFreq, completions: [], streak: 0 }]);
    setNewHabitName(""); setShowNewHabit(false);
    flash("Habit created!");
  };

  const createGoal = () => {
    if (!newGoalTitle.trim()) return;
    const id = "g" + Date.now();
    setGoals(prev => [...prev, { id, title: newGoalTitle, quarter: "Q1 2026", status: "in-progress", progress: 0, keyResults: [], linkedTaskIds: [] }]);
    setNewGoalTitle(""); setShowNewGoal(false);
    flash("Goal created!");
  };

  const createJournalEntry = () => {
    if (!newJournalContent.trim()) return;
    const id = "j" + Date.now();
    const today = new Date().toISOString().split("T")[0];
    setJournal(prev => [{ id, date: today, content: newJournalContent, mood: newJournalMood, energy: newJournalEnergy,
      wins: newJournalWins.trim() ? newJournalWins.split("\n").filter(Boolean) : [],
      blockers: newJournalBlockers.trim() ? newJournalBlockers.split("\n").filter(Boolean) : [],
    }, ...prev]);
    setNewJournalContent(""); setNewJournalMood(3); setNewJournalEnergy(3); setNewJournalWins(""); setNewJournalBlockers("");
    setShowNewJournal(false);
    flash("Journal entry saved!");
  };

  const createTimeBlock = () => {
    if (!newBlockTitle.trim()) return;
    const id = "tb" + Date.now();
    setTimeBlocks(prev => [...prev, { id, title: newBlockTitle, startHour: newBlockStart, endHour: newBlockEnd, taskId: null, color: "#5B8DEF", type: "work" }]);
    setNewBlockTitle(""); setShowNewBlock(false);
    flash("Time block added!");
  };

  const createBookmark = () => {
    if (!newBmTitle.trim()) return;
    const id = "bk" + Date.now();
    setBookmarks(prev => [...prev, { id, title: newBmTitle, url: newBmUrl, description: newBmDesc, tags: [], wsId: newBmWs || null, createdAt: "Just now" }]);
    setNewBmTitle(""); setNewBmUrl(""); setNewBmDesc(""); setNewBmWs(""); setShowNewBookmark(false);
    flash("Bookmark saved!");
  };

  const createWorkout = () => {
    if (!newWorkoutDuration) return;
    const id = "w" + Date.now();
    const today = new Date().toISOString().split("T")[0];
    setWorkouts(prev => [{ id, date: today, type: newWorkoutType, duration: parseInt(newWorkoutDuration), notes: newWorkoutNotes, calories: Math.round(parseInt(newWorkoutDuration) * 8) }, ...prev]);
    setNewWorkoutType("Run"); setNewWorkoutDuration(""); setNewWorkoutNotes(""); setShowNewWorkout(false);
    flash("Workout logged!");
  };

  const addInboxItem = () => {
    if (!newInboxText.trim()) return;
    const id = "ib" + Date.now();
    setInbox(prev => [{ id, text: newInboxText, createdAt: "Just now", triaged: false }, ...prev]);
    setNewInboxText("");
    flash("Captured!");
  };

  const triageInbox = (id) => {
    setInbox(prev => prev.map(item => item.id === id ? { ...item, triaged: true } : item));
    flash("Item triaged!");
  };

  const dismissInbox = (id) => {
    setInbox(prev => prev.filter(item => item.id !== id));
    flash("Item dismissed!");
  };

  const createTemplate = () => {
    if (!newTemplateName.trim()) return;
    const id = "tp" + Date.now();
    setTemplates(prev => [...prev, { id, name: newTemplateName, category: newTemplateCategory || "General", description: "", items: newTemplateItems.split("\n").filter(Boolean) }]);
    setNewTemplateName(""); setNewTemplateCategory(""); setNewTemplateItems(""); setShowNewTemplate(false);
    flash("Template created!");
  };

  const useTemplate = (tpl) => {
    tpl.items.forEach((item, i) => {
      const id = "t" + Date.now() + i;
      setTasks(ts => [...ts, {
        id, title: item, desc: `From template: ${tpl.name}`, priority: "medium",
        wsId: "personal", dueTime: null, dueDate: null, done: false, section: "afternoon",
        subtasks: [], notes: [], attachments: [], totalPomos: 1, donePomos: 0, reward: null,
      }]);
    });
    flash(`Created ${tpl.items.length} tasks from "${tpl.name}"!`);
  };

  const createWikiArticle = () => {
    if (!newWikiTitle.trim()) return;
    const id = "wk" + Date.now();
    setWiki(prev => [...prev, { id, title: newWikiTitle, category: newWikiCategory || "General", tags: [], content: newWikiContent, lastUpdated: "Just now" }]);
    setNewWikiTitle(""); setNewWikiCategory(""); setNewWikiContent(""); setShowNewWiki(false);
    flash("Article created!");
  };

  const saveWikiEdit = () => {
    setWiki(prev => prev.map(a => a.id === activeWikiId ? { ...a, content: editWikiContent, lastUpdated: "Just now" } : a));
    setEditingWiki(false);
    flash("Article updated!");
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
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()))
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
  const moodIcons = { 1: <Frown size={18} />, 2: <Frown size={18} />, 3: <Meh size={18} />, 4: <Smile size={18} />, 5: <Smile size={18} /> };
  const moodColors = { 1: "#EF4444", 2: "#F97316", 3: "#F59E0B", 4: "#22C55E", 5: "#5B8DEF" };
  const goalStatusColors = { "in-progress": "#5B8DEF", "on-track": "#22C55E", "at-risk": "#EF4444", "completed": "#A78BFA" };

  // ═══════════════════════════════════════
  //  SIDEBAR
  // ═══════════════════════════════════════
  const renderSidebar = () => (
    <div style={{
      width: collapsed ? 72 : 250, flexShrink: 0, height: "100%",
      background: "var(--sidebar-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderRight: "1px solid var(--sidebar-border)", display: "flex", flexDirection: "column",
      transition: "width 0.25s ease, background 0.3s ease", overflow: "hidden", zIndex: 10,
    }}>
      <div style={{ padding: collapsed ? "20px 20px 16px" : "20px 22px 16px", borderBottom: "1px solid var(--border-light)" }}>
        <div onClick={goToday} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Zap size={18} color="#fff" /></div>
          {!collapsed && <div>
            <div style={{ fontFamily: "var(--heading)", fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: -0.3 }}>OSVitae</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", fontWeight: 500, letterSpacing: 0.5 }}>Personal Suite</div>
          </div>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {/* Home section */}
        <div style={{ padding: "8px 12px 2px" }}>
          {!collapsed && <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, padding: "0 10px", marginBottom: 8, fontWeight: 600 }}>Home</div>}
          {[
            { icon: <Home size={18} />, label: "Today", id: "today" },
            { icon: <Inbox size={18} />, label: "Inbox", id: "inbox", badge: inbox.filter(i => !i.triaged).length },
            { icon: <Calendar size={18} />, label: "Calendar", id: "calendar" },
            { icon: <ClipboardList size={18} />, label: "All Tasks", id: "allTasks" },
            { icon: <Timer size={18} />, label: "Focus Timer", id: "timer" },
          ].map(nav => (
            <div key={nav.id} onClick={() => { setPage(nav.id); if(nav.id==="timer"){ setTimerTaskId(null); } setShowMobileSidebar(false); }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 18px" : "9px 14px",
              borderRadius: 12, cursor: "pointer", marginBottom: 2,
              background: page === nav.id ? "var(--primary-bg)" : "transparent",
              color: page === nav.id ? "var(--primary)" : "var(--muted)",
              fontFamily: "var(--body)", fontSize: 13, fontWeight: page === nav.id ? 700 : 500, transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (page !== nav.id) e.currentTarget.style.background = "var(--hover-bg)"; }}
              onMouseLeave={e => { if (page !== nav.id) e.currentTarget.style.background = page === nav.id ? "var(--primary-bg)" : "transparent"; }}
            >
              <span style={{ fontSize: 16 }}>{nav.icon}</span>
              {!collapsed && nav.label}
              {!collapsed && nav.id === "timer" && timerActive && (
                <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10, color: "var(--primary)", fontWeight: 700 }}>{fmt(timeLeft)}</span>
              )}
              {!collapsed && nav.badge > 0 && (
                <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, color: "#fff", background: "var(--danger)", borderRadius: 8, padding: "1px 6px", minWidth: 16, textAlign: "center" }}>{nav.badge}</span>
              )}
            </div>
          ))}
        </div>

        {/* Track section */}
        <div style={{ padding: "8px 12px 2px" }}>
          {!collapsed && <div onClick={() => setSidebarSections(s => ({ ...s, track: !s.track }))} style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, padding: "0 10px", marginBottom: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>Track<ChevronDown size={12} style={{ transition: "transform 0.2s", transform: sidebarSections.track ? "none" : "rotate(-90deg)" }} /></div>}
          {sidebarSections.track && [
            { icon: <Repeat size={18} />, label: "Habits", id: "habits" },
            { icon: <Flag size={18} />, label: "Goals", id: "goals" },
            { icon: <BookOpen size={18} />, label: "Journal", id: "journal" },
            { icon: <HeartPulse size={18} />, label: "Health", id: "health" },
            { icon: <Wallet size={18} />, label: "Finance", id: "finance" },
          ].map(nav => (
            <div key={nav.id} onClick={() => { setPage(nav.id); setShowMobileSidebar(false); }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 18px" : "9px 14px",
              borderRadius: 12, cursor: "pointer", marginBottom: 2,
              background: page === nav.id ? "var(--primary-bg)" : "transparent",
              color: page === nav.id ? "var(--primary)" : "var(--muted)",
              fontFamily: "var(--body)", fontSize: 13, fontWeight: page === nav.id ? 700 : 500, transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (page !== nav.id) e.currentTarget.style.background = "var(--hover-bg)"; }}
              onMouseLeave={e => { if (page !== nav.id) e.currentTarget.style.background = page === nav.id ? "var(--primary-bg)" : "transparent"; }}
            >
              <span style={{ fontSize: 16 }}>{nav.icon}</span>
              {!collapsed && nav.label}
            </div>
          ))}
        </div>

        {/* Connect & Library section */}
        <div style={{ padding: "8px 12px 2px" }}>
          {!collapsed && <div onClick={() => setSidebarSections(s => ({ ...s, library: !s.library }))} style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, padding: "0 10px", marginBottom: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>Library<ChevronDown size={12} style={{ transition: "transform 0.2s", transform: sidebarSections.library ? "none" : "rotate(-90deg)" }} /></div>}
          {sidebarSections.library && [
            { icon: <PenTool size={18} />, label: "Scratchpad", id: "scratchpad" },
            { icon: <Users size={18} />, label: "Contacts", id: "contacts" },
            { icon: <Bookmark size={18} />, label: "Bookmarks", id: "bookmarks" },
            { icon: <Layout size={18} />, label: "Templates", id: "templates" },
            { icon: <Library size={18} />, label: "Wiki", id: "wiki" },
            { icon: <RefreshCw size={18} />, label: "Review", id: "review" },
            { icon: <Trophy size={18} />, label: "Rewards", id: "rewards" },
          ].map(nav => (
            <div key={nav.id} onClick={() => { setPage(nav.id); setShowMobileSidebar(false); }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 18px" : "9px 14px",
              borderRadius: 12, cursor: "pointer", marginBottom: 2,
              background: page === nav.id ? "var(--primary-bg)" : "transparent",
              color: page === nav.id ? "var(--primary)" : "var(--muted)",
              fontFamily: "var(--body)", fontSize: 13, fontWeight: page === nav.id ? 700 : 500, transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (page !== nav.id) e.currentTarget.style.background = "var(--hover-bg)"; }}
              onMouseLeave={e => { if (page !== nav.id) e.currentTarget.style.background = page === nav.id ? "var(--primary-bg)" : "transparent"; }}
            >
              <span style={{ fontSize: 16 }}>{nav.icon}</span>
              {!collapsed && nav.label}
            </div>
          ))}
        </div>

        {/* Workspaces */}
        <div style={{ padding: "8px 12px 2px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", marginBottom: 8 }}>
            {!collapsed && <div onClick={() => setSidebarSections(s => ({ ...s, workspaces: !s.workspaces }))} style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, flex: 1 }}>Workspaces<ChevronDown size={12} style={{ transition: "transform 0.2s", transform: sidebarSections.workspaces ? "none" : "rotate(-90deg)" }} /></div>}
            {!collapsed && sidebarSections.workspaces && <div onClick={() => setShowNewWs(true)} style={{ width: 20, height: 20, borderRadius: 6, background: "var(--subtle-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", cursor: "pointer" }}><Plus size={13} /></div>}
          </div>
          {sidebarSections.workspaces && ws.map(w => (
            <div key={w.id} onClick={() => goWs(w.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "9px 18px" : "9px 14px",
              borderRadius: 12, cursor: "pointer", marginBottom: 2,
              background: page === "workspace" && activeWsId === w.id ? `${w.color}12` : "transparent",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = page === "workspace" && activeWsId === w.id ? `${w.color}18` : "var(--hover-bg)"}
              onMouseLeave={e => e.currentTarget.style.background = page === "workspace" && activeWsId === w.id ? `${w.color}12` : "transparent"}
            >
              <div style={{ width: 28, height: 28, borderRadius: 9, flexShrink: 0, background: `${w.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: w.color }}>{getWsIcon(w.icon, 14)}</div>
              {!collapsed && <>
                <span style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", fontWeight: 500, flex: 1 }}>{w.name}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{tasks.filter(t => t.wsId === w.id).length}</span>
              </>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border-light)" }}>
        <div onClick={() => { setPage("settings"); setShowMobileSidebar(false); }} style={{
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, padding: "8px 14px", borderRadius: 10, cursor: "pointer",
          color: page === "settings" ? "var(--primary)" : "var(--muted)",
          background: page === "settings" ? "var(--primary-bg)" : "transparent",
          fontFamily: "var(--body)", fontSize: 12, fontWeight: page === "settings" ? 700 : 500, marginBottom: 4,
        }}
          onMouseEnter={e => { if (page !== "settings") e.currentTarget.style.background = "var(--hover-bg)"; }}
          onMouseLeave={e => e.currentTarget.style.background = page === "settings" ? "var(--primary-bg)" : "transparent"}
        >
          <span style={{ fontSize: 13 }}><Settings size={14} /></span>
          {!collapsed && "Settings"}
        </div>
        <div onClick={toggleTheme} style={{
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, padding: "8px 14px", borderRadius: 10, cursor: "pointer", color: "var(--muted)", fontFamily: "var(--body)", fontSize: 12, marginBottom: 4,
        }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 13 }}>{themeName === "halo" ? <Sun size={14} /> : <Moon size={14} />}</span>
          {!collapsed && (themeName === "halo" ? "Default Theme" : "Halo Theme")}
        </div>
        <div onClick={() => setCollapsed(!collapsed)} style={{
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, padding: "8px 14px", borderRadius: 10, cursor: "pointer", color: "var(--muted)", fontFamily: "var(--body)", fontSize: 12,
        }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 13, transition: "transform 0.3s", transform: collapsed ? "rotate(180deg)" : "none" }}><ArrowLeft size={14} /></span>
          {!collapsed && "Collapse"}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  TASK ROW (reused in today & workspace & allTasks)
  // ═══════════════════════════════════════
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
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: TODAY DASHBOARD
  // ═══════════════════════════════════════
  const renderToday = () => (
    <div>
      <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap" }}>
        <div style={{ flex:1,minWidth:0 }}>
          <h1 className="today-heading" style={{ fontFamily:"var(--heading)",fontSize:32,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-1 }}>{greeting}</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:15,color:"var(--muted)",margin:"6px 0 0" }}>
            <strong style={{ color:"var(--text)" }}>{totalTasks - doneTasks} tasks</strong> and <strong style={{ color:"var(--text)" }}>{totalPomos - donePomos} pomodoros</strong> on your plate
          </p>
        </div>
        <div className="today-date" style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)",textAlign:"right",flexShrink:0 }}>
          <div style={{ fontWeight:700,color:"var(--text)",fontSize:14 }}>Friday, March 21</div>
          <div style={{ fontSize:11 }}>Week 12</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:24 }}>
        <Glass style={{ padding:18,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ position:"relative",width:48,height:48,flexShrink:0 }}>
            <Ring percent={(doneTasks/totalTasks)*100} size={48} stroke={4} color="#22C55E" />
            <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:"var(--text)" }}>{doneTasks}/{totalTasks}</div>
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>Tasks</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{Math.round((doneTasks/totalTasks)*100)}% complete</div>
          </div>
        </Glass>
        <Glass onClick={() => setPage("habits")} hover style={{ padding:18,display:"flex",alignItems:"center",gap:14,cursor:"pointer" }}>
          {(() => { const today = new Date().toISOString().split("T")[0]; const done = habits.filter(h => h.completions.includes(today)).length; const total = habits.length; return (<>
            <div style={{ position:"relative",width:48,height:48,flexShrink:0 }}>
              <Ring percent={total > 0 ? (done/total)*100 : 0} size={48} stroke={4} color="#22C55E" />
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:"var(--text)" }}>{done}/{total}</div>
            </div>
            <div>
              <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>Habits</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{total - done > 0 ? `${total - done} remaining` : "All done!"}</div>
            </div>
          </>); })()}
        </Glass>
        <Glass style={{ padding:18,display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:32, color:"var(--danger)", display:"flex", alignItems:"center", justifyContent:"center" }}><Flame size={32} /></span>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:22,fontWeight:800,color:"var(--text)" }}>{streak}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>day streak</div>
          </div>
        </Glass>
        <div onClick={() => { setTimerTaskId(null); setPage("timer"); }} style={{
          background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",borderRadius:16,padding:20,
          display:"flex",alignItems:"center",justifyContent:"center",gap:14,cursor:"pointer",color:"#fff",
          boxShadow:themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)",transition:"all 0.25s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 8px 32px rgba(74,222,128,0.4)" : "0 8px 32px rgba(99,102,241,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)"; }}
        >
          <div style={{ width:44,height:44,borderRadius:14,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}><Play fill="currentColor" size={20} /></div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"#fff" }}>Start Focus</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:11,color:"rgba(255,255,255,0.7)" }}>{timerActive ? fmt(timeLeft) : "25:00"}</div>
          </div>
        </div>
      </div>

      {/* Tasks + sidebar */}
      <div className="today-layout" style={{ display:"flex",gap:22 }}>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <h2 style={{ fontFamily:"var(--heading)",fontSize:19,color:"var(--text)",margin:0,fontWeight:700 }}>Today's Plan</h2>
            <Btn primary onClick={() => { setNewTaskWs("cs301"); setShowNewTask(true); }}>+ Add Task</Btn>
          </div>
          {[
            { label:"Morning",icon:<Sunrise size={18} />,time:"8 AM – 12 PM",section:"morning" },
            { label:"Afternoon",icon:<Sun size={18} />,time:"12 – 5 PM",section:"afternoon" },
            { label:"Evening",icon:<Moon size={18} />,time:"5 – 10 PM",section:"evening" },
          ].map((block,bi) => {
            const bt = tasks.filter(t => t.section === block.section);
            const bd = bt.filter(t => t.done).length;
            return (
              <div key={block.section} style={{ marginBottom:20 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"0 4px" }}>
                  <span style={{ fontSize:15 }}>{block.icon}</span>
                  <span style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{block.label}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{block.time}</span>
                  <div style={{ flex:1,height:1,background:"var(--card-border)",marginLeft:8 }} />
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>{bd}/{bt.length}</span>
                </div>
                {bt.map((task,i) => <TaskRow key={task.id} task={task} idx={bi*3+i} />)}
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="today-sidebar" style={{ width:280,flexShrink:0 }}>
          <Glass style={{ padding:18,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 12px",fontWeight:700 }}>Upcoming</h3>
            {tasks.filter(t=>t.dueDate&&!t.done).slice(0,3).map((t,i) => (
              <div key={t.id} onClick={() => goTask(t.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<2?"1px solid rgba(0,0,0,0.04)":"none",cursor:"pointer" }}>
                <div style={{ width:5,height:5,borderRadius:"50%",background:t.priority==="high"?"#EF4444":"#F59E0B",flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)",fontWeight:600 }}>{t.title}</div>
                </div>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,fontWeight:600,color:t.priority==="high"?"#EF4444":"var(--muted)" }}>{t.dueDate}</span>
              </div>
            ))}
          </Glass>

          {/* Today's Habits */}
          <Glass style={{ padding:18,marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
              <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:0,fontWeight:700 }}>Today's Habits</h3>
              <span onClick={() => setPage("habits")} style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--primary)",cursor:"pointer",fontWeight:600 }}>View all</span>
            </div>
            {(() => { const today = new Date().toISOString().split("T")[0]; return habits.map(h => {
              const done = h.completions.includes(today);
              return (
                <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"6px 0",cursor:"pointer",borderBottom:"1px solid var(--subtle-bg)" }}>
                  <div style={{ width:18,height:18,borderRadius:6,background:done?h.color:"transparent",border:done?"none":`1.5px solid var(--checkbox-border)`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0 }}>{done && <Check size={10} color="#fff" />}</div>
                  <span style={{ fontFamily:"var(--body)",fontSize:12,color:done?"var(--muted)":"var(--text)",textDecoration:done?"line-through":"none",flex:1 }}>{h.name}</span>
                  <div style={{ display:"flex",alignItems:"center",gap:3 }}><Flame size={10} color={h.color} /><span style={{ fontFamily:"var(--mono)",fontSize:9,color:h.color,fontWeight:700 }}>{h.streak}</span></div>
                </div>
              );
            }); })()}
          </Glass>

          {/* Inbox alert */}
          {(() => { const untriaged = inbox.filter(i => !i.triaged).length; return untriaged > 0 ? (
            <Glass onClick={() => setPage("inbox")} hover style={{ padding:14,marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.12)" }}>
              <div style={{ width:32,height:32,borderRadius:10,background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center" }}><Inbox size={16} color="#EF4444" /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{untriaged} inbox item{untriaged > 1 ? "s" : ""}</div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>waiting to be triaged</div>
              </div>
              <ChevronRight size={14} color="var(--muted)" />
            </Glass>
          ) : null; })()}

          {/* Reconnect */}
          {(() => { const fading = contacts.filter(c => c.health === "fading"); return fading.length > 0 ? (
            <Glass style={{ padding:14,marginBottom:14 }}>
              <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 10px",fontWeight:700 }}>Reconnect</h3>
              {fading.slice(0,3).map(c => (
                <div key={c.id} onClick={() => goContact(c.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"6px 0",cursor:"pointer" }}>
                  <div style={{ width:24,height:24,borderRadius:7,background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--danger)",fontFamily:"var(--heading)",fontSize:9,fontWeight:700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
                  <span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)",flex:1,fontWeight:500 }}>{c.name}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>{c.lastContact}</span>
                </div>
              ))}
            </Glass>
          ) : null; })()}

          <Glass style={{ padding:18,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 10px",fontWeight:700 }}>Today's Intention</h3>
            {editingIntention ? (
              <div>
                <textarea value={intentionText} onChange={e => setIntentionText(e.target.value)} style={{ ...inputStyle, minHeight:70,resize:"vertical",fontStyle:"italic" }} />
                <Btn small primary style={{ marginTop:8 }} onClick={() => { setEditingIntention(false); flash("Intention saved!"); }}>Save</Btn>
              </div>
            ) : (
              <div>
                <div style={{ background:"var(--input-bg)",borderRadius:10,padding:14,border:"1px dashed rgba(0,0,0,0.08)",fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)",lineHeight:1.7,fontStyle:"italic" }}>"{intentionText}"</div>
                <div onClick={() => setEditingIntention(true)} style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--primary)",cursor:"pointer",marginTop:8,fontWeight:600 }}>Edit intention</div>
              </div>
            )}
          </Glass>
          <Glass style={{ padding:18,background:"linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.04))",border:"1px solid rgba(251,191,36,0.15)" }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 8px",fontWeight:700 }}>Today's Reward</h3>
            <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)" }}>Finish all tasks: <strong>Movie night!</strong></div>
            <div style={{ marginTop:10,height:5,background:"var(--card-border)",borderRadius:6,overflow:"hidden" }}>
              <div style={{ width:`${(doneTasks/totalTasks)*100}%`,height:"100%",borderRadius:6,background:"linear-gradient(90deg, #FBBF24, #F59E0B)",transition:"width 0.5s" }} />
            </div>
            <div style={{ fontFamily:"var(--mono)",fontSize:9.5,color:"var(--muted)",marginTop:6,textAlign:"center" }}>{doneTasks}/{totalTasks}</div>
          </Glass>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  PAGE: WORKSPACE
  // ═══════════════════════════════════════
  const renderWorkspace = () => {
    const wsTasks = tasks.filter(t => t.wsId === activeWsId);
    const taskNotes = wsTasks.flatMap(t => t.notes.map(n => ({ ...n, taskTitle: t.title, taskId: t.id, source: "task" })));
    const standaloneNotes = wsNotes.filter(n => n.wsId === activeWsId).map(n => ({ ...n, source: "workspace" }));
    const allNotes = [...standaloneNotes, ...taskNotes];
    const taskAttachments = wsTasks.flatMap(t => t.attachments.map(a => ({ ...a, taskTitle: t.title, taskId: t.id, source: "task" })));
    const standaloneDocs = wsDocs.filter(d => d.wsId === activeWsId).map(d => ({ ...d, source: "workspace" }));
    const allDocs = [...standaloneDocs, ...taskAttachments];
    const getDocIcon = (iconKey) => {
      const map = { FileEdit: <FileEdit size={20} />, FileText: <FileText size={20} />, FileCode2: <FileCode2 size={20} />, ImageIcon: <ImageIcon size={20} /> };
      return map[iconKey] || <FileText size={20} />;
    };
    return (
      <div>
        <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20 }}>
          <div style={{ width:48,height:48,borderRadius:14,background:`linear-gradient(135deg, ${activeWs.color}, ${activeWs.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 4px 16px ${activeWs.color}33` }}>{getWsIcon(activeWs.icon, 24)}</div>
          <div style={{ flex:1 }}>
            <h1 style={{ fontFamily:"var(--heading)",fontSize:24,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-0.5 }}>{activeWs.name}</h1>
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>{wsTasks.length} tasks · {allNotes.length} notes · {allDocs.length} files</div>
          </div>
          <Btn primary color={activeWs.color} onClick={() => { setNewTaskWs(activeWsId); setShowNewTask(true); }}>+ Add Task</Btn>
        </div>
        <div style={{ display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid var(--border-light)" }}>
          {["Tasks","Notes","Documents"].map(tab => (
            <button key={tab} onClick={() => setWsTab(tab)} style={{
              background:"none",border:"none",borderBottom:wsTab===tab?`2.5px solid ${activeWs.color}`:"2.5px solid transparent",
              padding:"10px 18px",fontFamily:"var(--body)",fontSize:14,fontWeight:wsTab===tab?700:500,
              color:wsTab===tab?"var(--text)":"var(--muted)",cursor:"pointer",marginBottom:-1,
            }}>{tab}</button>
          ))}
        </div>
        {wsTab === "Tasks" && wsTasks.map((t,i) => <TaskRow key={t.id} task={t} idx={i} showWs={false} />)}
        {wsTab === "Notes" && (
          <div>
            <div style={{ marginBottom:14 }}><Btn primary color={activeWs.color} onClick={() => setShowWsNote(true)}>+ New Note</Btn></div>
            {allNotes.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:20,textAlign:"center" }}>No notes yet.</div>}
            <div className="notes-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              {allNotes.map((n,i) => (
                <Glass key={n.id} hover style={{ padding:16,cursor:"pointer" }} onClick={() => n.taskId ? goTask(n.taskId) : null}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                    <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{n.title || n.taskTitle}</div>
                    <span style={{ fontFamily:"var(--mono)",fontSize:9,color:n.source==="task"?activeWs.color:"var(--muted)",fontWeight:600,background:n.source==="task"?`${activeWs.color}10`:"rgba(0,0,0,0.04)",padding:"2px 8px",borderRadius:6 }}>{n.source === "task" ? "From task" : "Standalone"}</span>
                  </div>
                  <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--muted)",lineHeight:1.6 }}>{n.text}</div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:8 }}>{n.time}</div>
                </Glass>
              ))}
            </div>
          </div>
        )}
        {wsTab === "Documents" && (
          <div>
            <div style={{ marginBottom:14 }}><Btn primary color={activeWs.color} onClick={() => setShowWsDoc(true)}>+ Add Document</Btn></div>
            {allDocs.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:20,textAlign:"center" }}>No documents yet.</div>}
            {allDocs.map((a,i) => (
              <Glass key={a.id || i} hover style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 18px",marginBottom:8,cursor:"pointer" }} onClick={() => a.taskId ? goTask(a.taskId) : null}>
                <div style={{ width:40,height:40,borderRadius:10,background:"var(--subtle-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)" }}>{typeof a.icon === "string" ? getDocIcon(a.icon) : a.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{a.name}</div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{a.size}{a.taskTitle ? ` · from "${a.taskTitle}"` : " · standalone"}</div>
                </div>
                <span style={{ background:"var(--subtle-bg)",padding:"3px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>{a.type}</span>
              </Glass>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: TASK DETAIL
  // ═══════════════════════════════════════
  const renderTask = () => {
    if (!activeTask) return <div>Task not found</div>;
    const w = ws.find(x => x.id === activeTask.wsId);
    const subDone = activeTask.subtasks.filter(s => s.done).length;
    return (
      <div style={{ maxWidth:760 }}>
        <div onClick={() => setPage(page === "task" ? "today" : page)} style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--primary)",cursor:"pointer",marginBottom:16,fontWeight:600 }}>← Back</div>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
          <div style={{ width:10,height:10,borderRadius:"50%",background:pColors[activeTask.priority] }} />
          <span style={{ fontFamily:"var(--mono)",fontSize:10,color:pColors[activeTask.priority],fontWeight:700,textTransform:"uppercase",letterSpacing:1 }}>{activeTask.priority} priority</span>
          <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:`${w?.color}14`,padding:"2px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:w?.color,fontWeight:600 }}>{getWsIcon(w?.icon, 10)} {w?.name}</span>
        </div>
        <h1 style={{ fontFamily:"var(--heading)",fontSize:26,color:"var(--text)",margin:"0 0 6px",fontWeight:800,letterSpacing:-0.5 }}>{activeTask.title}</h1>
        <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",lineHeight:1.6,margin:"0 0 20px" }}>{activeTask.desc}</p>

        <div style={{ display:"flex",gap:10,marginBottom:24 }}>
          <Btn primary color={w?.color} onClick={() => startFocus(activeTask.id)}>Start Focus Session</Btn>
          <Btn onClick={() => toggleTask(activeTask.id)}>{activeTask.done ? "Mark Incomplete" : "Mark Complete"}</Btn>
        </div>

        <Glass style={{ padding:18,marginBottom:16,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ display:"flex",gap:6 }}>
            {Array.from({ length: activeTask.totalPomos }, (_, i) => (
              <div key={i} style={{
                width:32,height:32,borderRadius:10,
                background: i < activeTask.donePomos ? `linear-gradient(135deg, ${w?.color}, ${w?.color}88)` : "rgba(0,0,0,0.05)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
                color: i < activeTask.donePomos ? "#fff" : "var(--muted)",
              }}>{i < activeTask.donePomos ? <Timer size={24} /> : i+1}</div>
            ))}
          </div>
          <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{activeTask.donePomos}/{activeTask.totalPomos} pomodoros</span>
        </Glass>

        {activeTask.subtasks.length > 0 && (
          <Glass style={{ padding:20,marginBottom:16 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 14px",fontWeight:700 }}>Steps</h3>
            {activeTask.subtasks.map((s,i) => (
              <div key={s.id} onClick={() => toggleSubtask(activeTask.id, s.id)} style={{
                display:"flex",alignItems:"center",gap:12,padding:"10px 0",cursor:"pointer",
                borderBottom: i < activeTask.subtasks.length-1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                opacity: s.done ? 0.5 : 1,
              }}>
                <div style={{
                  width:22,height:22,borderRadius:7,flexShrink:0,
                  background:s.done?"#22C55E":"transparent",border:s.done?"none":"2px solid rgba(0,0,0,0.12)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",transition:"all 0.2s",
                }}>{s.done && <Check size={12} />}</div>
                <span style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--text)",flex:1,textDecoration:s.done?"line-through":"none" }}>{s.text}</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:11,color:s.done?"#22C55E":"var(--muted)",fontWeight:600 }}>+{s.xp} XP</span>
              </div>
            ))}
            <div style={{ marginTop:12,fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{subDone}/{activeTask.subtasks.length} steps complete</div>
          </Glass>
        )}

        <Glass style={{ padding:20,marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:0,fontWeight:700 }}>Notes</h3>
            <Btn small primary color="#5B8DEF" onClick={() => setShowNewNote(true)}>+ Add Note</Btn>
          </div>
          {activeTask.notes.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:"10px 0" }}>No notes yet.</div>}
          {activeTask.notes.map(n => (
            <div key={n.id} style={{ background:"var(--input-bg)",borderRadius:10,padding:14,marginBottom:8,border:"1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",lineHeight:1.7 }}>{n.text}</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:6 }}>{n.time}</div>
            </div>
          ))}
        </Glass>

        <Glass style={{ padding:20 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:0,fontWeight:700 }}>Attachments</h3>
            <Btn small onClick={() => flash("File upload coming in the full build!")}><Paperclip size={14} style={{ marginRight: 4 }} /> Upload</Btn>
          </div>
          {activeTask.attachments.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:"10px 0" }}>No attachments yet.</div>}
          <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
            {activeTask.attachments.map((a,i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 16px",background:"var(--input-bg)",borderRadius:12,border:"1px solid var(--border-light)",cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--subtle-bg)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--input-bg)"}
              >
                <span style={{ fontSize:20 }}>{a.icon}</span>
                <div>
                  <div style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{a.name}</div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{a.size}</div>
                </div>
              </div>
            ))}
          </div>
        </Glass>

        {activeTask.reward && (
          <Glass style={{ marginTop:16,padding:18,background:"linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.04))",border:"1px solid rgba(251,191,36,0.15)" }}>
            <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:4 }}>After this task...</div>
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)" }}> {activeTask.reward}</div>
          </Glass>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: TIMER
  // ═══════════════════════════════════════
  const renderTimer = () => {
    const w = timerTask ? ws.find(x => x.id === timerTask.wsId) : null;
    const currentBreakDuration = (sessionCount + 1) % CYCLE_LENGTH === 0 ? LONG_BREAK : SHORT_BREAK;
    const pct = isBreak ? ((currentBreakDuration - timeLeft)/currentBreakDuration)*100 : ((WORK_DURATION - timeLeft)/WORK_DURATION)*100;
    const nextSub = timerTask?.subtasks.find(s => !s.done);
    const isLongBreak = isBreak && timeLeft > SHORT_BREAK;
    const sessionInCycle = (sessionCount % CYCLE_LENGTH) + 1;
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center",position:"relative" }}>
        <div onClick={goToday} style={{ position:"absolute",top:0,left:0,fontFamily:"var(--body)",fontSize:13,color:"var(--primary)",cursor:"pointer",fontWeight:600 }}>← Exit Focus</div>

        <div style={{ position:"relative",width:240,height:240,marginBottom:30 }}>
          <Ring percent={pct} size={240} stroke={12} color={isBreak ? "#22C55E" : (w?.color || "#5B8DEF")} />
          <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:56,fontWeight:700,color:"var(--text)",letterSpacing:-3 }}>{fmt(timeLeft)}</div>
            <div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)" }}>{isBreak ? (isLongBreak ? "Long Break" : "Short Break") : "Deep Focus"}</div>
          </div>
        </div>

        {timerTask && (
          <div style={{ marginBottom:6 }}>
            <div style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:700,color:"var(--text)" }}>{timerTask.title}</div>
            {nextSub && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginTop:4 }}>Current step: {nextSub.text}</div>}
          </div>
        )}
        {!timerTask && <div style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:700,color:"var(--text)",marginBottom:6 }}>Free Focus Session</div>}

        <div style={{ display:"flex",gap:12,marginTop:20 }}>
          <div onClick={() => setTimerActive(!timerActive)} style={{
            width:64,height:64,borderRadius:18,cursor:"pointer",
            background: timerActive ? "rgba(99,102,241,0.12)" : (themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)"),
            backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
            color: timerActive ? "var(--primary)" : "#fff",
            border: timerActive ? "1px solid rgba(99,102,241,0.2)" : "none",
            boxShadow: timerActive ? "none" : "0 4px 20px rgba(99,102,241,0.3)",
            transition:"all 0.2s",
          }}>{timerActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}</div>
          <div onClick={() => { setTimerActive(false); setIsBreak(false); setTimeLeft(WORK_DURATION); flash("Timer reset"); }} style={{
            width:64,height:64,borderRadius:18,background:"rgba(255,255,255,0.5)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.6)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",color:"var(--text)",
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.6)",
          }}><RotateCcw size={20} /></div>
          <div onClick={() => { setTimerActive(false); if(!isBreak){ const nextBreakDuration = (sessionCount + 1) % CYCLE_LENGTH === 0 ? LONG_BREAK : SHORT_BREAK; setIsBreak(true); setTimeLeft(nextBreakDuration); flash("Skipped to break"); } else { setIsBreak(false); setTimeLeft(WORK_DURATION); flash("Break skipped"); } }} style={{
            width:64,height:64,borderRadius:18,background:"rgba(255,255,255,0.5)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.6)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",color:"var(--text)",
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.6)",
          }}><SkipForward size={20} /></div>
        </div>

        <div style={{ position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>
            {timerTask ? `${timerTask.donePomos}/${timerTask.totalPomos} pomodoros` : "Free session"} · Session {sessionInCycle} of {CYCLE_LENGTH} · +15 XP
          </span>
          <div style={{ display:"flex",alignItems:"center",gap:6 }}>
            <span style={{ display: "flex" }}><Flame size={14} color="#EF4444" /></span>
            <span style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--danger)",fontWeight:700 }}>{streak}</span>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: REWARDS
  // ═══════════════════════════════════════
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
        .eq("id", (await supabase.auth.getUser()).data.user.id);
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
      body: { action: "update", selected_calendar_id: selectedCalendarId, selected_reminders_id: selectedRemindersId },
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

  const syncAll = async () => {
    setSyncStatus("syncing");
    setSyncError(null);
    try {
      const [calRes, remRes] = await Promise.allSettled([
        supabase.functions.invoke("caldav-sync-calendar", { body: {} }),
        supabase.functions.invoke("caldav-sync-reminders", { body: {} }),
      ]);
      const errors = [calRes, remRes]
        .filter(r => r.status === "rejected" || r.value?.data?.error)
        .map(r => r.status === "rejected" ? r.reason?.message : r.value?.data?.error);
      if (errors.length > 0) {
        setSyncError(errors.join("; "));
        setSyncStatus("error");
      } else {
        setSyncStatus("success");
        setLastSyncAt(new Date().toISOString());
        flash("Sync complete!");
      }
    } catch (e) {
      setSyncError(e.message);
      setSyncStatus("error");
    }
  };

  useEffect(() => { fetchAppleStatus(); fetchProfile(); }, []);

  // ─── RENDER SETTINGS ───

  const renderSettings = () => (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontFamily:"var(--heading)",fontSize:22,fontWeight:800,color:"var(--text)",marginBottom:24 }}>Settings</h2>

      {/* Profile */}
      <Glass style={{ padding:24,marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <User size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>Profile</div>
            <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>Your personal information</div>
          </div>
        </div>

        <div style={{ display:"flex",gap:12,marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Full Name</label>
            <input value={profileData.full_name} onChange={e => setProfileData(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Date of Birth</label>
            <input type="date" value={profileData.date_of_birth} onChange={e => setProfileData(p => ({ ...p, date_of_birth: e.target.value }))} style={inputStyle} />
          </div>
        </div>

        <div style={{ display:"flex",gap:12,marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Email</label>
            <input type="email" value={profileData.email} onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Phone</label>
            <input type="tel" value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Address Line 1</label>
          <input value={profileData.address_line1} onChange={e => setProfileData(p => ({ ...p, address_line1: e.target.value }))} placeholder="Street address" style={inputStyle} />
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Address Line 2</label>
          <input value={profileData.address_line2} onChange={e => setProfileData(p => ({ ...p, address_line2: e.target.value }))} placeholder="Apt, suite, unit, etc. (optional)" style={inputStyle} />
        </div>

        <div style={{ display:"flex",gap:12,marginBottom:12 }}>
          <div style={{ flex:2 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>City</label>
            <input value={profileData.city} onChange={e => setProfileData(p => ({ ...p, city: e.target.value }))} placeholder="City" style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>State</label>
            <input value={profileData.state} onChange={e => setProfileData(p => ({ ...p, state: e.target.value }))} placeholder="State" style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>ZIP</label>
            <input value={profileData.zip} onChange={e => setProfileData(p => ({ ...p, zip: e.target.value }))} placeholder="ZIP" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Country</label>
          <input value={profileData.country} onChange={e => setProfileData(p => ({ ...p, country: e.target.value }))} placeholder="Country" style={inputStyle} />
        </div>

        <button onClick={saveProfile} disabled={profileSaving} style={{
          padding:"10px 20px",borderRadius:10,border:"none",
          background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"#fff",
          fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
          display:"flex",alignItems:"center",gap:8,
          opacity: profileSaving ? 0.6 : 1,
        }}>
          <Save size={14} />
          {profileSaving ? "Saving..." : "Save Profile"}
        </button>
      </Glass>

      {/* Apple Calendar Connection */}
      <Glass style={{ padding:24,marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"#000",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M13.21 9.48c-.02-1.89 1.55-2.8 1.62-2.84-.88-1.29-2.25-1.47-2.74-1.49-1.16-.12-2.28.69-2.87.69-.6 0-1.51-.67-2.49-.65-1.27.02-2.46.75-3.11 1.9-1.34 2.32-.34 5.74.95 7.62.64.92 1.4 1.95 2.39 1.91.97-.04 1.33-.62 2.49-.62 1.16 0 1.49.62 2.49.6 1.03-.02 1.69-.93 2.32-1.85.74-1.06 1.04-2.1 1.05-2.15-.02-.01-2.01-.77-2.1-3.12zM11.3 3.88c.52-.64.87-1.52.78-2.4-.75.03-1.68.51-2.22 1.14-.48.56-.91 1.47-.8 2.33.84.07 1.71-.43 2.24-1.07z" fill="white"/></svg>
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>Apple Calendar & Reminders</div>
            <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>
              {appleConnected ? "Connected" : "Not connected"}
            </div>
          </div>
        </div>

        {!appleConnected && !showAppleConnect && (
          <button onClick={() => setShowAppleConnect(true)} style={{
            padding:"10px 20px",borderRadius:10,border:"none",
            background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"#fff",
            fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
          }}>Connect Apple Calendar</button>
        )}

        {showAppleConnect && (
          <div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Apple ID</label>
              <input value={appleIdInput} onChange={e => setAppleIdInput(e.target.value)} placeholder="you@icloud.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>App-Specific Password</label>
              <input type="password" value={appleAppPassword} onChange={e => setAppleAppPassword(e.target.value)} placeholder="xxxx-xxxx-xxxx-xxxx" style={inputStyle} />
              <div style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--muted)",marginTop:4 }}>
                Generate one at appleid.apple.com → Sign-In and Security → App-Specific Passwords
              </div>
            </div>
            {syncError && <div style={{ fontFamily:"var(--body)",fontSize:12,color:"#EF4444",marginBottom:12 }}>{syncError}</div>}
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={connectApple} disabled={appleConnecting} style={{
                padding:"10px 20px",borderRadius:10,border:"none",
                background:"#000",color:"#fff",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
                opacity: appleConnecting ? 0.6 : 1,
              }}>{appleConnecting ? "Connecting..." : "Connect"}</button>
              <button onClick={() => { setShowAppleConnect(false); setSyncError(null); }} style={{
                padding:"10px 20px",borderRadius:10,border:"1px solid var(--border)",
                background:"transparent",color:"var(--text)",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
              }}>Cancel</button>
            </div>
          </div>
        )}

        {appleConnected && (
          <div>
            {/* Calendar Selection */}
            {(appleCalendars.length > 0 || appleReminderLists.length > 0) && (
              <div style={{ marginBottom:16 }}>
                {appleCalendars.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Sync Events From</label>
                    <select value={selectedCalendarId} onChange={e => setSelectedCalendarId(e.target.value)} style={{ ...inputStyle, cursor:"pointer" }}>
                      <option value="">Select a calendar...</option>
                      {appleCalendars.map(c => <option key={c.id} value={c.href}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {appleReminderLists.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Sync Reminders From</label>
                    <select value={selectedRemindersId} onChange={e => setSelectedRemindersId(e.target.value)} style={{ ...inputStyle, cursor:"pointer" }}>
                      <option value="">Select a list...</option>
                      {appleReminderLists.map(c => <option key={c.id} value={c.href}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={saveCalendarSelection} style={{
                  padding:"8px 16px",borderRadius:8,border:"none",
                  background:"var(--primary)",color:"#fff",
                  fontFamily:"var(--body)",fontSize:12,fontWeight:600,cursor:"pointer",marginRight:8,
                }}>Save Selection</button>
                <button onClick={rediscoverCalendars} style={{
                  padding:"8px 16px",borderRadius:8,border:"1px solid var(--border)",
                  background:"transparent",color:"var(--text)",
                  fontFamily:"var(--body)",fontSize:12,fontWeight:600,cursor:"pointer",
                }}>Refresh List</button>
              </div>
            )}

            {appleCalendars.length === 0 && (
              <button onClick={rediscoverCalendars} style={{
                padding:"8px 16px",borderRadius:8,border:"1px solid var(--border)",
                background:"transparent",color:"var(--text)",
                fontFamily:"var(--body)",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:16,
              }}>Load Calendars</button>
            )}

            {/* Sync Controls */}
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingTop:12,borderTop:"1px solid var(--border-light)" }}>
              <button onClick={syncAll} disabled={syncStatus === "syncing"} style={{
                padding:"10px 20px",borderRadius:10,border:"none",
                background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"#fff",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
                display:"flex",alignItems:"center",gap:8,
                opacity: syncStatus === "syncing" ? 0.6 : 1,
              }}>
                <RefreshCw size={14} style={{ animation: syncStatus === "syncing" ? "spin 1s linear infinite" : "none" }} />
                {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
              </button>
              {lastSyncAt && (
                <span style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--muted)" }}>
                  Last synced: {new Date(lastSyncAt).toLocaleString()}
                </span>
              )}
            </div>
            {syncError && <div style={{ fontFamily:"var(--body)",fontSize:12,color:"#EF4444",marginBottom:12 }}>{syncError}</div>}

            {/* Disconnect */}
            <button onClick={disconnectApple} style={{
              padding:"8px 16px",borderRadius:8,border:"1px solid #EF4444",
              background:"transparent",color:"#EF4444",
              fontFamily:"var(--body)",fontSize:12,fontWeight:600,cursor:"pointer",
            }}>Disconnect</button>
          </div>
        )}
      </Glass>
    </div>
  );

  const renderRewards = () => (
    <div>
      <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:"0 0 4px",fontWeight:800,letterSpacing:-0.8 }}>Your Progress</h1>
      <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"0 0 24px" }}>Every step forward earns XP. Consistency unlocks rewards.</p>

      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:24 }}>
        <span style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--xp-color)",fontWeight:700 }}>LVL {level}</span>
        <div style={{ flex:1,height:8,background:"var(--card-border)",borderRadius:8,overflow:"hidden" }}>
          <div style={{ width:`${(xp/500)*100}%`,height:"100%",borderRadius:8,background:themeName === "halo" ? "linear-gradient(90deg, #FFB000, #4ADE80)" : "linear-gradient(90deg, #A78BFA, #6366F1, #818CF8)",transition:"width 0.8s" }} />
        </div>
        <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{xp}/500 XP</span>
      </div>

      <div className="rewards-stats" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:28 }}>
        {[
          { icon:<Flame size={24} />,label:"Current Streak",value:`${streak} days`,sub:"Best: 12 days" },
          { icon:<Timer size={24} />,label:"Total Pomodoros",value:`${totalPomosEver}`,sub:`This week: ${donePomos + 18}` },
          { icon:<CheckCircle2 size={24} />,label:"Tasks Completed",value:`${totalTasksDone}`,sub:`This week: ${doneTasks + 4}` },
        ].map((s,i) => (
          <Glass key={i} style={{ padding:20,textAlign:"center" }}>
            <div style={{ fontSize:28,marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>{s.label}</div>
            <div style={{ fontFamily:"var(--heading)",fontSize:24,fontWeight:800,color:"var(--text)" }}>{s.value}</div>
            <div style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--muted)",marginTop:4 }}>{s.sub}</div>
          </Glass>
        ))}
      </div>

      <h2 style={{ fontFamily:"var(--heading)",fontSize:18,color:"var(--text)",margin:"0 0 16px",fontWeight:700 }}>Achievements</h2>
      <div className="achievements-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        {ACHIEVEMENTS.map(b => (
          <Glass key={b.id} hover style={{ display:"flex",alignItems:"center",gap:14,padding:16,opacity:b.earned?1:0.4 }}>
            <div style={{
              width:44,height:44,borderRadius:12,
              background:b.earned?"linear-gradient(135deg, rgba(253,246,227,0.8), rgba(245,230,200,0.8))":"rgba(0,0,0,0.04)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
              filter:b.earned?"none":"grayscale(1)",
            }}>{b.icon}</div>
            <div>
              <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{b.title}</div>
              <div style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--muted)" }}>{b.desc}</div>
            </div>
            {b.earned && <span style={{ marginLeft:"auto",fontFamily:"var(--mono)",fontSize:9,color:"var(--success)",fontWeight:700 }}>EARNED</span>}
          </Glass>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  PAGE: ALL TASKS
  // ═══════════════════════════════════════
  const renderAllTasks = () => (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>All Tasks</h1>
        <Btn primary onClick={() => setShowNewTask(true)}>+ New Task</Btn>
      </div>
      {filteredTasks.map((t,i) => <TaskRow key={t.id} task={t} idx={i} />)}
    </div>
  );

  // ═══════════════════════════════════════
  //  PAGE: CONTACTS
  // ═══════════════════════════════════════
  const renderContacts = () => (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Contacts</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{contacts.length} people · {contacts.filter(c => c.health === "fading").length} need attention</p>
        </div>
        <Btn primary onClick={() => setShowNewContact(true)}>+ Add Contact</Btn>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        {contacts.map((c, i) => (
          <Glass key={c.id} hover onClick={() => goContact(c.id)} style={{ padding:18,cursor:"pointer",animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
              <div style={{ width:40,height:40,borderRadius:12,background:`linear-gradient(135deg, ${healthColors[c.health]}, ${healthColors[c.health]}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"var(--heading)",fontSize:16,fontWeight:700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{c.name}</div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{c.context}</div>
              </div>
              <div style={{ width:8,height:8,borderRadius:"50%",background:healthColors[c.health] }} title={healthLabels[c.health]} />
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
              {c.tags.map(tag => <span key={tag} style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",background:"var(--subtle-bg)",padding:"2px 8px",borderRadius:6 }}>{tag}</span>)}
            </div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>
              <span>Last: {c.lastContact}</span>
              {c.nextFollowUp && <span style={{ color:"#F59E0B",fontWeight:600 }}>Follow up: {c.nextFollowUp}</span>}
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  PAGE: CONTACT DETAIL
  // ═══════════════════════════════════════
  const renderContactDetail = () => {
    if (!activeContact) return <div>Contact not found</div>;
    const c = activeContact;
    return (
      <div style={{ maxWidth:760 }}>
        <div onClick={() => setPage("contacts")} style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--primary)",cursor:"pointer",marginBottom:16,fontWeight:600 }}>← Back to Contacts</div>
        <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:24 }}>
          <div style={{ width:56,height:56,borderRadius:16,background:`linear-gradient(135deg, ${healthColors[c.health]}, ${healthColors[c.health]}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"var(--heading)",fontSize:22,fontWeight:700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
          <div style={{ flex:1 }}>
            <h1 style={{ fontFamily:"var(--heading)",fontSize:24,color:"var(--text)",margin:0,fontWeight:800 }}>{c.name}</h1>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:4 }}>
              <span style={{ fontFamily:"var(--mono)",fontSize:11,color:healthColors[c.health],fontWeight:600,background:`${healthColors[c.health]}14`,padding:"2px 10px",borderRadius:8 }}>{healthLabels[c.health]}</span>
              <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{c.context}</span>
            </div>
          </div>
        </div>

        <div className="rewards-stats" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20 }}>
          {c.email && <Glass style={{ padding:14,display:"flex",alignItems:"center",gap:10 }}><Mail size={16} color="var(--muted)" /><span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)" }}>{c.email}</span></Glass>}
          {c.phone && <Glass style={{ padding:14,display:"flex",alignItems:"center",gap:10 }}><Phone size={16} color="var(--muted)" /><span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)" }}>{c.phone}</span></Glass>}
          {c.nextFollowUp && <Glass style={{ padding:14,display:"flex",alignItems:"center",gap:10,background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.15)" }}><Clock size={16} color="#F59E0B" /><span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)",fontWeight:600 }}>Follow up: {c.nextFollowUp}</span></Glass>}
        </div>

        {c.notes && <Glass style={{ padding:16,marginBottom:20 }}>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",lineHeight:1.7 }}>{c.notes}</div>
        </Glass>}

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <h2 style={{ fontFamily:"var(--heading)",fontSize:18,color:"var(--text)",margin:0,fontWeight:700 }}>Interactions</h2>
          <Btn primary small onClick={() => setShowNewInteraction(true)}>+ Log Interaction</Btn>
        </div>
        {c.interactions.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:20,textAlign:"center" }}>No interactions logged yet.</div>}
        {c.interactions.map(int => (
          <Glass key={int.id} style={{ padding:14,marginBottom:8,display:"flex",alignItems:"flex-start",gap:12 }}>
            <div style={{ width:32,height:32,borderRadius:10,background:"var(--subtle-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",flexShrink:0 }}>
              {int.type === "meeting" ? <Users size={16} /> : int.type === "email" ? <Mail size={16} /> : <MessageSquare size={16} />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",lineHeight:1.6 }}>{int.text}</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:4 }}>{int.type} · {int.date}</div>
            </div>
          </Glass>
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: HABITS
  // ═══════════════════════════════════════
  const renderHabits = () => {
    const today = new Date().toISOString().split("T")[0];
    const completedToday = habits.filter(h => h.completions.includes(today)).length;
    return (
      <div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Habits</h1>
            <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{completedToday}/{habits.length} completed today</p>
          </div>
          <Btn primary onClick={() => setShowNewHabit(true)}>+ New Habit</Btn>
        </div>
        <div className="rewards-stats" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
          {habits.map((h, i) => {
            const doneToday = h.completions.includes(today);
            const last7 = Array.from({ length: 7 }, (_, d) => {
              const date = new Date(); date.setDate(date.getDate() - (6 - d));
              return h.completions.includes(date.toISOString().split("T")[0]);
            });
            return (
              <Glass key={h.id} hover onClick={() => toggleHabit(h.id)} style={{ padding:18,cursor:"pointer",animation:`slideUp 0.3s ${i*0.05}s both ease-out`,border: doneToday ? `1px solid ${h.color}33` : "1px solid var(--card-border)",background: doneToday ? `${h.color}06` : "var(--card-bg)" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:10,background:`${h.color}18`,display:"flex",alignItems:"center",justifyContent:"center",color:h.color }}>{getWsIcon(h.icon, 18)}</div>
                    <div>
                      <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{h.name}</div>
                      <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{h.frequency}</div>
                    </div>
                  </div>
                  <div style={{ width:24,height:24,borderRadius:8,background:doneToday?h.color:"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s" }}>
                    {doneToday && <Check size={14} color="#fff" />}
                  </div>
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div style={{ display:"flex",gap:4 }}>
                    {last7.map((done, d) => (
                      <div key={d} style={{ width:12,height:12,borderRadius:3,background:done?h.color:"rgba(0,0,0,0.06)",transition:"all 0.2s" }} />
                    ))}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                    <Flame size={12} color={h.color} />
                    <span style={{ fontFamily:"var(--mono)",fontSize:11,color:h.color,fontWeight:700 }}>{h.streak}</span>
                  </div>
                </div>
              </Glass>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: GOALS
  // ═══════════════════════════════════════
  const renderGoals = () => (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Goals & OKRs</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{goals.length} objectives tracked</p>
        </div>
        <Btn primary onClick={() => setShowNewGoal(true)}>+ New Goal</Btn>
      </div>
      {goals.map((g, i) => {
        const expanded = expandedGoals[g.id];
        return (
          <Glass key={g.id} style={{ padding:20,marginBottom:14,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
            <div onClick={() => setExpandedGoals(prev => ({ ...prev, [g.id]: !prev[g.id] }))} style={{ cursor:"pointer",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ transition:"transform 0.2s",transform:expanded?"rotate(90deg)":"none" }}><ChevronRight size={18} color="var(--muted)" /></div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
                  <span style={{ fontFamily:"var(--heading)",fontSize:16,fontWeight:700,color:"var(--text)" }}>{g.title}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:9,fontWeight:700,color:goalStatusColors[g.status],background:`${goalStatusColors[g.status]}14`,padding:"2px 8px",borderRadius:6,textTransform:"uppercase",letterSpacing:0.5 }}>{g.status}</span>
                </div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{g.quarter}</div>
              </div>
              <div style={{ width:100,display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ flex:1,height:6,background:"var(--card-border)",borderRadius:6,overflow:"hidden" }}>
                  <div style={{ width:`${g.progress}%`,height:"100%",borderRadius:6,background:goalStatusColors[g.status],transition:"width 0.5s" }} />
                </div>
                <span style={{ fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:goalStatusColors[g.status] }}>{g.progress}%</span>
              </div>
            </div>
            {expanded && g.keyResults && (
              <div style={{ marginTop:16,paddingLeft:30 }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontWeight:600 }}>Key Results</div>
                {g.keyResults.map(kr => (
                  <div key={kr.id} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",marginBottom:4 }}>{kr.title}</div>
                      <div style={{ height:4,background:"var(--card-border)",borderRadius:4,overflow:"hidden" }}>
                        <div style={{ width:`${kr.progress}%`,height:"100%",borderRadius:4,background:goalStatusColors[g.status],transition:"width 0.5s" }} />
                      </div>
                    </div>
                    <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",fontWeight:600,minWidth:35,textAlign:"right" }}>{kr.progress}%</span>
                  </div>
                ))}
                {g.linkedTaskIds.length > 0 && (
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontWeight:600 }}>Linked Tasks</div>
                    {g.linkedTaskIds.map(tid => {
                      const t = tasks.find(x => x.id === tid);
                      if (!t) return null;
                      return <div key={tid} onClick={() => goTask(tid)} style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--primary)",cursor:"pointer",padding:"4px 0",fontWeight:600 }}>→ {t.title}</div>;
                    })}
                  </div>
                )}
              </div>
            )}
          </Glass>
        );
      })}
    </div>
  );

  // ═══════════════════════════════════════
  //  PAGE: JOURNAL
  // ═══════════════════════════════════════
  const renderJournal = () => (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Journal</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{journal.length} entries</p>
        </div>
        <Btn primary onClick={() => setShowNewJournal(true)}>+ New Entry</Btn>
      </div>
      {journal.map((entry, i) => (
        <Glass key={entry.id} style={{ padding:20,marginBottom:14,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>{entry.date}</span>
              <span style={{ display:"flex",color:moodColors[entry.mood] }}>{moodIcons[entry.mood]}</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                <span style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>MOOD</span>
                <div style={{ display:"flex",gap:2 }}>{Array.from({length:5},(_,j)=><div key={j} style={{ width:8,height:8,borderRadius:2,background:j<entry.mood?moodColors[entry.mood]:"rgba(0,0,0,0.06)" }} />)}</div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                <span style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>ENERGY</span>
                <div style={{ display:"flex",gap:2 }}>{Array.from({length:5},(_,j)=><div key={j} style={{ width:8,height:8,borderRadius:2,background:j<entry.energy?"#F59E0B":"rgba(0,0,0,0.06)" }} />)}</div>
              </div>
            </div>
          </div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",lineHeight:1.7,marginBottom:12 }}>{entry.content}</div>
          <div style={{ display:"flex",gap:20 }}>
            {entry.wins.length > 0 && (
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--success)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>Wins</div>
                {entry.wins.map((w,j) => <div key={j} style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",padding:"2px 0",display:"flex",alignItems:"center",gap:6 }}><CheckCircle2 size={12} color="#22C55E" />{w}</div>)}
              </div>
            )}
            {entry.blockers.length > 0 && (
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--danger)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>Blockers</div>
                {entry.blockers.map((b,j) => <div key={j} style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",padding:"2px 0",display:"flex",alignItems:"center",gap:6 }}><AlertCircle size={12} color="#EF4444" />{b}</div>)}
              </div>
            )}
          </div>
        </Glass>
      ))}
    </div>
  );

  // ═══════════════════════════════════════
  //  PAGE: CALENDAR
  // ═══════════════════════════════════════
  const renderCalendar = () => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
    const hourHeight = 60;
    return (
      <div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Calendar</h1>
            <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>Friday, March 21 · {timeBlocks.length} blocks</p>
          </div>
          <Btn primary onClick={() => setShowNewBlock(true)}>+ Add Block</Btn>
        </div>
        <Glass style={{ padding:0,overflow:"hidden" }}>
          <div style={{ position:"relative",height:hours.length*hourHeight }}>
            {hours.map((h, i) => (
              <div key={h} style={{ position:"absolute",top:i*hourHeight,left:0,right:0,height:hourHeight,borderBottom:"1px solid var(--subtle-bg)",display:"flex",alignItems:"flex-start" }}>
                <div style={{ width:60,padding:"8px 12px 0 0",textAlign:"right",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600,flexShrink:0 }}>
                  {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h-12} PM`}
                </div>
              </div>
            ))}
            {timeBlocks.map(block => {
              const top = (block.startHour - 6) * hourHeight;
              const height = (block.endHour - block.startHour) * hourHeight;
              return (
                <div key={block.id} style={{
                  position:"absolute",top:top+2,left:68,right:12,height:height-4,
                  background:`${block.color}14`,border:`1px solid ${block.color}33`,borderLeft:`3px solid ${block.color}`,
                  borderRadius:8,padding:"8px 12px",cursor:"pointer",overflow:"hidden",
                }} onClick={() => block.taskId && goTask(block.taskId)}>
                  <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:block.color }}>{block.title}</div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2 }}>
                    {Math.floor(block.startHour) > 12 ? `${Math.floor(block.startHour)-12}` : Math.floor(block.startHour)}:{block.startHour % 1 ? "30" : "00"} – {Math.floor(block.endHour) > 12 ? `${Math.floor(block.endHour)-12}` : Math.floor(block.endHour)}:{block.endHour % 1 ? "30" : "00"}
                  </div>
                  {block.type !== "work" && <span style={{ fontFamily:"var(--mono)",fontSize:9,color:block.color,fontWeight:600,textTransform:"uppercase" }}>{block.type}</span>}
                </div>
              );
            })}
          </div>
        </Glass>
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: BOOKMARKS
  // ═══════════════════════════════════════
  const renderBookmarks = () => (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Bookmarks</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{bookmarks.length} saved</p>
        </div>
        <Btn primary onClick={() => setShowNewBookmark(true)}>+ Save Bookmark</Btn>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        {bookmarks.map((bk, i) => {
          const bkWs = ws.find(w => w.id === bk.wsId);
          return (
            <Glass key={bk.id} hover style={{ padding:18,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:"var(--primary-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--primary)",flexShrink:0 }}><Bookmark size={18} /></div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:4 }}>{bk.title}</div>
                  {bk.description && <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",lineHeight:1.5,marginBottom:6 }}>{bk.description}</div>}
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}><Link size={10} style={{ display:"inline",verticalAlign:"middle",marginRight:4 }} />{bk.url}</div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
                    {bk.tags.map(tag => <span key={tag} style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",background:"var(--subtle-bg)",padding:"2px 8px",borderRadius:6 }}>{tag}</span>)}
                    {bkWs && <span style={{ fontFamily:"var(--mono)",fontSize:9,color:bkWs.color,fontWeight:600 }}>{bkWs.name}</span>}
                    <span style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",marginLeft:"auto" }}>{bk.createdAt}</span>
                  </div>
                </div>
              </div>
            </Glass>
          );
        })}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  PAGE: HEALTH
  // ═══════════════════════════════════════
  const renderHealth = () => {
    const weekCalories = workouts.slice(0, 5).reduce((s, w) => s + (w.calories || 0), 0);
    const weekMinutes = workouts.slice(0, 5).reduce((s, w) => s + w.duration, 0);
    return (
      <div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Health & Wellness</h1>
          <Btn primary onClick={() => setShowNewWorkout(true)}>+ Log Workout</Btn>
        </div>

        <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:24 }}>
          {[
            { label: "Weight", value: `${healthMetrics.weight} lbs`, icon: <TrendingUp size={20} />, color: "#5B8DEF" },
            { label: "Sleep", value: `${healthMetrics.sleep}h`, icon: <Moon size={20} />, color: "#A78BFA" },
            { label: "Steps", value: healthMetrics.steps.toLocaleString(), icon: <Activity size={20} />, color: "#22C55E" },
            { label: "Water", value: `${healthMetrics.water} glasses`, icon: <HeartPulse size={20} />, color: "#5B8DEF" },
          ].map((m, i) => (
            <Glass key={i} style={{ padding:18,textAlign:"center" }}>
              <div style={{ display:"flex",justifyContent:"center",color:m.color,marginBottom:8 }}>{m.icon}</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:20,fontWeight:800,color:"var(--text)" }}>{m.value}</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2 }}>{m.label}</div>
            </Glass>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24 }}>
          <Glass style={{ padding:18,textAlign:"center" }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Weekly Minutes</div>
            <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"var(--success)" }}>{weekMinutes}</div>
          </Glass>
          <Glass style={{ padding:18,textAlign:"center" }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Weekly Calories</div>
            <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"#F97316" }}>{weekCalories}</div>
          </Glass>
        </div>

        <h2 style={{ fontFamily:"var(--heading)",fontSize:18,color:"var(--text)",margin:"0 0 14px",fontWeight:700 }}>Recent Workouts</h2>
        {workouts.map((w, i) => (
          <Glass key={w.id} style={{ padding:16,marginBottom:8,display:"flex",alignItems:"center",gap:14,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
            <div style={{ width:40,height:40,borderRadius:12,background:w.type==="Run"?"rgba(34,197,94,0.1)":w.type==="Strength"?"rgba(239,68,68,0.1)":"rgba(167,139,250,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:w.type==="Run"?"#22C55E":w.type==="Strength"?"#EF4444":"#A78BFA" }}>
              {w.type==="Run"?<Activity size={20} />:w.type==="Strength"?<Dumbbell size={20} />:<Heart size={20} />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{w.type}{w.distance ? ` · ${w.distance}` : ""}</div>
              <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>{w.notes}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:"var(--text)" }}>{w.duration} min</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{w.date}</div>
            </div>
          </Glass>
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: FINANCE
  // ═══════════════════════════════════════
  const renderFinance = () => {
    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const recurringExpenses = transactions.filter(t => t.type === "expense" && t.recurring).reduce((s, t) => s + t.amount, 0);
    const getCat = (id) => ALL_FINANCE_CATS.find(c => c.id === id) || { label: id, color: "#94A3B8" };
    const spendingByCategory = FINANCE_CATEGORIES.expense.map(cat => {
      const spent = transactions.filter(t => t.type === "expense" && t.category === cat.id).reduce((s, t) => s + t.amount, 0);
      return { ...cat, spent };
    }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent);
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    const addTransaction = () => {
      if (!newTxAmount || !newTxDesc) return;
      setTransactions(prev => [...prev, { id: `tx${Date.now()}`, type: newTxType, category: newTxCategory, amount: parseFloat(newTxAmount), description: newTxDesc, date: newTxDate, recurring: newTxRecurring }]);
      setShowNewTransaction(false);
      setNewTxAmount(""); setNewTxDesc(""); setNewTxRecurring(false);
      flash(`${newTxType === "income" ? "Income" : "Expense"} added: $${parseFloat(newTxAmount).toFixed(2)}`);
    };
    const deleteTransaction = (id) => { setTransactions(prev => prev.filter(t => t.id !== id)); flash("Transaction deleted"); };
    const saveBudget = (catId) => {
      const val = parseFloat(editBudgetVal);
      if (isNaN(val) || val < 0) return;
      setBudgets(prev => { const exists = prev.find(b => b.categoryId === catId); if (exists) return prev.map(b => b.categoryId === catId ? { ...b, limit: val } : b); return [...prev, { categoryId: catId, limit: val }]; });
      setEditingBudget(null); flash("Budget updated");
    };
    const fTabStyle = (t) => ({ padding:"8px 20px",borderRadius:10,cursor:"pointer",fontFamily:"var(--body)",fontSize:13,fontWeight:600,background:financeTab===t?"var(--text)":"transparent",color:financeTab===t?"var(--text-on-primary)":"var(--muted)",transition:"all 0.2s" });
    const fmtDate = (d) => new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});

    return (
      <div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Finance</h1>
            <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{transactions.length} transactions this month</p>
          </div>
          <Btn primary onClick={() => setShowNewTransaction(true)}>+ Add Transaction</Btn>
        </div>

        <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:24 }}>
          {[
            { label:"Income",value:`$${totalIncome.toLocaleString("en-US",{minimumFractionDigits:2})}`,icon:<ArrowUpRight size={20}/>,color:"#22C55E" },
            { label:"Expenses",value:`$${totalExpenses.toLocaleString("en-US",{minimumFractionDigits:2})}`,icon:<ArrowDownRight size={20}/>,color:"#EF4444" },
            { label:"Net Balance",value:`${netBalance>=0?"+":""}$${Math.abs(netBalance).toLocaleString("en-US",{minimumFractionDigits:2})}`,icon:<DollarSign size={20}/>,color:netBalance>=0?"#22C55E":"#EF4444" },
            { label:"Recurring",value:`$${recurringExpenses.toLocaleString("en-US",{minimumFractionDigits:2})}/mo`,icon:<Repeat size={20}/>,color:"#5B8DEF" },
          ].map((m,i) => (
            <Glass key={i} style={{ padding:18,textAlign:"center" }}>
              <div style={{ display:"flex",justifyContent:"center",color:m.color,marginBottom:8 }}>{m.icon}</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:20,fontWeight:800,color:m.color }}>{m.value}</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2 }}>{m.label}</div>
            </Glass>
          ))}
        </div>

        <div style={{ display:"flex",gap:4,marginBottom:20,background:"var(--subtle-bg)",borderRadius:12,padding:4,width:"fit-content" }}>
          {["Transactions","Income","Bills","Budget","Summary"].map(t => <div key={t} onClick={() => setFinanceTab(t)} style={fTabStyle(t)}>{t}</div>)}
        </div>

        {financeTab === "Transactions" && (
          <div>
            {sortedTransactions.map((tx,i) => { const cat = getCat(tx.category); return (
              <Glass key={tx.id} style={{ padding:16,marginBottom:8,display:"flex",alignItems:"center",gap:14,animation:`slideUp 0.3s ${i*0.04}s both ease-out` }}>
                <div style={{ width:40,height:40,borderRadius:12,background:`${cat.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:cat.color }}>
                  {tx.type==="income"?<ArrowUpRight size={20}/>:<ArrowDownRight size={20}/>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{tx.description}</span>
                    {tx.recurring && <Repeat size={12} color="var(--muted)"/>}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:2 }}>
                    <span style={{ fontFamily:"var(--mono)",fontSize:10,color:cat.color,background:`${cat.color}14`,padding:"1px 6px",borderRadius:4,fontWeight:600 }}>{cat.label}</span>
                    <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{fmtDate(tx.date)}</span>
                  </div>
                </div>
                <div style={{ textAlign:"right",display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontFamily:"var(--mono)",fontSize:14,fontWeight:700,color:tx.type==="income"?"#22C55E":"#EF4444" }}>
                    {tx.type==="income"?"+":"-"}${tx.amount.toFixed(2)}
                  </span>
                  <div onClick={() => deleteTransaction(tx.id)} style={{ width:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)" }}
                    onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                  ><Trash2 size={14}/></div>
                </div>
              </Glass>
            ); })}
            {sortedTransactions.length===0 && <Glass style={{ padding:40,textAlign:"center" }}><Receipt size={32} color="var(--muted)" style={{ marginBottom:12 }}/><div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)" }}>No transactions yet. Add your first one!</div></Glass>}
          </div>
        )}

        {financeTab === "Income" && (() => {
          const incomeTransactions = transactions.filter(t => t.type === "income").sort((a, b) => new Date(b.date) - new Date(a.date));
          const totalMonthlyIncome = incomeTransactions.filter(t => t.recurring).reduce((s, t) => s + t.amount, 0);
          const totalAllIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);
          const addIncome = () => {
            if (!newIncomeAmount || !newIncomeDesc) return;
            setTransactions(prev => [...prev, { id: `tx${Date.now()}`, type: "income", category: newIncomeCategory, amount: parseFloat(newIncomeAmount), description: newIncomeDesc, date: new Date().toISOString().split("T")[0], recurring: newIncomeRecurring }]);
            setNewIncomeAmount(""); setNewIncomeDesc(""); setNewIncomeRecurring(true);
            flash("Income added!");
          };
          return (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
              <Glass style={{ padding:18,textAlign:"center" }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Recurring Monthly</div>
                <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"#22C55E" }}>${totalMonthlyIncome.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
              </Glass>
              <Glass style={{ padding:18,textAlign:"center" }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Total Income</div>
                <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"var(--text)" }}>${totalAllIncome.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
              </Glass>
            </div>

            <Glass style={{ padding:18,marginBottom:20 }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Add Income</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
                {FINANCE_CATEGORIES.income.map(cat => (
                  <div key={cat.id} onClick={() => setNewIncomeCategory(cat.id)} style={{
                    padding:"6px 12px",borderRadius:8,cursor:"pointer",
                    background:newIncomeCategory===cat.id?`${cat.color}18`:"var(--hover-bg)",
                    border:newIncomeCategory===cat.id?`2px solid ${cat.color}`:"2px solid transparent",
                    fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newIncomeCategory===cat.id?cat.color:"var(--muted)",
                    transition:"all 0.15s",
                  }}>{cat.label}</div>
                ))}
              </div>
              <div style={{ display:"flex",gap:10,marginBottom:12 }}>
                <input value={newIncomeDesc} onChange={e => setNewIncomeDesc(e.target.value)} placeholder="e.g. Day job, Side project..."
                  onKeyDown={e => e.key === "Enter" && addIncome()}
                  style={{ ...inputStyle, flex:2 }} />
                <div style={{ position:"relative",flex:1 }}>
                  <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontFamily:"var(--mono)",fontSize:13,color:"var(--muted)" }}>$</span>
                  <input value={newIncomeAmount} onChange={e => setNewIncomeAmount(e.target.value)} placeholder="0.00" type="number" step="0.01"
                    onKeyDown={e => e.key === "Enter" && addIncome()}
                    style={{ ...inputStyle, paddingLeft:24 }} />
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <label onClick={() => setNewIncomeRecurring(!newIncomeRecurring)} style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600 }}>
                  <div style={{ width:18,height:18,borderRadius:5,border:newIncomeRecurring?"none":"2px solid rgba(0,0,0,0.15)",background:newIncomeRecurring?"#22C55E":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
                    {newIncomeRecurring && <Check size={12} color="#fff"/>}
                  </div>
                  Recurring (monthly)
                </label>
                <Btn primary onClick={addIncome}>+ Add Income</Btn>
              </div>
            </Glass>

            {incomeTransactions.map((tx, i) => { const cat = getCat(tx.category); return (
              <Glass key={tx.id} style={{ padding:16,marginBottom:8,display:"flex",alignItems:"center",gap:14,animation:`slideUp 0.3s ${i*0.04}s both ease-out` }}>
                <div style={{ width:40,height:40,borderRadius:12,background:"rgba(34,197,94,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#22C55E" }}>
                  <ArrowUpRight size={20}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{tx.description}</span>
                    {tx.recurring && <Repeat size={12} color="var(--muted)"/>}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:2 }}>
                    <span style={{ fontFamily:"var(--mono)",fontSize:10,color:cat.color,background:`${cat.color}14`,padding:"1px 6px",borderRadius:4,fontWeight:600 }}>{cat.label}</span>
                    <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{fmtDate(tx.date)}</span>
                  </div>
                </div>
                <div style={{ textAlign:"right",display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontFamily:"var(--mono)",fontSize:14,fontWeight:700,color:"#22C55E" }}>+${tx.amount.toFixed(2)}</span>
                  <div onClick={() => deleteTransaction(tx.id)} style={{ width:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)" }}
                    onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                  ><Trash2 size={14}/></div>
                </div>
              </Glass>
            ); })}
            {incomeTransactions.length===0 && <Glass style={{ padding:40,textAlign:"center" }}><Wallet size={32} color="var(--muted)" style={{ marginBottom:12 }}/><div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)" }}>No income added yet. Add your sources above!</div></Glass>}
          </div>
          );
        })()}

        {financeTab === "Bills" && (() => {
          const now = new Date();
          const months = [];
          for (let i = -1; i <= 10; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            months.push({ key: d.toISOString().slice(0, 7), short: d.toLocaleDateString("en-US", { month: "short" }), full: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }), isCurrent: i === 0 });
          }
          const currentMonthKey = months.find(m => m.isCurrent).key;
          const totalBillsAmount = bills.reduce((s, b) => s + b.amount, 0);
          const paidThisMonth = bills.filter(b => billPayments[`${b.id}-${currentMonthKey}`]).length;
          const paidAmountThisMonth = bills.filter(b => billPayments[`${b.id}-${currentMonthKey}`]).reduce((s, b) => s + b.amount, 0);
          const togglePaid = (billId, monthKey) => {
            const key = `${billId}-${monthKey}`;
            setBillPayments(prev => ({ ...prev, [key]: !prev[key] }));
            flash(billPayments[key] ? "Marked unpaid" : "Marked paid!");
          };
          const addBill = () => {
            if (!newBillName || !newBillAmount) return;
            const amt = parseFloat(newBillAmount);
            setBills(prev => [...prev, { id: `bill${Date.now()}`, name: newBillName, amount: amt, dueDay: parseInt(newBillDueDay), category: newBillCategory }]);
            setBudgets(prev => {
              const existing = prev.find(b => b.categoryId === newBillCategory);
              if (existing) return prev.map(b => b.categoryId === newBillCategory ? { ...b, limit: b.limit + amt } : b);
              return [...prev, { categoryId: newBillCategory, limit: amt }];
            });
            setNewBillName(""); setNewBillAmount(""); setNewBillDueDay("1");
            flash("Bill added & budget updated!");
          };
          const deleteBill = (id) => { setBills(prev => prev.filter(b => b.id !== id)); flash("Bill removed"); };
          const sortedBills = [...bills].sort((a, b) => a.dueDay - b.dueDay);
          const getCat = (id) => ALL_FINANCE_CATS.find(c => c.id === id) || { label: id, color: "#94A3B8" };
          const cellW = 54;
          return (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20 }}>
              <Glass style={{ padding:18,textAlign:"center" }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Monthly Bills</div>
                <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"var(--text)" }}>${totalBillsAmount.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
              </Glass>
              <Glass style={{ padding:18,textAlign:"center" }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Paid This Month</div>
                <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"#22C55E" }}>${paidAmountThisMonth.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
              </Glass>
              <Glass style={{ padding:18,textAlign:"center" }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Remaining</div>
                <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:(totalBillsAmount-paidAmountThisMonth)>0?"#EF4444":"#22C55E" }}>${(totalBillsAmount - paidAmountThisMonth).toLocaleString("en-US",{minimumFractionDigits:2})}</div>
              </Glass>
            </div>

            {bills.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ height:8,background:"rgba(0,0,0,0.06)",borderRadius:8,overflow:"hidden" }}>
                  <div style={{ width:`${bills.length > 0 ? (paidThisMonth/bills.length)*100 : 0}%`,height:"100%",borderRadius:8,background:"linear-gradient(90deg, #22C55E, #4ADE80)",transition:"width 0.5s" }}/>
                </div>
                <div style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",marginTop:6,textAlign:"center" }}>{paidThisMonth} of {bills.length} bills paid for {months.find(m => m.isCurrent).full}</div>
              </div>
            )}

            <Glass style={{ padding:18,marginBottom:20 }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Add Bill</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
                {FINANCE_CATEGORIES.expense.map(cat => (
                  <div key={cat.id} onClick={() => setNewBillCategory(cat.id)} style={{
                    padding:"6px 12px",borderRadius:8,cursor:"pointer",
                    background:newBillCategory===cat.id?`${cat.color}18`:"var(--hover-bg)",
                    border:newBillCategory===cat.id?`2px solid ${cat.color}`:"2px solid transparent",
                    fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newBillCategory===cat.id?cat.color:"var(--muted)",
                    transition:"all 0.15s",
                  }}>{cat.label}</div>
                ))}
              </div>
              <div style={{ display:"flex",gap:10,marginBottom:12 }}>
                <input value={newBillName} onChange={e => setNewBillName(e.target.value)} placeholder="e.g. Rent, Electric, Netflix..."
                  onKeyDown={e => e.key === "Enter" && addBill()}
                  style={{ ...inputStyle, flex:2 }} />
                <div style={{ position:"relative",flex:1 }}>
                  <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontFamily:"var(--mono)",fontSize:13,color:"var(--muted)" }}>$</span>
                  <input value={newBillAmount} onChange={e => setNewBillAmount(e.target.value)} placeholder="0.00" type="number" step="0.01"
                    onKeyDown={e => e.key === "Enter" && addBill()}
                    style={{ ...inputStyle, paddingLeft:24 }} />
                </div>
                <div style={{ position:"relative",flex:0.6 }}>
                  <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>Due</span>
                  <input value={newBillDueDay} onChange={e => setNewBillDueDay(e.target.value)} type="number" min="1" max="31"
                    onKeyDown={e => e.key === "Enter" && addBill()}
                    style={{ ...inputStyle, paddingLeft:36, textAlign:"center" }} />
                </div>
              </div>
              <div style={{ display:"flex",justifyContent:"flex-end" }}>
                <Btn primary onClick={addBill}>+ Add Bill</Btn>
              </div>
            </Glass>

            {bills.length > 0 && (
            <Glass style={{ padding:0,overflow:"hidden" }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:"var(--body)",fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid var(--border)" }}>
                      <th style={{ padding:"12px 16px",textAlign:"left",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,fontWeight:600,position:"sticky",left:0,background:"var(--card-bg)",zIndex:2,minWidth:180 }}>Bill</th>
                      <th style={{ padding:"12px 8px",textAlign:"right",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,fontWeight:600,minWidth:70 }}>Amount</th>
                      {months.map(m => (
                        <th key={m.key} style={{ padding:"12px 0",textAlign:"center",fontFamily:"var(--mono)",fontSize:10,color:m.isCurrent?"var(--text)":"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,fontWeight:m.isCurrent?800:600,minWidth:cellW,background:m.isCurrent?"rgba(34,197,94,0.04)":"transparent" }}>{m.short}</th>
                      ))}
                      <th style={{ width:36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBills.map((bill, i) => {
                      const cat = getCat(bill.category);
                      return (
                      <tr key={bill.id} style={{ borderBottom:"1px solid var(--border-light)",animation:`slideUp 0.3s ${i*0.03}s both ease-out` }}>
                        <td style={{ padding:"10px 16px",position:"sticky",left:0,background:"var(--card-bg)",zIndex:1 }}>
                          <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{bill.name}</div>
                          <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:2 }}>
                            <span style={{ fontFamily:"var(--mono)",fontSize:9,color:cat.color,background:`${cat.color}14`,padding:"1px 5px",borderRadius:3,fontWeight:600 }}>{cat.label}</span>
                            <span style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>Due {bill.dueDay === 1 ? "1st" : bill.dueDay === 2 ? "2nd" : bill.dueDay === 3 ? "3rd" : `${bill.dueDay}th`}</span>
                          </div>
                        </td>
                        <td style={{ padding:"10px 8px",textAlign:"right",fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:"var(--text)" }}>${bill.amount.toFixed(2)}</td>
                        {months.map(m => {
                          const paid = !!billPayments[`${bill.id}-${m.key}`];
                          return (
                          <td key={m.key} style={{ padding:"6px 0",textAlign:"center",background:m.isCurrent?"rgba(34,197,94,0.04)":"transparent" }}>
                            <div onClick={() => togglePaid(bill.id, m.key)} style={{
                              width:24,height:24,borderRadius:6,margin:"0 auto",cursor:"pointer",
                              border:paid?"none":"2px solid var(--checkbox-border)",
                              background:paid?"#22C55E":"transparent",
                              display:"flex",alignItems:"center",justifyContent:"center",
                              transition:"all 0.15s",
                            }}>
                              {paid && <Check size={14} color="#fff"/>}
                            </div>
                          </td>
                          );
                        })}
                        <td style={{ padding:"6px 8px" }}>
                          <div onClick={() => deleteBill(bill.id)} style={{ width:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)" }}
                            onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                          ><Trash2 size={14}/></div>
                        </td>
                      </tr>
                      );
                    })}
                    <tr style={{ borderTop:"2px solid var(--border)" }}>
                      <td style={{ padding:"10px 16px",fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,position:"sticky",left:0,background:"var(--card-bg)" }}>Total</td>
                      <td style={{ padding:"10px 8px",textAlign:"right",fontFamily:"var(--mono)",fontSize:12,fontWeight:800,color:"var(--text)" }}>${totalBillsAmount.toFixed(2)}</td>
                      {months.map(m => {
                        const paidInMonth = sortedBills.filter(b => billPayments[`${b.id}-${m.key}`]).length;
                        return (
                        <td key={m.key} style={{ padding:"10px 0",textAlign:"center",fontFamily:"var(--mono)",fontSize:10,fontWeight:700,color:paidInMonth===sortedBills.length&&sortedBills.length>0?"#22C55E":"var(--muted)",background:m.isCurrent?"rgba(34,197,94,0.04)":"transparent" }}>
                          {paidInMonth}/{sortedBills.length}
                        </td>
                        );
                      })}
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Glass>
            )}

            {bills.length===0 && <Glass style={{ padding:40,textAlign:"center" }}><Receipt size={32} color="var(--muted)" style={{ marginBottom:12 }}/><div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)" }}>No bills added yet. Add your monthly bills above!</div></Glass>}
          </div>
          );
        })()}

        {financeTab === "Budget" && (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
              <Glass style={{ padding:18,textAlign:"center" }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Total Budget</div>
                <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"var(--text)" }}>${budgets.reduce((s,b)=>s+b.limit,0).toLocaleString()}</div>
              </Glass>
              <Glass style={{ padding:18,textAlign:"center" }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Total Spent</div>
                <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:totalExpenses>budgets.reduce((s,b)=>s+b.limit,0)?"#EF4444":"#22C55E" }}>${totalExpenses.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
              </Glass>
            </div>
            {FINANCE_CATEGORIES.expense.map((cat,i) => {
              const budget = budgets.find(b=>b.categoryId===cat.id); const limit = budget?budget.limit:0;
              const spent = transactions.filter(t=>t.type==="expense"&&t.category===cat.id).reduce((s,t)=>s+t.amount,0);
              const pct = limit>0?Math.min((spent/limit)*100,100):0; const over = spent>limit&&limit>0;
              return (
                <Glass key={cat.id} style={{ padding:16,marginBottom:8,animation:`slideUp 0.3s ${i*0.04}s both ease-out` }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
                    <div style={{ width:32,height:32,borderRadius:10,background:`${cat.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:cat.color }}><DollarSign size={16}/></div>
                    <div style={{ flex:1 }}><span style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{cat.label}</span></div>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      {editingBudget===cat.id ? (
                        <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                          <span style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)" }}>$</span>
                          <input value={editBudgetVal} onChange={e=>setEditBudgetVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveBudget(cat.id)}
                            style={{ width:70,padding:"4px 8px",borderRadius:6,border:"1px solid rgba(0,0,0,0.1)",fontFamily:"var(--mono)",fontSize:12,outline:"none",background:"var(--subtle-bg)",color:"var(--text)" }} autoFocus/>
                          <div onClick={()=>saveBudget(cat.id)} style={{ cursor:"pointer",color:"#22C55E" }}><Check size={14}/></div>
                          <div onClick={()=>setEditingBudget(null)} style={{ cursor:"pointer",color:"var(--muted)" }}><X size={14}/></div>
                        </div>
                      ) : (
                        <>
                          <span style={{ fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:over?"#EF4444":"var(--text)" }}>${spent.toFixed(2)} / ${limit.toLocaleString()}</span>
                          <div onClick={()=>{setEditingBudget(cat.id);setEditBudgetVal(String(limit));}} style={{ cursor:"pointer",color:"var(--muted)" }}><Pencil size={12}/></div>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ height:6,background:"rgba(0,0,0,0.06)",borderRadius:6,overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`,height:"100%",borderRadius:6,background:over?"#EF4444":pct>75?"#FBBF24":cat.color,transition:"width 0.5s" }}/>
                  </div>
                  {over && <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"#EF4444",marginTop:4,fontWeight:600 }}>Over budget by ${(spent-limit).toFixed(2)}</div>}
                </Glass>
              );
            })}
          </div>
        )}

        {financeTab === "Summary" && (
          <div>
            <Glass style={{ padding:20,marginBottom:14 }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Income vs Expenses</div>
              <div style={{ display:"flex",gap:12,alignItems:"flex-end",height:120,marginBottom:12 }}>
                {[
                  { label:"Income",val:totalIncome,color:"#22C55E" },
                  { label:"Expenses",val:totalExpenses,color:"#EF4444" },
                  { label:"Net",val:Math.abs(netBalance),color:netBalance>=0?"#22C55E":"#EF4444",prefix:netBalance>=0?"+":"-" },
                ].map((bar,i) => (
                  <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}>
                    <div style={{ fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:bar.color }}>{bar.prefix||""}${bar.val.toLocaleString()}</div>
                    <div style={{ width:"100%",borderRadius:8,position:"relative",height:`${Math.max((bar.val/Math.max(totalIncome,totalExpenses))*80,10)}px` }}>
                      <div style={{ position:"absolute",inset:0,background:bar.color,borderRadius:8,opacity:i===2?0.6:0.8 }}/>
                    </div>
                    <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{bar.label}</div>
                  </div>
                ))}
              </div>
            </Glass>

            <Glass style={{ padding:20,marginBottom:14 }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Spending Breakdown</div>
              {totalExpenses>0 && (
                <div style={{ display:"flex",height:24,borderRadius:8,overflow:"hidden",marginBottom:16 }}>
                  {spendingByCategory.map(cat => <div key={cat.id} style={{ width:`${(cat.spent/totalExpenses)*100}%`,background:cat.color,minWidth:2,transition:"width 0.5s" }} title={`${cat.label}: $${cat.spent.toFixed(2)}`}/>)}
                </div>
              )}
              {spendingByCategory.map(cat => (
                <div key={cat.id} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <div style={{ width:10,height:10,borderRadius:3,background:cat.color,flexShrink:0 }}/>
                  <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1 }}>{cat.label}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:12,fontWeight:600,color:"var(--text)" }}>${cat.spent.toFixed(2)}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",minWidth:40,textAlign:"right" }}>{((cat.spent/totalExpenses)*100).toFixed(0)}%</span>
                </div>
              ))}
            </Glass>

            <Glass style={{ padding:20 }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Recurring Commitments</div>
              {transactions.filter(t=>t.recurring).sort((a,b)=>b.amount-a.amount).map(tx => { const cat=getCat(tx.category); return (
                <div key={tx.id} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <Repeat size={14} color={cat.color}/>
                  <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1 }}>{tx.description}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:cat.color,background:`${cat.color}14`,padding:"1px 6px",borderRadius:4,fontWeight:600 }}>{cat.label}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:tx.type==="income"?"#22C55E":"#EF4444" }}>{tx.type==="income"?"+":"-"}${tx.amount.toFixed(2)}</span>
                </div>
              ); })}
            </Glass>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: REVIEW
  // ═══════════════════════════════════════
  const renderReview = () => {
    const incompleteTasks = tasks.filter(t => !t.done);
    const upcomingDeadlines = tasks.filter(t => t.dueDate && !t.done);
    const fadingContacts = contacts.filter(c => c.health === "fading");
    const untriagedInbox = inbox.filter(i => !i.triaged);
    const today = new Date().toISOString().split("T")[0];
    const habitsNotDone = habits.filter(h => !h.completions.includes(today));
    return (
      <div>
        <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:"0 0 4px",fontWeight:800 }}>Weekly Review</h1>
        <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"0 0 24px" }}>Take stock of where you are and plan your next moves.</p>

        <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:24 }}>
          {[
            { label:"Open Tasks",value:incompleteTasks.length,color:"var(--primary)" },
            { label:"Deadlines",value:upcomingDeadlines.length,color:"#F59E0B" },
            { label:"Inbox Items",value:untriagedInbox.length,color:"var(--danger)" },
            { label:"Fading Contacts",value:fadingContacts.length,color:"#EC4899" },
          ].map((s,i) => (
            <Glass key={i} style={{ padding:18,textAlign:"center" }}>
              <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:s.color }}>{s.value}</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2 }}>{s.label}</div>
            </Glass>
          ))}
        </div>

        {/* Goal Progress */}
        <Glass style={{ padding:20,marginBottom:14 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 14px",fontWeight:700 }}>Goal Progress</h3>
          {goals.map(g => (
            <div key={g.id} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
              <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1,fontWeight:600 }}>{g.title}</span>
              <div style={{ width:120,height:6,background:"var(--card-border)",borderRadius:6,overflow:"hidden" }}>
                <div style={{ width:`${g.progress}%`,height:"100%",borderRadius:6,background:goalStatusColors[g.status] }} />
              </div>
              <span style={{ fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:goalStatusColors[g.status],minWidth:35,textAlign:"right" }}>{g.progress}%</span>
            </div>
          ))}
        </Glass>

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <Glass style={{ padding:20,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 12px",fontWeight:700 }}>Upcoming Deadlines</h3>
            {upcomingDeadlines.map(t => (
              <div key={t.id} onClick={() => goTask(t.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:"1px solid var(--subtle-bg)" }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:pColors[t.priority] }} />
                <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1,fontWeight:600 }}>{t.title}</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,color:t.priority==="high"?"#EF4444":"var(--muted)",fontWeight:600 }}>{t.dueDate}</span>
              </div>
            ))}
          </Glass>
        )}

        {/* Habits not done today */}
        {habitsNotDone.length > 0 && (
          <Glass style={{ padding:20,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 12px",fontWeight:700 }}>Habits Still Pending Today</h3>
            {habitsNotDone.map(h => (
              <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:"1px solid var(--subtle-bg)" }}>
                <div style={{ width:24,height:24,borderRadius:8,background:`${h.color}18`,display:"flex",alignItems:"center",justifyContent:"center",color:h.color }}>{getWsIcon(h.icon, 12)}</div>
                <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1 }}>{h.name}</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{h.streak} streak</span>
              </div>
            ))}
          </Glass>
        )}

        {/* Contacts needing attention */}
        {fadingContacts.length > 0 && (
          <Glass style={{ padding:20,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 12px",fontWeight:700 }}>Reconnect With</h3>
            {fadingContacts.map(c => (
              <div key={c.id} onClick={() => goContact(c.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:"1px solid var(--subtle-bg)" }}>
                <div style={{ width:28,height:28,borderRadius:8,background:`${healthColors.fading}18`,display:"flex",alignItems:"center",justifyContent:"center",color:healthColors.fading,fontFamily:"var(--heading)",fontSize:11,fontWeight:700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
                <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1,fontWeight:600 }}>{c.name}</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>Last: {c.lastContact}</span>
              </div>
            ))}
          </Glass>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: INBOX
  // ═══════════════════════════════════════
  const renderInbox = () => {
    const untriaged = inbox.filter(i => !i.triaged);
    const triaged = inbox.filter(i => i.triaged);
    return (
      <div>
        <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:"0 0 4px",fontWeight:800 }}>Inbox</h1>
        <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"0 0 20px" }}>Quick capture — dump it here, triage it later.</p>

        <Glass style={{ padding:16,marginBottom:24,display:"flex",gap:10 }}>
          <input value={newInboxText} onChange={e => setNewInboxText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addInboxItem()}
            placeholder="What's on your mind? Press Enter to capture..."
            style={{ ...inputStyle, flex:1 }} />
          <Btn primary onClick={addInboxItem}><Send size={14} /></Btn>
        </Glass>

        {untriaged.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontWeight:600 }}>Pending ({untriaged.length})</div>
            {untriaged.map((item, i) => (
              <Glass key={item.id} style={{ padding:14,marginBottom:8,display:"flex",alignItems:"center",gap:12,animation:`slideUp 0.3s ${i*0.04}s both ease-out` }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:"#5B8DEF",flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)" }}>{item.text}</div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:4 }}>{item.createdAt}</div>
                </div>
                <Btn small onClick={() => {
                  const id = "t" + Date.now();
                  setTasks(ts => [...ts, { id, title: item.text, desc: "From inbox", priority: "medium", wsId: "personal", dueTime: null, dueDate: null, done: false, section: "afternoon", subtasks: [], notes: [], attachments: [], totalPomos: 1, donePomos: 0, reward: null }]);
                  triageInbox(item.id);
                  flash("Converted to task!");
                }}>→ Task</Btn>
                <Btn small onClick={() => triageInbox(item.id)}>Done</Btn>
                <div onClick={() => dismissInbox(item.id)} style={{ cursor:"pointer",color:"var(--muted)" }}><X size={14} /></div>
              </Glass>
            ))}
          </div>
        )}

        {triaged.length > 0 && (
          <div>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontWeight:600 }}>Triaged ({triaged.length})</div>
            {triaged.map(item => (
              <div key={item.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 16px",marginBottom:4,opacity:0.5 }}>
                <Check size={14} color="#22C55E" />
                <span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",textDecoration:"line-through" }}>{item.text}</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginLeft:"auto" }}>{item.createdAt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: TEMPLATES
  // ═══════════════════════════════════════
  const renderTemplates = () => (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Templates</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{templates.length} templates</p>
        </div>
        <Btn primary onClick={() => setShowNewTemplate(true)}>+ New Template</Btn>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        {templates.map((tpl, i) => (
          <Glass key={tpl.id} style={{ padding:20,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"rgba(167,139,250,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--xp-color)" }}><Layout size={18} /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{tpl.name}</div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{tpl.category} · {tpl.items.length} items</div>
              </div>
            </div>
            {tpl.description && <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.5 }}>{tpl.description}</div>}
            <div style={{ marginBottom:12 }}>
              {tpl.items.slice(0, 4).map((item, j) => (
                <div key={j} style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)",padding:"4px 0",display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:16,height:16,borderRadius:5,border:"1.5px solid var(--checkbox-border)",flexShrink:0 }} />
                  {item}
                </div>
              ))}
              {tpl.items.length > 4 && <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:4 }}>+{tpl.items.length - 4} more</div>}
            </div>
            <Btn primary small color="#A78BFA" onClick={() => useTemplate(tpl)}>Use Template</Btn>
          </Glass>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  PAGE: WIKI
  // ═══════════════════════════════════════
  const renderWiki = () => {
    const categories = [...new Set(wiki.map(a => a.category))];
    return (
      <div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Knowledge Base</h1>
            <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{wiki.length} articles</p>
          </div>
          <Btn primary onClick={() => setShowNewWiki(true)}>+ New Article</Btn>
        </div>
        {categories.map(cat => (
          <div key={cat} style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontWeight:600 }}>{cat}</div>
            {wiki.filter(a => a.category === cat).map((article, i) => (
              <Glass key={article.id} hover onClick={() => goWiki(article.id)} style={{ padding:16,marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:14,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
                <div style={{ width:36,height:36,borderRadius:10,background:"var(--primary-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--primary)" }}><Library size={18} /></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{article.title}</div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:4 }}>
                    {article.tags.map(tag => <span key={tag} style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",background:"var(--subtle-bg)",padding:"2px 8px",borderRadius:6 }}>{tag}</span>)}
                    <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>Updated {article.lastUpdated}</span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--muted)" />
              </Glass>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: WIKI ARTICLE
  // ═══════════════════════════════════════
  const renderWikiArticle = () => {
    if (!activeWiki) return <div>Article not found</div>;
    return (
      <div style={{ maxWidth:760 }}>
        <div onClick={() => setPage("wiki")} style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--primary)",cursor:"pointer",marginBottom:16,fontWeight:600 }}>← Back to Wiki</div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:"var(--heading)",fontSize:26,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-0.5 }}>{activeWiki.title}</h1>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:6 }}>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--primary)",fontWeight:600,background:"var(--primary-bg)",padding:"2px 10px",borderRadius:6 }}>{activeWiki.category}</span>
              {activeWiki.tags.map(tag => <span key={tag} style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",background:"var(--subtle-bg)",padding:"2px 8px",borderRadius:6 }}>{tag}</span>)}
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>Updated {activeWiki.lastUpdated}</span>
            </div>
          </div>
          <Btn small onClick={() => { if (editingWiki) { saveWikiEdit(); } else { setEditWikiContent(activeWiki.content); setEditingWiki(true); } }}>
            {editingWiki ? "Save" : <><Pencil size={12} style={{ marginRight:4 }} />Edit</>}
          </Btn>
        </div>
        {editingWiki ? (
          <textarea value={editWikiContent} onChange={e => setEditWikiContent(e.target.value)} style={{ ...inputStyle, minHeight:400,resize:"vertical",fontFamily:"var(--mono)",fontSize:13,lineHeight:1.8 }} />
        ) : (
          <Glass style={{ padding:24 }}>
            <div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--text)",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{activeWiki.content}</div>
          </Glass>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: SCRATCHPAD (Apple Pencil)
  // ═══════════════════════════════════════
  const renderScratchpad = () => {
    const COLORS = ["#111827","#EF4444","#F59E0B","#22C55E","#5B8DEF","#A78BFA","#EC4899","#ffffff"];
    const SIZES = [1, 2, 3, 5, 8];
    return (
      <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10 }}>
          <div>
            <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Scratchpad</h1>
            <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>Draw with Apple Pencil or touch</p>
          </div>
          <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
            <Btn small onClick={undoCanvas}><Undo2 size={14} /></Btn>
            <Btn small onClick={clearCanvas}><Trash2 size={14} /></Btn>
            <Btn small onClick={downloadCanvas}><Download size={14} /></Btn>
          </div>
        </div>

        {/* Toolbar */}
        <Glass style={{ padding:"10px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
          {/* Pen / Eraser toggle */}
          <div style={{ display:"flex",gap:4 }}>
            <div onClick={() => setEraserMode(false)} style={{
              width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
              background:!eraserMode?"var(--primary-hover-bg)":"rgba(0,0,0,0.04)",
              color:!eraserMode?"#5B8DEF":"var(--muted)",border:!eraserMode?"2px solid #5B8DEF":"2px solid transparent",
              transition:"all 0.15s",
            }}><PenTool size={18} /></div>
            <div onClick={() => setEraserMode(true)} style={{
              width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
              background:eraserMode?"var(--primary-hover-bg)":"rgba(0,0,0,0.04)",
              color:eraserMode?"#5B8DEF":"var(--muted)",border:eraserMode?"2px solid #5B8DEF":"2px solid transparent",
              transition:"all 0.15s",
            }}><Eraser size={18} /></div>
          </div>

          <div style={{ width:1,height:28,background:"rgba(0,0,0,0.08)" }} />

          {/* Colors */}
          <div style={{ display:"flex",gap:5,alignItems:"center" }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => { setPenColor(c); setEraserMode(false); }} style={{
                width:26,height:26,borderRadius:8,background:c,cursor:"pointer",
                border: penColor === c && !eraserMode ? "2.5px solid var(--text)" : c === "#ffffff" ? "1.5px solid var(--checkbox-border)" : "2.5px solid transparent",
                transition:"all 0.15s",transform: penColor === c && !eraserMode ? "scale(1.2)" : "scale(1)",
                boxShadow: c === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,0.06)" : "none",
              }} />
            ))}
          </div>

          <div style={{ width:1,height:28,background:"rgba(0,0,0,0.08)" }} />

          {/* Brush size */}
          <div style={{ display:"flex",gap:5,alignItems:"center" }}>
            {SIZES.map(s => (
              <div key={s} onClick={() => setPenSize(s)} style={{
                width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
                background: penSize === s ? "var(--primary-bg)" : "var(--hover-bg)",
                border: penSize === s ? "2px solid #5B8DEF" : "2px solid transparent",
                transition:"all 0.15s",
              }}>
                <div style={{ width:Math.max(4, s*2.5),height:Math.max(4, s*2.5),borderRadius:"50%",background: penSize === s ? "#5B8DEF" : "var(--muted)" }} />
              </div>
            ))}
          </div>
        </Glass>

        {/* Canvas */}
        <div style={{ flex:1,minHeight:0,borderRadius:16,overflow:"hidden",border:"1px solid var(--border)",background:"var(--card-bg)",position:"relative" }}>
          <canvas
            ref={canvasRef}
            width={2048}
            height={1536}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerCancel={handleCanvasPointerUp}
            style={{
              width:"100%",height:"100%",
              touchAction:"none",
              cursor: eraserMode ? "crosshair" : "crosshair",
            }}
          />
        </div>
      </div>
    );
  };

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
      journal: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Journal</strong></>,
      calendar: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Calendar</strong></>,
      bookmarks: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Bookmarks</strong></>,
      health: <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Health</strong></>,
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
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .today-layout{flex-direction:column!important}
          .today-sidebar{width:100%!important;display:grid;grid-template-columns:1fr 1fr;gap:14px}
          .today-sidebar>div{margin-bottom:0!important}
          .notes-grid{grid-template-columns:1fr 1fr!important}
          .rewards-stats{grid-template-columns:1fr 1fr!important}
          .achievements-grid{grid-template-columns:1fr 1fr!important}
          .main-content{padding:20px 22px!important}
          .modal-inner{width:calc(100vw - 48px)!important;max-width:560px}
        }

        /* ── iPad 10th gen portrait (821-1024px, 820px CSS width) ── */
        @media(min-width:821px) and (max-width:1024px){
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .today-sidebar{width:220px!important}
          .notes-grid{grid-template-columns:1fr!important}
        }

        /* ── All phones: safe area for fixed elements ── */
        @media(max-width:600px){
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
          <div style={{ position:"relative",width:"min(280px, calc(100vw - 60px))",height:"100%",zIndex:51,paddingTop:"env(safe-area-inset-top)",paddingBottom:"env(safe-area-inset-bottom)" }}>
            {renderSidebar()}
          </div>
        </div>
      )}

      <div className="sidebar-desktop">
        {renderSidebar()}
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
            <div onClick={() => setPage("rewards")} style={{ width:32,height:32,borderRadius:10,background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--body)",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",flexShrink:0 }}>JD</div>
          </div>
        </div>

        <div className="main-content" style={{ flex:1,overflow: page === "scratchpad" ? "hidden" : "auto",padding: page === "timer" || page === "scratchpad" ? "28px 28px" : "24px 28px", minHeight: 0, display:"flex", flexDirection:"column" }}>
          {page === "today" && renderToday()}
          {page === "workspace" && renderWorkspace()}
          {page === "task" && renderTask()}
          {page === "timer" && renderTimer()}
          {page === "rewards" && renderRewards()}
          {page === "allTasks" && renderAllTasks()}
          {page === "contacts" && renderContacts()}
          {page === "contactDetail" && renderContactDetail()}
          {page === "habits" && renderHabits()}
          {page === "goals" && renderGoals()}
          {page === "journal" && renderJournal()}
          {page === "calendar" && renderCalendar()}
          {page === "bookmarks" && renderBookmarks()}
          {page === "health" && renderHealth()}
          {page === "finance" && renderFinance()}
          {page === "review" && renderReview()}
          {page === "inbox" && renderInbox()}
          {page === "templates" && renderTemplates()}
          {page === "wiki" && renderWiki()}
          {page === "wikiArticle" && renderWikiArticle()}
          {page === "scratchpad" && renderScratchpad()}
          {page === "settings" && renderSettings()}
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

      <Modal open={showNewJournal} onClose={() => setShowNewJournal(false)} title="New Journal Entry">
        <div style={{ display:"flex",gap:20,marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Mood</label>
            <div style={{ display:"flex",gap:6 }}>
              {[1,2,3,4,5].map(m => (
                <div key={m} onClick={() => setNewJournalMood(m)} style={{
                  flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                  background: newJournalMood === m ? `${moodColors[m]}14` : "var(--hover-bg)",
                  border: newJournalMood === m ? `2px solid ${moodColors[m]}` : "2px solid transparent",
                  fontSize:16,transition:"all 0.15s",
                }}>{m <= 2 ? "😔" : m === 3 ? "😐" : "😊"}</div>
              ))}
            </div>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Energy</label>
            <div style={{ display:"flex",gap:6 }}>
              {[1,2,3,4,5].map(e => (
                <div key={e} onClick={() => setNewJournalEnergy(e)} style={{
                  flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                  background: newJournalEnergy === e ? "rgba(245,158,11,0.1)" : "var(--hover-bg)",
                  border: newJournalEnergy === e ? "2px solid #F59E0B" : "2px solid transparent",
                  fontFamily:"var(--mono)",fontSize:12,fontWeight:600,color:newJournalEnergy===e?"#F59E0B":"var(--muted)",
                  transition:"all 0.15s",
                }}>{e}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>What happened today?</label>
          <textarea value={newJournalContent} onChange={e => setNewJournalContent(e.target.value)} placeholder="Write freely..." style={{ ...inputStyle, minHeight:100, resize:"vertical" }} autoFocus />
        </div>
        <div style={{ display:"flex",gap:14,marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--success)",fontWeight:600,display:"block",marginBottom:6 }}>Wins (one per line)</label>
            <textarea value={newJournalWins} onChange={e => setNewJournalWins(e.target.value)} placeholder="What went well?" style={{ ...inputStyle, minHeight:60, resize:"vertical" }} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--danger)",fontWeight:600,display:"block",marginBottom:6 }}>Blockers (one per line)</label>
            <textarea value={newJournalBlockers} onChange={e => setNewJournalBlockers(e.target.value)} placeholder="What got in the way?" style={{ ...inputStyle, minHeight:60, resize:"vertical" }} />
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewJournal(false)}>Cancel</Btn>
          <Btn primary onClick={createJournalEntry}>Save Entry</Btn>
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

      <Modal open={showNewWorkout} onClose={() => setShowNewWorkout(false)} title="Log Workout">
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Type</label>
          <div style={{ display:"flex",gap:6 }}>
            {["Run","Strength","Yoga","Walk","HIIT","Other"].map(t => (
              <div key={t} onClick={() => setNewWorkoutType(t)} style={{
                flex:1,padding:"8px 0",textAlign:"center",borderRadius:10,cursor:"pointer",
                background: newWorkoutType === t ? "rgba(34,197,94,0.1)" : "var(--hover-bg)",
                border: newWorkoutType === t ? "2px solid #22C55E" : "2px solid transparent",
                fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newWorkoutType===t?"#22C55E":"var(--muted)",
                transition:"all 0.15s",
              }}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Duration (minutes)</label>
          <input type="number" value={newWorkoutDuration} onChange={e => setNewWorkoutDuration(e.target.value)} placeholder="30" style={inputStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Notes</label>
          <textarea value={newWorkoutNotes} onChange={e => setNewWorkoutNotes(e.target.value)} placeholder="How did it go?" style={{ ...inputStyle, minHeight:60, resize:"vertical" }} />
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={() => setShowNewWorkout(false)}>Cancel</Btn>
          <Btn primary onClick={createWorkout}>Log Workout</Btn>
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
          <Btn primary onClick={() => {
            if (!newTxAmount || !newTxDesc) return;
            setTransactions(prev => [...prev, { id: `tx${Date.now()}`, type: newTxType, category: newTxCategory, amount: parseFloat(newTxAmount), description: newTxDesc, date: newTxDate, recurring: newTxRecurring }]);
            setShowNewTransaction(false); setNewTxAmount(""); setNewTxDesc(""); setNewTxRecurring(false);
            flash(`${newTxType === "income" ? "Income" : "Expense"} added!`);
          }}>Add Transaction</Btn>
        </div>
      </Modal>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}
