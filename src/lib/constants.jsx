import {
  Monitor, Brain, Book, Leaf, Briefcase, Folder, Heart, Star,
  Coffee, Music, Camera, Globe, Lightbulb, Rocket, Compass,
  Palette, Hash, Anchor, Award, Bell, Sprout, TreePine, Mountain,
  Zap, Target, Bird, Waves,
} from "lucide-react";

// ═══════════════════════════════════════
//  WORKSPACE OPTIONS
// ═══════════════════════════════════════
export const WS_ICON_OPTIONS = [
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

export const WS_COLOR_OPTIONS = [
  "#5B8DEF", "#E87B7B", "#A78BFA", "#4ADE80", "#FBBF24",
  "#F97316", "#EC4899", "#14B8A6", "#6366F1", "#8B5CF6",
];

export const getWsIcon = (iconKey, size = 16) => {
  const found = WS_ICON_OPTIONS.find(o => o.key === iconKey);
  if (found) {
    const IconComp = found.component;
    return <IconComp size={size} />;
  }
  return <Folder size={size} />;
};

// ═══════════════════════════════════════
//  ACHIEVEMENTS
// ═══════════════════════════════════════
export const ACHIEVEMENTS = [
  { id: "a1", icon: <Sprout size={24} />, title: "First Sprout", desc: "Complete your first pomodoro", earned: false },
  { id: "a2", icon: <Leaf size={16} />, title: "Growing Strong", desc: "Complete 10 pomodoros", earned: false },
  { id: "a3", icon: <TreePine size={24} />, title: "Deep Roots", desc: "Maintain a 7-day streak", earned: false },
  { id: "a4", icon: <Mountain size={24} />, title: "Summit", desc: "Complete 50 pomodoros", earned: false },
  { id: "a5", icon: <Zap size={24} />, title: "Lightning Focus", desc: "5 pomodoros in one day", earned: false },
  { id: "a6", icon: <Target size={24} />, title: "Bullseye", desc: "Complete all daily tasks 3 days running", earned: false },
  { id: "a7", icon: <Bird size={24} />, title: "Night Owl", desc: "Complete a task after 10pm", earned: false },
  { id: "a8", icon: <Waves size={24} />, title: "Flow Master", desc: "Maintain a 30-day streak", earned: false },
];

// ═══════════════════════════════════════
//  THEMES
// ═══════════════════════════════════════
export const THEMES = {
  default: {
    "--app-bg": "linear-gradient(135deg, #dfe7fd 0%, #e8dff5 25%, #f5e6f0 50%, #dceefb 75%, #e0f4f1 100%)",
    "--sidebar-bg": "rgba(255,255,255,0.55)",
    "--card-bg": "rgba(255,255,255,0.55)",
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
    "--muted": "rgba(30,30,60,0.6)",
    "--text-on-primary": "#fff",
    "--btn-text": "#fff",
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
    "--success-bg": "rgba(34,197,94,0.10)",
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
    "--input-bg": "rgba(74,222,128,0.08)",
    "--subtle-bg": "rgba(74,222,128,0.06)",
    "--hover-bg": "rgba(74,222,128,0.05)",
    "--card-border": "rgba(74,222,128,0.16)",
    "--border": "rgba(74,222,128,0.14)",
    "--border-light": "rgba(74,222,128,0.08)",
    "--border-hover": "rgba(74,222,128,0.25)",
    "--sidebar-border": "rgba(74,222,128,0.10)",
    "--text": "#E2E8F0",
    "--muted": "rgba(255,255,255,0.60)",
    "--text-on-primary": "#fff",
    "--btn-text": "#0A120E",
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
    "--success-bg": "rgba(0,230,118,0.10)",
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
    "--checkbox-border": "rgba(74,222,128,0.35)",
    "--heading": "'Inter','SF Pro Display',-apple-system,sans-serif",
    "--body": "'Inter','SF Pro Text',-apple-system,sans-serif",
    "--mono": "'JetBrains Mono','SF Mono',monospace",
  },
};

// ═══════════════════════════════════════
//  FINANCE DATA
// ═══════════════════════════════════════
export const FINANCE_CATEGORIES = {
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

export const ALL_FINANCE_CATS = [...FINANCE_CATEGORIES.income, ...FINANCE_CATEGORIES.expense];

// ═══════════════════════════════════════
//  INITIAL STATE
// ═══════════════════════════════════════
export const INIT_WORKSPACES = [];
export const INIT_TASKS = [];
export const INIT_HABITS = [];
export const INIT_TIME_BLOCKS = [];
export const INIT_INBOX = [];
export const INIT_WIKI = [];
export const INIT_TRANSACTIONS = [];
export const INIT_BUDGETS = [];

// ═══════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════
export const getToday = () => new Date().toISOString().split("T")[0];
