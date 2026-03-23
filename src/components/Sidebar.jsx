import { useState } from "react";
import {
  Home, Inbox, Calendar, ClipboardList, Timer, Repeat,
  Wallet, Library, RefreshCw, Trophy, Settings, Sun, Moon,
  ArrowLeft, Plus, ChevronDown, ChevronRight, Zap,
} from "lucide-react";
import { getWsIcon } from "../lib/constants";
import { Ring } from "./ui";

export default function Sidebar({
  collapsed, setCollapsed,
  page, setPage,
  themeName, toggleTheme,
  timerActive, timeLeft, fmt,
  inbox, ws, tasks, projects,
  activeWsId, activeProjectId, goWs, goProject, goToday,
  sidebarSections, setSidebarSections,
  setShowNewWs, setShowNewProject, setNewProjectWsId,
  setShowMobileSidebar, setTimerTaskId,
  doneTasks, totalTasks,
}) {
  const [expandedWs, setExpandedWs] = useState({});
  const toggleWsExpand = (id) => setExpandedWs(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{
      width: collapsed ? 72 : 250, flexShrink: 0, height: "100%",
      background: "var(--sidebar-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderRight: "1px solid var(--sidebar-border)", display: "flex", flexDirection: "column",
      transition: "width 0.25s ease, background 0.3s ease", overflow: "hidden", zIndex: 10,
    }}>
      <div style={{ padding: collapsed ? "20px 20px 16px" : "20px 22px 16px", borderBottom: "1px solid var(--border-light)" }}>
        <div onClick={goToday} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}><img src="/favicon.png" alt="OSVitae" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
          {!collapsed && <div>
            <div style={{ fontFamily: "var(--heading)", fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: -0.3 }}>OSVitae</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", fontWeight: 500, letterSpacing: 0.5 }}>Personal Suite</div>
          </div>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {/* Home section */}
        <div style={{ padding: "8px 12px 2px" }}>
          {!collapsed && <div onClick={() => setSidebarSections(s => ({ ...s, home: !s.home }))} style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, padding: "0 10px", marginBottom: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>Home<ChevronDown size={12} style={{ transition: "transform 0.2s", transform: sidebarSections.home ? "none" : "rotate(-90deg)" }} /></div>}
          {sidebarSections.home && [
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

        {/* Library section */}
        <div style={{ padding: "8px 12px 2px" }}>
          {!collapsed && <div onClick={() => setSidebarSections(s => ({ ...s, library: !s.library }))} style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, padding: "0 10px", marginBottom: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>Library<ChevronDown size={12} style={{ transition: "transform 0.2s", transform: sidebarSections.library ? "none" : "rotate(-90deg)" }} /></div>}
          {sidebarSections.library && [
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
          {sidebarSections.workspaces && ws.map(w => {
            const wsProjects = projects.filter(p => p.wsId === w.id);
            const isExpanded = expandedWs[w.id];
            const isWsActive = (page === "workspace" && activeWsId === w.id) || (page === "project" && activeWsId === w.id);
            return (
              <div key={w.id}>
                <div style={{
                  display: "flex", alignItems: "center", gap: collapsed ? 0 : 6, padding: collapsed ? "9px 18px" : "9px 10px",
                  borderRadius: 12, cursor: "pointer", marginBottom: 2,
                  background: isWsActive ? `${w.color}12` : "transparent",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = isWsActive ? `${w.color}18` : "var(--hover-bg)"}
                  onMouseLeave={e => e.currentTarget.style.background = isWsActive ? `${w.color}12` : "transparent"}
                >
                  {!collapsed && wsProjects.length > 0 && (
                    <div onClick={(e) => { e.stopPropagation(); toggleWsExpand(w.id); }} style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", flexShrink: 0 }}>
                      <ChevronRight size={11} style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "none" }} />
                    </div>
                  )}
                  {!collapsed && wsProjects.length === 0 && <div style={{ width: 16, flexShrink: 0 }} />}
                  <div onClick={() => goWs(w.id)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 9, flexShrink: 0, background: `${w.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: w.color }}>{getWsIcon(w.icon, 14)}</div>
                    {!collapsed && <>
                      <span style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{wsProjects.length}</span>
                    </>}
                  </div>
                </div>
                {/* Nested projects */}
                {!collapsed && isExpanded && wsProjects.map(p => {
                  const isProjectActive = page === "project" && activeProjectId === p.id;
                  const projectTaskCount = tasks.filter(t => t.projectId === p.id).length;
                  return (
                    <div key={p.id} onClick={() => goProject(p.id)} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "7px 14px 7px 42px",
                      borderRadius: 10, cursor: "pointer", marginBottom: 1,
                      background: isProjectActive ? `${p.color}12` : "transparent",
                      transition: "all 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = isProjectActive ? `${p.color}18` : "var(--hover-bg)"}
                      onMouseLeave={e => e.currentTarget.style.background = isProjectActive ? `${p.color}12` : "transparent"}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: `${p.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color }}>{getWsIcon(p.icon, 10)}</div>
                      <span style={{ fontFamily: "var(--body)", fontSize: 12, color: isProjectActive ? p.color : "var(--text)", fontWeight: isProjectActive ? 600 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>{projectTaskCount}</span>
                    </div>
                  );
                })}
                {!collapsed && isExpanded && (
                  <div onClick={() => { setNewProjectWsId(w.id); setShowNewProject(true); }} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 42px",
                    borderRadius: 10, cursor: "pointer", marginBottom: 2,
                    color: "var(--muted)", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = w.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
                  >
                    <Plus size={12} />
                    <span style={{ fontFamily: "var(--body)", fontSize: 11, fontWeight: 500 }}>New Project</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border-light)" }}>
        {totalTasks > 0 && (
          <div onClick={() => { setPage("today"); setShowMobileSidebar(false); }} style={{
            display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
            gap: 10, padding: "8px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 6,
          }}>
            <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
              <Ring percent={(doneTasks / totalTasks) * 100} size={28} stroke={3} color="#22C55E" />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 7, fontWeight: 700, color: "var(--text)" }}>{Math.round((doneTasks / totalTasks) * 100)}%</div>
            </div>
            {!collapsed && <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{doneTasks}/{totalTasks} tasks</span>}
          </div>
        )}
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
}
