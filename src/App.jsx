import { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor, Brain, Book, Leaf, Briefcase, FileCode2, Image as ImageIcon,
  FileText, FileEdit, Sprout, TreePine, Mountain, Zap, Target,
  Bird, Waves, Home, ClipboardList, Timer, Trophy, Sunrise, Sun,
  Moon, Flame, Gift, Check, Play, Pause, RotateCcw, SkipForward,
  Paperclip, Search, Clock, CheckCircle2, ArrowLeft, Plus, X,
  Palette, Hash, Folder, Heart, Star, Coffee, Music, Camera,
  Globe, Lightbulb, Rocket, Compass, Anchor, Award, Bell
} from "lucide-react";


// ═══════════════════════════════════════
//  DATA & STATE
// ═══════════════════════════════════════
const INIT_WORKSPACES = [
  { id: "cs301", name: "CS 301", icon: "Monitor", color: "#5B8DEF" },
  { id: "psych", name: "Psychology 201", icon: "Brain", color: "#E87B7B" },
  { id: "thesis", name: "Thesis Research", icon: "Book", color: "#A78BFA" },
  { id: "personal", name: "Personal", icon: "Leaf", color: "#4ADE80" },
  { id: "freelance", name: "Freelance", icon: "Briefcase", color: "#FBBF24" },
];

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

const INIT_TASKS = [
  { id: "t1", title: "Implement binary search tree", desc: "Code BST with insert, delete & traversal methods", priority: "high", wsId: "cs301", dueTime: "11:00 AM", dueDate: "Tomorrow", done: false, section: "morning", subtasks: [
    { id: "s1", text: "Implement insert method", done: true, xp: 10 },
    { id: "s2", text: "Implement delete method", done: true, xp: 15 },
    { id: "s3", text: "Implement in-order traversal", done: true, xp: 10 },
    { id: "s4", text: "Implement pre-order traversal", done: true, xp: 10 },
    { id: "s5", text: "Write test cases", done: false, xp: 15 },
    { id: "s6", text: "Optimize and refactor", done: false, xp: 20 },
    { id: "s7", text: "Submit assignment", done: false, xp: 25 },
  ], notes: [
    { id: "n1", text: "Key insight: recursive approach is cleaner for traversal but iterative is better for interview prep.", time: "2h ago" },
    { id: "n2", text: "Prof mentioned edge case with duplicate values — handle in insert.", time: "Yesterday" },
  ], attachments: [
    { name: "BST_starter.py", size: "4.2 KB", icon: <FileCode2 size={16} />, type: "code" },
    { name: "TreeDiagram.png", size: "890 KB", icon: <ImageIcon size={16} />, type: "image" },
  ], totalPomos: 5, donePomos: 3, reward: "15 min break — check Reddit" },

  { id: "t2", title: "Read Chapter 8: Graph Theory", desc: "Focus on Dijkstra's algorithm and BFS/DFS patterns", priority: "medium", wsId: "cs301", dueTime: null, dueDate: "Tue, Mar 25", done: false, section: "morning", subtasks: [
    { id: "s8", text: "Read section 8.1 — Graph basics", done: true, xp: 10 },
    { id: "s9", text: "Read section 8.2 — BFS/DFS", done: false, xp: 15 },
    { id: "s10", text: "Read section 8.3 — Dijkstra's", done: false, xp: 15 },
    { id: "s11", text: "Summarize key formulas", done: false, xp: 10 },
  ], notes: [], attachments: [
    { name: "Chapter8_GraphTheory.pdf", size: "2.8 MB", icon: <FileText size={16} />, type: "pdf" },
  ], totalPomos: 3, donePomos: 1, reward: null },

  { id: "t3", title: "Review reinforcement schedules", desc: "Chapter 5 summary for Tuesday quiz", priority: "high", wsId: "psych", dueTime: "1:00 PM", dueDate: "Tue, Mar 25", done: false, section: "afternoon", subtasks: [
    { id: "s12", text: "Review fixed-ratio schedules", done: false, xp: 10 },
    { id: "s13", text: "Review variable-ratio schedules", done: false, xp: 10 },
    { id: "s14", text: "Create flashcards", done: false, xp: 15 },
  ], notes: [], attachments: [], totalPomos: 2, donePomos: 0, reward: null },

  { id: "t4", title: "Literature review outline", desc: "Draft outline for cognitive load section of thesis", priority: "medium", wsId: "thesis", dueTime: null, dueDate: "Fri, Mar 28", done: false, section: "afternoon", subtasks: [
    { id: "s15", text: "Collect 5 key papers", done: true, xp: 15 },
    { id: "s16", text: "Read Sweller (1988)", done: true, xp: 15 },
    { id: "s17", text: "Outline argument structure", done: false, xp: 20 },
    { id: "s18", text: "Write intro paragraph", done: false, xp: 20 },
    { id: "s19", text: "Get advisor feedback", done: false, xp: 10 },
  ], notes: [
    { id: "n3", text: "Advisor says focus on intrinsic vs extraneous load distinction. Don't go too deep into germane load.", time: "3 days ago" },
  ], attachments: [
    { name: "Sweller_1988_CLT.pdf", size: "2.4 MB", icon: <FileText size={16} />, type: "pdf" },
    { name: "Outline_Draft_v1.docx", size: "340 KB", icon: <FileEdit size={16} />, type: "doc" },
  ], totalPomos: 4, donePomos: 1, reward: null },

  { id: "t5", title: "Client wireframes — round 2", desc: "Revisions based on Monday's feedback session", priority: "high", wsId: "freelance", dueTime: "5:00 PM", dueDate: "Mon, Mar 24", done: false, section: "afternoon", subtasks: [
    { id: "s20", text: "Update nav layout per feedback", done: true, xp: 15 },
    { id: "s21", text: "Redesign dashboard cards", done: false, xp: 15 },
    { id: "s22", text: "Add mobile responsive views", done: false, xp: 20 },
    { id: "s23", text: "Export and send to client", done: false, xp: 10 },
  ], notes: [], attachments: [], totalPomos: 3, donePomos: 0, reward: "Order takeout tonight" },

  { id: "t6", title: "Grocery run + meal prep", desc: "Weekly groceries and prep lunches for the week", priority: "low", wsId: "personal", dueTime: null, dueDate: null, done: false, section: "evening", subtasks: [], notes: [], attachments: [], totalPomos: 1, donePomos: 0, reward: null },

  { id: "t7", title: "Journal: weekly reflection", desc: "What went well, what to improve next week", priority: "low", wsId: "personal", dueTime: null, dueDate: null, done: true, section: "evening", subtasks: [], notes: [
    { id: "n4", text: "Good week overall. Need to start earlier in the mornings.", time: "1h ago" },
  ], attachments: [], totalPomos: 1, donePomos: 1, reward: null },
];

