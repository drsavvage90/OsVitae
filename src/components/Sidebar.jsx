import {
  Wallet, Settings, Sun, Moon,
  ArrowLeft, LogOut,
} from "lucide-react";

export default function Sidebar({
  collapsed, setCollapsed,
  page, setPage,
  themeName, toggleTheme,
  setShowMobileSidebar, signOut,
}) {
  const goFinance = () => { setPage("finance"); setShowMobileSidebar(false); };

  return (
    <div style={{
      width: collapsed ? 72 : 250, flexShrink: 0, height: "100%",
      background: "var(--sidebar-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderRight: "1px solid var(--sidebar-border)", display: "flex", flexDirection: "column",
      transition: "width 0.25s ease, background 0.3s ease", overflow: "hidden", zIndex: 10,
    }}>
      <div style={{ padding: collapsed ? "20px 20px 16px" : "20px 22px 16px", borderBottom: "1px solid var(--border-light)" }}>
        <div onClick={goFinance} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}><img src="/favicon.png" alt="OSVitae" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
          {!collapsed && <div>
            <div style={{ fontFamily: "var(--heading)", fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: -0.3 }}>OSVitae</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", fontWeight: 500, letterSpacing: 0.5 }}>Personal Finance</div>
          </div>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        <div style={{ padding: "8px 12px 2px" }}>
          {[
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
        <div onClick={signOut} style={{
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, padding: "8px 14px", borderRadius: 10, cursor: "pointer", color: "var(--muted)", fontFamily: "var(--body)", fontSize: 12,
        }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 13 }}><LogOut size={14} /></span>
          {!collapsed && "Sign Out"}
        </div>
      </div>
    </div>
  );
}
