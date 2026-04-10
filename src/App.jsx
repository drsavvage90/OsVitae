import { useState, useEffect } from "react";
import {
  Wallet, Check, Search, Menu, X,
} from "lucide-react";
import { supabase, invokeFunction } from "./lib/supabase";
import { THEMES } from "./lib/constants";
import { Glass, Btn, Modal, Toast } from "./components/ui";
import { getUserId } from "./lib/getUserId";
import { logger } from "./lib/logger";
import { sanitizeText, MAX_NAME } from "./lib/validate";
import { useFlash } from "./hooks/useFlash";

import { useFinance } from "./hooks/useFinance";
import { useHousehold } from "./hooks/useHousehold";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./components/pages/DashboardPage";
import FinancePage from "./components/pages/FinancePage";
import SettingsPage from "./components/pages/SettingsPage";




// ═══════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [themeName, setThemeName] = useState(() => localStorage.getItem("osvitae-theme") || "default");
  const theme = THEMES[themeName] || THEMES.default;
  const toggleTheme = () => {
    const next = themeName === "default" ? "halo" : "default";
    setThemeName(next);
    localStorage.setItem("osvitae-theme", next);
  };

  const { toast, flash } = useFlash();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // ─── PROFILE STATE ───
  const [profileData, setProfileData] = useState({
    preferred_name: "", country: "",
  });
  const [_profileLoaded, setProfileLoaded] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    customCategories: _customCategories, setCustomCategories, getCategories,
    addCategory, renameCategory, deleteCategory, seedDefaultCategories,
    accounts, setAccounts, addAccount, updateAccount, deleteAccount: deleteFinanceAccount,
    netWorthHistory, setNetWorthHistory,
  } = useFinance(flash);

  const {
    household, members: householdMembers, pendingInvites, incomingInvite,
    loading: householdLoading, createHousehold, inviteMember, acceptInvite, declineInvite,
  } = useHousehold(flash);

  // Computed
  const displayName = profileData.preferred_name || "";
  const hour = new Date().getHours();
  const greeting = (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening") + (displayName ? `, ${displayName}` : "");

  // Navigate helpers
  const goDashboard = () => { setPage("dashboard"); setShowMobileSidebar(false); };

  // ─── INPUT STYLE ───
  const inputStyle = {
    width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid var(--border)",
    background:"var(--input-bg)", fontFamily:"var(--body)", fontSize:13, color:"var(--text)",
    outline:"none", transition:"border 0.2s",
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

    // Load finance data in parallel
    const [
      { data: dbTransactions }, { data: dbBills }, { data: dbBillPayments }, { data: dbBudgets },
      { data: dbFinanceCategories },
      { data: dbAccounts },
      { data: dbNetWorthHistory },
    ] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("bills").select("*").eq("user_id", userId),
      supabase.from("bill_payments").select("*").eq("user_id", userId),
      supabase.from("budgets").select("*").eq("user_id", userId),
      supabase.from("finance_categories").select("*").eq("user_id", userId).order("sort_order"),
      supabase.from("accounts").select("*").eq("user_id", userId),
      supabase.from("net_worth_history").select("*").eq("user_id", userId).order("snapshot_date"),
    ]);

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

    if (dbAccounts) {
      setAccounts(dbAccounts.map(a => ({
        id: a.id, name: a.name, type: a.type, balance: parseFloat(a.balance),
      })));
    }

    if (dbNetWorthHistory) {
      setNetWorthHistory(dbNetWorthHistory.map(h => ({
        date: h.snapshot_date, netWorth: parseFloat(h.net_worth), assets: parseFloat(h.total_assets), liabilities: parseFloat(h.total_liabilities),
      })));
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

  // ═══════════════════════════════════════
  //  BREADCRUMB
  // ═══════════════════════════════════════
  const breadcrumb = () => {
    const homeIcon = <Wallet size={14} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 4 }} />;
    const crumbs = {
      dashboard: <><strong style={{ color:"var(--text)" }}>{homeIcon} Dashboard</strong></>,
      finance: <><span onClick={goDashboard} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Finance</strong></>,
      settings: <><span onClick={goDashboard} style={{ cursor:"pointer" }}>{homeIcon}</span> / <strong style={{ color:"var(--text)" }}>Settings</strong></>,
    };
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

        /* ── iPhone 17 / 17 Pro (≤430px portrait) ── */
        @media(max-width:430px){
          .mobile-hamburger{display:flex}
          .sidebar-desktop{display:none!important}
          .mobile-sidebar-overlay{display:block}
          .topbar-breadcrumb{display:none}
          .topbar-search{width:auto;flex:1}
          .stats-grid{grid-template-columns:1fr!important}
          .main-content{padding:12px 14px!important}
          .modal-inner{width:calc(100vw - 24px)!important;max-width:none;margin:12px;max-height:calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px)!important}
          .today-heading{font-size:24px!important}
        }

        /* ── Larger phones / small tablets (431-600px) ── */
        @media(min-width:431px) and (max-width:600px){
          .mobile-hamburger{display:flex}
          .sidebar-desktop{display:none!important}
          .mobile-sidebar-overlay{display:block}
          .topbar-breadcrumb{display:none}
          .topbar-search{width:auto;flex:1}
          .stats-grid{grid-template-columns:1fr 1fr!important}
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
          .stats-grid{grid-template-columns:1fr 1fr!important}
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
          .stats-grid{grid-template-columns:1fr 1fr!important}
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
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} page={page} setPage={setPage} themeName={themeName} toggleTheme={toggleTheme} setShowMobileSidebar={setShowMobileSidebar} signOut={handleSignOut} />
          </div>
        </div>
      )}

      <div className="sidebar-desktop">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} page={page} setPage={setPage} themeName={themeName} toggleTheme={toggleTheme} setShowMobileSidebar={setShowMobileSidebar} signOut={handleSignOut} />
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
            <div style={{ display:"flex",alignItems:"center",gap:4 }}>
              <div style={{ width:32,height:32,borderRadius:10,background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--body)",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",flexShrink:0 }}>{profileData.preferred_name ? profileData.preferred_name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "?"}</div>
            </div>
          </div>
        </div>

        <div className="main-content" style={{ flex:1,overflow:"auto",padding:"24px 28px", minHeight: 0, display:"flex", flexDirection:"column" }}>
          {page === "dashboard" && <DashboardPage greeting={greeting} transactions={transactions} bills={bills} billPayments={billPayments} budgets={budgets} accounts={accounts} netWorthHistory={netWorthHistory} getCategories={getCategories} setPage={setPage} />}
          {page === "finance" && <FinancePage transactions={transactions} financeTab={financeTab} setFinanceTab={setFinanceTab} setShowNewTransaction={setShowNewTransaction} deleteTransaction={deleteTransaction} setEditingTransaction={setEditingTransaction} saveBudget={saveBudget} addIncome={addIncome} togglePaid={togglePaid} addBill={addBill} deleteBill={deleteBill} setEditingBill={setEditingBill} budgets={budgets} editingBudget={editingBudget} setEditingBudget={setEditingBudget} editBudgetVal={editBudgetVal} setEditBudgetVal={setEditBudgetVal} newIncomeCategory={newIncomeCategory} setNewIncomeCategory={setNewIncomeCategory} newIncomeAmount={newIncomeAmount} setNewIncomeAmount={setNewIncomeAmount} newIncomeDesc={newIncomeDesc} setNewIncomeDesc={setNewIncomeDesc} newIncomeRecurring={newIncomeRecurring} setNewIncomeRecurring={setNewIncomeRecurring} bills={bills} billPayments={billPayments} newBillName={newBillName} setNewBillName={setNewBillName} newBillAmount={newBillAmount} setNewBillAmount={setNewBillAmount} newBillDueDay={newBillDueDay} setNewBillDueDay={setNewBillDueDay} newBillCategory={newBillCategory} setNewBillCategory={setNewBillCategory} inputStyle={inputStyle} getCategories={getCategories} addCategory={addCategory} renameCategory={renameCategory} deleteCategory={deleteCategory} accounts={accounts} addAccount={addAccount} updateAccount={updateAccount} deleteAccount={deleteFinanceAccount} netWorthHistory={netWorthHistory} flash={flash} />}
          {page === "settings" && <SettingsPage profileData={profileData} setProfileData={setProfileData} saveProfile={saveProfile} profileSaving={profileSaving} themeName={themeName} exportData={exportData} exporting={exporting} deleteAccount={deleteAccount} deleting={deleting} inputStyle={inputStyle} household={household} householdMembers={householdMembers} pendingInvites={pendingInvites} incomingInvite={incomingInvite} householdLoading={householdLoading} createHousehold={createHousehold} inviteMember={inviteMember} acceptInvite={acceptInvite} declineInvite={declineInvite} />}
        </div>
      </div>

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