const ACHIEVEMENTS = [
  { id: "a1", icon: <Sprout size={24} />, title: "First Sprout", desc: "Complete your first pomodoro", earned: true },
  { id: "a2", icon: <Leaf size={16} />, title: "Growing Strong", desc: "Complete 10 pomodoros", earned: true },
  { id: "a3", icon: <TreePine size={24} />, title: "Deep Roots", desc: "Maintain a 7-day streak", earned: true },
  { id: "a4", icon: <Mountain size={24} />, title: "Summit", desc: "Complete 50 pomodoros", earned: true },
  { id: "a5", icon: <Zap size={24} />, title: "Lightning Focus", desc: "5 pomodoros in one day", earned: true },
  { id: "a6", icon: <Target size={24} />, title: "Bullseye", desc: "Complete all daily tasks 3 days running", earned: false },
  { id: "a7", icon: <Bird size={24} />, title: "Night Owl", desc: "Complete a task after 10pm", earned: false },
  { id: "a8", icon: <Waves size={24} />, title: "Flow Master", desc: "Maintain a 30-day streak", earned: false },
];

// ═══════════════════════════════════════
//  REUSABLE COMPONENTS
// ═══════════════════════════════════════
const Glass = ({ children, style = {}, hover = false, onClick, className }) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "#ffffff",
        borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: h && hover ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
        transform: h && hover ? "translateY(-1px)" : "none",
        cursor: onClick ? "pointer" : "default", ...style,
      }}>{children}</div>
  );
};

const Ring = ({ percent, size = 56, stroke = 5, color = "#5B8DEF" }) => {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (percent/100)*c} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
};

const Btn = ({ children, primary, color, small, style = {}, onClick }) => (
  <button onClick={onClick} style={{
    background: primary ? (color || "var(--text)") : "rgba(0,0,0,0.04)",
    color: primary ? "#fff" : "var(--muted)", border: primary ? "none" : "1px solid rgba(0,0,0,0.08)",
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
    <div style={{ position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(4px)" }} />
      <div onClick={e => e.stopPropagation()} style={{
        position:"relative",width:520,maxHeight:"80vh",overflow:"auto",
        background:"#ffffff",
        borderRadius:16,border:"1px solid rgba(0,0,0,0.08)",
        boxShadow:"0 20px 60px rgba(0,0,0,0.12)",padding:28,
        animation:"scaleIn 0.2s ease",
      }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:700,color:"var(--text)",margin:0 }}>{title}</h3>
          <div onClick={onClose} style={{ width:28,height:28,borderRadius:8,background:"rgba(0,0,0,0.05)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"var(--muted)" }}><X size={16} /></div>
        </div>
        {children}
      </div>
    </div>
  );
};

const Toast = ({ message, visible }) => (
  <div style={{
    position:"fixed",bottom:24,left:"50%",transform:`translateX(-50%) translateY(${visible ? 0 : 20}px)`,
    opacity:visible?1:0,transition:"all 0.3s ease",zIndex:200,
    background:"rgba(0,0,0,0.8)",backdropFilter:"blur(20px)",color:"#fff",
    padding:"10px 24px",borderRadius:14,fontFamily:"var(--body)",fontSize:13,fontWeight:600,
    boxShadow:"0 8px 32px rgba(0,0,0,0.2)",pointerEvents:"none",
  }}>{message}</div>
);

// ═══════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("today"); // today, workspace, task, timer, rewards, allTasks
  const [activeWsId, setActiveWsId] = useState("cs301");
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [wsTab, setWsTab] = useState("Tasks");
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [xp, setXp] = useState(340);
  const [level, setLevel] = useState(4);
  const [streak, setStreak] = useState(7);
  const [totalPomosEver, setTotalPomosEver] = useState(148);
  const [totalTasksDone, setTotalTasksDone] = useState(34);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [timerTaskId, setTimerTaskId] = useState(null);
  const [sessionCount, setSessionCount] = useState(0); // pomodoros completed in current cycle (0-3)
  const WORK_DURATION = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;
  const CYCLE_LENGTH = 4; // long break after this many pomodoros
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
  const [intentionText, setIntentionText] = useState("Finish BST implementation and start graph theory reading. Take real breaks between sessions.");
  const [editingIntention, setEditingIntention] = useState(false);
  const [workspaces, setWorkspaces] = useState(INIT_WORKSPACES);
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsColor, setNewWsColor] = useState(WS_COLOR_OPTIONS[0]);
  const [newWsIcon, setNewWsIcon] = useState("Folder");
  const [wsNotes, setWsNotes] = useState([]);   // standalone workspace notes
  const [wsDocs, setWsDocs] = useState([]);      // standalone workspace docs
  const [showWsNote, setShowWsNote] = useState(false);
  const [wsNoteText, setWsNoteText] = useState("");
  const [wsNoteTitle, setWsNoteTitle] = useState("");
  const [showWsDoc, setShowWsDoc] = useState(false);
  const [wsDocName, setWsDocName] = useState("");
  const [wsDocType, setWsDocType] = useState("doc");

  // Show toast
  const flash = (msg) => { setToast({ msg, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200); };

  // Timer
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      if (!isBreak) {
        // Completed a pomodoro
        addXp(15);
        setTotalPomosEver(p => p + 1);
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);
        if (timerTaskId) {
          setTasks(ts => ts.map(t => t.id === timerTaskId ? { ...t, donePomos: Math.min(t.donePomos + 1, t.totalPomos) } : t));
        }
        // Determine break type
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

  // Toggle task
  const toggleTask = (id) => {
    setTasks(ts => ts.map(t => {
      if (t.id !== id) return t;
      const newDone = !t.done;
      if (newDone) { addXp(25); setTotalTasksDone(d => d + 1); flash("Task complete! +25 XP"); }
      return { ...t, done: newDone };
    }));
  };

  // Toggle subtask
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

  // Create task
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

  // Add note to task
  const addNote = () => {
    if (!newNoteText.trim() || !activeTaskId) return;
    const nid = "n" + Date.now();
    setTasks(ts => ts.map(t => t.id === activeTaskId ? { ...t, notes: [{ id: nid, text: newNoteText, time: "Just now" }, ...t.notes] } : t));
    setNewNoteText(""); setShowNewNote(false);
    flash("Note added!");
  };

  // Start focus on task
  const startFocus = (taskId) => {
    setTimerTaskId(taskId);
    setTimerActive(false);
    setIsBreak(false);
    setTimeLeft(WORK_DURATION);
    setPage("timer");
    setTimeout(() => setTimerActive(true), 300);
  };

  // Create workspace
  const createWorkspace = () => {
    if (!newWsName.trim()) return;
    const id = "ws" + Date.now();
    setWorkspaces(prev => [...prev, { id, name: newWsName, icon: newWsIcon, color: newWsColor }]);
    setNewWsName(""); setNewWsColor(WS_COLOR_OPTIONS[0]); setNewWsIcon("Folder"); setShowNewWs(false);
    flash("Workspace created!");
    goWs(id);
  };

  // Create standalone workspace note
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

  // Create standalone workspace document
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
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Filtered tasks for search
  const filteredTasks = searchQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  // Navigate helpers
  const goTask = (id) => { setActiveTaskId(id); setPage("task"); };
  const goWs = (id) => { setActiveWsId(id); setWsTab("Tasks"); setPage("workspace"); };
  const goToday = () => setPage("today");

  // ─── INPUT STYLE ───
  const inputStyle = {
    width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(0,0,0,0.08)",
    background:"rgba(0,0,0,0.02)", fontFamily:"var(--body)", fontSize:13, color:"var(--text)",
    outline:"none", transition:"border 0.2s",
  };

  // ═══════════════════════════════════════
  //  SIDEBAR
  // ═══════════════════════════════════════
  const renderSidebar = () => (
    <div style={{
      width: collapsed ? 72 : 250, flexShrink: 0,
      background: "#FAFAFA",
      borderRight: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column",
      transition: "width 0.25s ease", overflow: "hidden", zIndex: 10,
    }}>
      <div style={{ padding: collapsed ? "20px 20px 16px" : "20px 22px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div onClick={goToday} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #4F6EF7, #7C5CFC)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Zap size={18} color="#fff" /></div>
          {!collapsed && <div>
            <div style={{ fontFamily: "var(--heading)", fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: -0.3 }}>NexusFlow</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", fontWeight: 500, letterSpacing: 0.5 }}>Productivity Suite</div>
          </div>}
        </div>
      </div>

      <div style={{ padding: "14px 12px 6px" }}>
        {!collapsed && <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, padding: "0 10px", marginBottom: 8, fontWeight: 600 }}>Home</div>}
        {[
          { icon: <Home size={18} />, label: "Today", id: "today" },
          { icon: <ClipboardList size={18} />, label: "All Tasks", id: "allTasks" },
          { icon: <Timer size={18} />, label: "Focus Timer", id: "timer" },
          { icon: <Trophy size={18} />, label: "Rewards", id: "rewards" },
        ].map(nav => (
          <div key={nav.id} onClick={() => { setPage(nav.id); if(nav.id==="timer"){ setTimerTaskId(null); } }} style={{
            display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 18px" : "9px 14px",
            borderRadius: 12, cursor: "pointer", marginBottom: 2,
            background: page === nav.id ? "rgba(91,141,239,0.1)" : "transparent",
            color: page === nav.id ? "#5B8DEF" : "var(--muted)",
            fontFamily: "var(--body)", fontSize: 13, fontWeight: page === nav.id ? 700 : 500, transition: "all 0.15s",
          }}
            onMouseEnter={e => { if (page !== nav.id) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
            onMouseLeave={e => { if (page !== nav.id) e.currentTarget.style.background = page === nav.id ? "rgba(91,141,239,0.1)" : "transparent"; }}
          >
            <span style={{ fontSize: 16 }}>{nav.icon}</span>
            {!collapsed && nav.label}
            {!collapsed && nav.id === "timer" && timerActive && (
              <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10, color: "#5B8DEF", fontWeight: 700 }}>{fmt(timeLeft)}</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: "6px 12px", flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", marginBottom: 8 }}>
          {!collapsed && <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>Workspaces</div>}
          {!collapsed && <div onClick={() => setShowNewWs(true)} style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", cursor: "pointer" }}><Plus size={13} /></div>}
        </div>
        {ws.map(w => (
          <div key={w.id} onClick={() => goWs(w.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "9px 18px" : "9px 14px",
            borderRadius: 12, cursor: "pointer", marginBottom: 2,
            background: page === "workspace" && activeWsId === w.id ? `${w.color}12` : "transparent",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = page === "workspace" && activeWsId === w.id ? `${w.color}18` : "rgba(0,0,0,0.03)"}
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

      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <div onClick={() => setCollapsed(!collapsed)} style={{
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, padding: "8px 14px", borderRadius: 10, cursor: "pointer", color: "var(--muted)", fontFamily: "var(--body)", fontSize: 12,
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
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
        background: task.done ? "#f9f9fb" : "#ffffff",
        borderRadius:10,border:"1px solid rgba(0,0,0,0.06)",
        marginBottom:6,transition:"all 0.2s ease",opacity:task.done?0.55:1,cursor:"pointer",
        animation:`slideUp 0.3s ${idx*0.04}s both ease-out`,boxShadow:"0 1px 3px rgba(0,0,0,0.03)",
      }}
        onMouseEnter={e => { if(!task.done){ e.currentTarget.style.borderColor="rgba(0,0,0,0.12)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)"; }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(0,0,0,0.06)"; e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.03)"; }}
        onClick={() => goTask(task.id)}
      >
        <div onClick={e => { e.stopPropagation(); toggleTask(task.id); }} style={{
          width:20,height:20,borderRadius:6,flexShrink:0,
          background:task.done?(w?.color):"transparent",border:task.done?"none":"1.5px solid rgba(0,0,0,0.2)",
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
            {task.dueTime && <span style={{ fontFamily:"var(--mono)",fontSize:10,fontWeight:600,color:task.priority==="high"?"#EF4444":"var(--muted)",background:task.priority==="high"?"rgba(239,68,68,0.08)":"rgba(0,0,0,0.04)",padding:"2px 8px",borderRadius:8 }}><Clock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} /> {task.dueTime}</span>}
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
      <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:32,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-1 }}>{greeting}, Jordan</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:15,color:"var(--muted)",margin:"6px 0 0" }}>
            <strong style={{ color:"var(--text)" }}>{totalTasks - doneTasks} tasks</strong> and <strong style={{ color:"var(--text)" }}>{totalPomos - donePomos} pomodoros</strong> on your plate
          </p>
        </div>
        <div style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)",textAlign:"right" }}>
          <div style={{ fontWeight:700,color:"var(--text)",fontSize:14 }}>Friday, March 21</div>
          <div style={{ fontSize:11 }}>Week 12</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:24 }}>
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
        <Glass style={{ padding:18,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ position:"relative",width:48,height:48,flexShrink:0 }}>
            <Ring percent={(donePomos/totalPomos)*100} size={48} stroke={4} color="#F59E0B" />
            <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:"var(--text)" }}>{donePomos}/{totalPomos}</div>
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>Pomodoros</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>~{(totalPomos-donePomos)*25}m remaining</div>
          </div>
        </Glass>
        <Glass style={{ padding:18,display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:32, color:"#EF4444", display:"flex", alignItems:"center", justifyContent:"center" }}><Flame size={32} /></span>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:22,fontWeight:800,color:"var(--text)" }}>{streak}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>day streak</div>
          </div>
        </Glass>
        <div onClick={() => { setTimerTaskId(null); setPage("timer"); }} style={{
          background:"linear-gradient(135deg, #5B8DEF, #A78BFA)",borderRadius:16,padding:20,
          display:"flex",alignItems:"center",justifyContent:"center",gap:14,cursor:"pointer",
          boxShadow:"0 4px 24px rgba(91,141,239,0.25)",transition:"all 0.25s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(91,141,239,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 24px rgba(91,141,239,0.25)"; }}
        >
          <div style={{ width:44,height:44,borderRadius:14,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}><Play fill="currentColor" size={20} /></div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"#fff" }}>Start Focus</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:11,color:"rgba(255,255,255,0.7)" }}>{timerActive ? fmt(timeLeft) : "25:00"}</div>
          </div>
        </div>
      </div>

      {/* Tasks + sidebar */}
      <div style={{ display:"flex",gap:22 }}>
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
                  <div style={{ flex:1,height:1,background:"rgba(0,0,0,0.06)",marginLeft:8 }} />
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>{bd}/{bt.length}</span>
                </div>
                {bt.map((task,i) => <TaskRow key={task.id} task={task} idx={bi*3+i} />)}
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div style={{ width:280,flexShrink:0 }}>

          <Glass style={{ padding:18,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 12px",fontWeight:700 }}>Upcoming</h3>
            {tasks.filter(t=>t.dueDate&&!t.done).slice(0,4).map((t,i) => (
              <div key={t.id} onClick={() => goTask(t.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<3?"1px solid rgba(0,0,0,0.04)":"none",cursor:"pointer" }}>
                <div style={{ width:5,height:5,borderRadius:"50%",background:t.priority==="high"?"#EF4444":"#F59E0B",flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)",fontWeight:600 }}>{t.title}</div>
                </div>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,fontWeight:600,color:t.priority==="high"?"#EF4444":"var(--muted)" }}>{t.dueDate}</span>
              </div>
            ))}
          </Glass>
          <Glass style={{ padding:18,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 10px",fontWeight:700 }}>Today's Intention</h3>
            {editingIntention ? (
              <div>
                <textarea value={intentionText} onChange={e => setIntentionText(e.target.value)} style={{ ...inputStyle, minHeight:70,resize:"vertical",fontStyle:"italic" }} />
                <Btn small primary style={{ marginTop:8 }} onClick={() => { setEditingIntention(false); flash("Intention saved!"); }}>Save</Btn>
              </div>
            ) : (
              <div>
                <div style={{ background:"rgba(0,0,0,0.02)",borderRadius:10,padding:14,border:"1px dashed rgba(0,0,0,0.08)",fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)",lineHeight:1.7,fontStyle:"italic" }}>"{intentionText}"</div>
                <div onClick={() => setEditingIntention(true)} style={{ fontFamily:"var(--body)",fontSize:11,color:"#5B8DEF",cursor:"pointer",marginTop:8,fontWeight:600 }}>Edit intention</div>
              </div>
            )}
          </Glass>
          <Glass style={{ padding:18,background:"linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.04))",border:"1px solid rgba(251,191,36,0.15)" }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 8px",fontWeight:700 }}>Today's Reward</h3>
            <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)" }}>Finish all tasks: <strong>Movie night!</strong></div>
            <div style={{ marginTop:10,height:5,background:"rgba(0,0,0,0.06)",borderRadius:6,overflow:"hidden" }}>
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
        {/* Tabs */}
        <div style={{ display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
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
            {allNotes.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:20,textAlign:"center" }}>No notes yet. Add a standalone note or notes within tasks.</div>}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
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
            {allDocs.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:20,textAlign:"center" }}>No documents yet. Add files here or within tasks.</div>}
            {allDocs.map((a,i) => (
              <Glass key={a.id || i} hover style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 18px",marginBottom:8,cursor:"pointer" }} onClick={() => a.taskId ? goTask(a.taskId) : null}>
                <div style={{ width:40,height:40,borderRadius:10,background:"rgba(0,0,0,0.04)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)" }}>{typeof a.icon === "string" ? getDocIcon(a.icon) : a.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{a.name}</div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{a.size}{a.taskTitle ? ` · from "${a.taskTitle}"` : " · standalone"}</div>
                </div>
                <span style={{ background:"rgba(0,0,0,0.04)",padding:"3px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>{a.type}</span>
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
        <div onClick={() => setPage(page === "task" ? "today" : page)} style={{ fontFamily:"var(--body)",fontSize:13,color:"#5B8DEF",cursor:"pointer",marginBottom:16,fontWeight:600 }}>← Back</div>
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

        {/* Pomodoro progress */}
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

        {/* Subtasks */}
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

        {/* Notes */}
        <Glass style={{ padding:20,marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:0,fontWeight:700 }}>Notes</h3>
            <Btn small primary color="#5B8DEF" onClick={() => setShowNewNote(true)}>+ Add Note</Btn>
          </div>
          {activeTask.notes.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:"10px 0" }}>No notes yet. Add one to capture your thoughts.</div>}
          {activeTask.notes.map(n => (
            <div key={n.id} style={{ background:"rgba(0,0,0,0.02)",borderRadius:10,padding:14,marginBottom:8,border:"1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",lineHeight:1.7 }}>{n.text}</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:6 }}>{n.time}</div>
            </div>
          ))}
        </Glass>

        {/* Attachments */}
        <Glass style={{ padding:20 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:0,fontWeight:700 }}>Attachments</h3>
            <Btn small onClick={() => flash("File upload coming in the full build!")}><Paperclip size={14} style={{ marginRight: 4 }} /> Upload</Btn>
          </div>
          {activeTask.attachments.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:"10px 0" }}>No attachments yet.</div>}
          <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
            {activeTask.attachments.map((a,i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 16px",background:"rgba(0,0,0,0.02)",borderRadius:12,border:"1px solid rgba(0,0,0,0.06)",cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
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

        {/* Reward */}
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
        <div onClick={goToday} style={{ position:"absolute",top:0,left:0,fontFamily:"var(--body)",fontSize:13,color:"#5B8DEF",cursor:"pointer",fontWeight:600 }}>← Exit Focus</div>

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
            background: timerActive ? "rgba(0,0,0,0.06)" : "linear-gradient(135deg, #5B8DEF, #A78BFA)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
            color: timerActive ? "var(--text)" : "#fff",
            boxShadow: timerActive ? "none" : "0 4px 20px rgba(91,141,239,0.3)",
            transition:"all 0.2s",
          }}>{timerActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}</div>
          <div onClick={() => { setTimerActive(false); setIsBreak(false); setTimeLeft(WORK_DURATION); flash("Timer reset"); }} style={{
            width:64,height:64,borderRadius:18,background:"rgba(0,0,0,0.04)",border:"1px solid rgba(0,0,0,0.08)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",
          }}><RotateCcw size={20} /></div>
          <div onClick={() => { setTimerActive(false); if(!isBreak){ const nextBreakDuration = (sessionCount + 1) % CYCLE_LENGTH === 0 ? LONG_BREAK : SHORT_BREAK; setIsBreak(true); setTimeLeft(nextBreakDuration); flash("Skipped to break"); } else { setIsBreak(false); setTimeLeft(WORK_DURATION); flash("Break skipped"); } }} style={{
            width:64,height:64,borderRadius:18,background:"rgba(0,0,0,0.04)",border:"1px solid rgba(0,0,0,0.08)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",
          }}><SkipForward size={20} /></div>
        </div>

        <div style={{ position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>
            {timerTask ? `${timerTask.donePomos}/${timerTask.totalPomos} pomodoros` : "Free session"} · Session {isBreak ? sessionInCycle : sessionInCycle} of {CYCLE_LENGTH} · +15 XP
          </span>
          <div style={{ display:"flex",alignItems:"center",gap:6 }}>
            <span style={{ display: "flex" }}><Flame size={14} color="#EF4444" /></span>
            <span style={{ fontFamily:"var(--mono)",fontSize:12,color:"#EF4444",fontWeight:700 }}>{streak}</span>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  PAGE: REWARDS
  // ═══════════════════════════════════════
  const renderRewards = () => (
    <div>
      <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:"0 0 4px",fontWeight:800,letterSpacing:-0.8 }}>Your Progress</h1>
      <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"0 0 24px" }}>Every step forward earns XP. Consistency unlocks rewards.</p>

      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:24 }}>
        <span style={{ fontFamily:"var(--mono)",fontSize:12,color:"#A78BFA",fontWeight:700 }}>LVL {level}</span>
        <div style={{ flex:1,height:8,background:"rgba(0,0,0,0.06)",borderRadius:8,overflow:"hidden" }}>
          <div style={{ width:`${(xp/500)*100}%`,height:"100%",borderRadius:8,background:"linear-gradient(90deg, #A78BFA, #5B8DEF)",transition:"width 0.8s" }} />
        </div>
        <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{xp}/500 XP</span>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:28 }}>
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
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
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
            {b.earned && <span style={{ marginLeft:"auto",fontFamily:"var(--mono)",fontSize:9,color:"#22C55E",fontWeight:700 }}>EARNED</span>}
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
  //  BREADCRUMB
  // ═══════════════════════════════════════
  const breadcrumb = () => {
    const homeIcon = <Home size={14} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 4 }} />;
    if (page === "today") return <><strong style={{ color:"var(--text)" }}>{homeIcon} Today</strong></>;
    if (page === "allTasks") return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>All Tasks</strong></>;
    if (page === "timer") return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Focus Timer</strong></>;
    if (page === "rewards") return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Rewards</strong></>;
    if (page === "workspace") return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:activeWs?.color }}>{activeWs?.icon} {activeWs?.name}</strong></>;
    if (page === "task" && activeTask) { const w = ws.find(x=>x.id===activeTask.wsId); return <><span onClick={goToday} style={{ cursor:"pointer" }}>{homeIcon}</span> / <span onClick={() => goWs(activeTask.wsId)} style={{ cursor:"pointer",color:w?.color }}>{w?.name}</span> / <strong style={{ color:"var(--text)" }}>{activeTask.title}</strong></>; }
    return null;
  };

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════
  return (
    <div style={{
      "--heading":"'Inter','SF Pro Display',-apple-system,sans-serif",
      "--body":"'Inter','SF Pro Text',-apple-system,sans-serif",
      "--mono":"'JetBrains Mono','SF Mono',monospace",
      "--text":"#111827","--muted":"rgba(0,0,0,0.45)",
      display:"flex",height:"100vh",overflow:"hidden",
      background:"#F3F4F6",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:3px}
        textarea:focus,input:focus{border-color:rgba(79,110,247,0.4)!important;box-shadow:0 0 0 3px rgba(79,110,247,0.08)}
      `}</style>

      {renderSidebar()}

      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Top bar */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 28px",
          background:"#ffffff",borderBottom:"1px solid rgba(0,0,0,0.06)",
        }}>
          <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>{breadcrumb()}</span>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div onClick={() => setShowSearch(true)} style={{ background:"rgba(0,0,0,0.04)",borderRadius:10,padding:"7px 14px",fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",display:"flex",alignItems:"center",gap:6,width:200,cursor:"pointer",border:"1px solid rgba(0,0,0,0.04)" }}><Search size={14} /> Search...</div>
            <div style={{ display:"flex",alignItems:"center",gap:8,width:160 }}>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"#A78BFA",fontWeight:700 }}>LVL {level}</span>
              <div style={{ flex:1,height:5,background:"rgba(0,0,0,0.06)",borderRadius:8,overflow:"hidden" }}>
                <div style={{ width:`${(xp/500)*100}%`,height:"100%",borderRadius:8,background:"linear-gradient(90deg,#A78BFA,#5B8DEF)",transition:"width 0.8s" }} />
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:4 }}>
              <span style={{ display: "flex" }}><Flame size={14} color="#EF4444" /></span>
              <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"#EF4444",fontWeight:700 }}>{streak}</span>
            </div>
            <div onClick={() => setPage("rewards")} style={{ width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#5B8DEF,#A78BFA)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--body)",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer" }}>JD</div>
          </div>
        </div>

        <div style={{ flex:1,overflow:"auto",padding: page === "timer" ? "28px 28px" : "24px 28px", minHeight: 0 }}>
          {page === "today" && renderToday()}
          {page === "workspace" && renderWorkspace()}
          {page === "task" && renderTask()}
          {page === "timer" && renderTimer()}
          {page === "rewards" && renderRewards()}
          {page === "allTasks" && renderAllTasks()}
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
                  background: newTaskPriority === p ? `${pColors[p]}18` : "rgba(0,0,0,0.03)",
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
                  background: newTaskWs === w.id ? `${w.color}18` : "rgba(0,0,0,0.03)",
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

      {/* Search modal */}
      <Modal open={showSearch} onClose={() => { setShowSearch(false); setSearchQuery(""); }} title="Search">
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tasks, notes, docs..." style={inputStyle} autoFocus />
        <div style={{ marginTop:14,maxHeight:300,overflow:"auto" }}>
          {searchQuery && filteredTasks.map(t => {
            const w = ws.find(x => x.id === t.wsId);
            return (
              <div key={t.id} onClick={() => { goTask(t.id); setShowSearch(false); setSearchQuery(""); }} style={{
                display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(0,0,0,0.04)",cursor:"pointer",
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

      {/* New Workspace modal */}
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
                  background: newWsIcon === opt.key ? `${newWsColor}18` : "rgba(0,0,0,0.03)",
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

      {/* Workspace Note modal */}
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

      {/* Workspace Document modal */}
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
                background: wsDocType === t.key ? `${activeWs?.color || "#5B8DEF"}18` : "rgba(0,0,0,0.03)",
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

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}
