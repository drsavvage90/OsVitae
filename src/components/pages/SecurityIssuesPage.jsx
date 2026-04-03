import { useState } from "react";
import { Shield, Bug, AlertTriangle, CheckCircle2, Plus, Clock } from "lucide-react";
import { Glass, Btn, Modal } from "../ui";
import { TASK_TYPES, getWsIcon } from "../../lib/constants";

const SECURITY_TYPES = ["security", "bug", "incident"];
const TYPE_META = Object.fromEntries(TASK_TYPES.filter(t => SECURITY_TYPES.includes(t.key)).map(t => [t.key, t]));
const TYPE_ICONS = { security: Shield, bug: Bug, incident: AlertTriangle };

export default function SecurityIssuesPage({
  tasks, ws, projects, pColors, goTask, updateTaskField,
  setShowNewTask, setNewTaskType,
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [_showNewSecurity, _setShowNewSecurity] = useState(false);

  // All security/bug/incident tasks across workspaces
  const secTasks = tasks.filter(t => SECURITY_TYPES.includes(t.taskType));

  // Stats
  const openSecurity = secTasks.filter(t => t.taskType === "security" && !t.done).length;
  const openBugs = secTasks.filter(t => t.taskType === "bug" && !t.done).length;
  const openIncidents = secTasks.filter(t => t.taskType === "incident" && !t.done).length;
  const now = new Date();
  const resolvedThisMonth = secTasks.filter(t => {
    if (!t.done) return false;
    const upd = t.updatedAt ? new Date(t.updatedAt) : null;
    return upd && upd.getMonth() === now.getMonth() && upd.getFullYear() === now.getFullYear();
  }).length;

  // Filtered list
  let filtered = secTasks;
  if (typeFilter !== "all") filtered = filtered.filter(t => t.taskType === typeFilter);
  if (priorityFilter !== "all") filtered = filtered.filter(t => t.priority === priorityFilter);
  if (statusFilter === "open") filtered = filtered.filter(t => !t.done);
  else if (statusFilter === "done") filtered = filtered.filter(t => t.done);

  // Sort: open first, then by priority (high > medium > low)
  const prioOrder = { high: 0, medium: 1, low: 2 };
  filtered.sort((a, b) => (a.done - b.done) || ((prioOrder[a.priority] ?? 1) - (prioOrder[b.priority] ?? 1)));

  const today = new Date().toISOString().split("T")[0];

  const statCards = [
    { label: "Open Security Issues", count: openSecurity, color: TYPE_META.security?.color, Icon: Shield },
    { label: "Open Bugs", count: openBugs, color: TYPE_META.bug?.color, Icon: Bug },
    { label: "Open Incidents", count: openIncidents, color: TYPE_META.incident?.color, Icon: AlertTriangle },
    { label: "Resolved This Month", count: resolvedThisMonth, color: "var(--success)", Icon: CheckCircle2 },
  ];

  const FilterPill = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
      padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
      background: active ? "var(--primary)" : "transparent",
      color: active ? "var(--text-on-primary)" : "var(--muted)",
      fontFamily: "var(--body)", fontSize: 11, fontWeight: 600, transition: "all 0.15s",
    }}>{children}</button>
  );

  const handleNewSecurityIssue = () => {
    if (setNewTaskType) setNewTaskType("security");
    setShowNewTask(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: 0, fontWeight: 800 }}>Security Issues</h1>
        <Btn primary onClick={handleNewSecurityIssue}><Plus size={14} style={{ marginRight: 4 }} /> New Security Issue</Btn>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {statCards.map(({ label, count, color, Icon }) => (
          <Glass key={label} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${typeof color === "string" && color.startsWith("#") ? color : ""}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{count}</span>
            </div>
            <div style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
          </Glass>
        ))}
      </div>

      {/* Filter Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600, marginRight: 4 }}>Type:</span>
          <div style={{ display: "flex", background: "var(--subtle-bg)", borderRadius: 8, padding: 2, border: "1px solid var(--border)" }}>
            {[{ key: "all", label: "All" }, ...TASK_TYPES.filter(t => SECURITY_TYPES.includes(t.key)).map(t => ({ key: t.key, label: t.label }))].map(f => (
              <FilterPill key={f.key} active={typeFilter === f.key} onClick={() => setTypeFilter(f.key)}>{f.label}</FilterPill>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600, marginRight: 4 }}>Priority:</span>
          <div style={{ display: "flex", background: "var(--subtle-bg)", borderRadius: 8, padding: 2, border: "1px solid var(--border)" }}>
            {["all", "high", "medium", "low"].map(p => (
              <FilterPill key={p} active={priorityFilter === p} onClick={() => setPriorityFilter(p)}>{p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}</FilterPill>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600, marginRight: 4 }}>Status:</span>
          <div style={{ display: "flex", background: "var(--subtle-bg)", borderRadius: 8, padding: 2, border: "1px solid var(--border)" }}>
            {[{ key: "all", label: "All" }, { key: "open", label: "Open" }, { key: "done", label: "Done" }].map(s => (
              <FilterPill key={s.key} active={statusFilter === s.key} onClick={() => setStatusFilter(s.key)}>{s.label}</FilterPill>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      {filtered.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((task, idx) => {
            const w = ws.find(w => w.id === task.wsId);
            const proj = projects.find(p => p.id === task.projectId);
            const tt = TYPE_META[task.taskType];
            const overdue = task.dueDate && task.dueDate < today && !task.done;
            const TypeIcon = TYPE_ICONS[task.taskType] || Shield;

            return (
              <div key={task.id} onClick={() => goTask(task.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                background: "var(--card-bg)", backdropFilter: "blur(20px)",
                borderRadius: 12, border: "1px solid var(--card-border)",
                cursor: "pointer", transition: "all 0.2s ease", opacity: task.done ? 0.55 : 1,
                animation: `slideUp 0.3s ${idx * 0.04}s both ease-out`, boxShadow: "var(--card-shadow-sm)",
              }}
                onMouseEnter={e => { if (!task.done) { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "var(--hover-shadow)"; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "var(--card-shadow-sm)"; }}
              >
                {/* Priority dot */}
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: pColors[task.priority], flexShrink: 0 }} />

                {/* Type badge */}
                {tt && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
                    color: tt.color, background: `${tt.color}18`,
                    padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", flexShrink: 0,
                  }}>
                    <TypeIcon size={10} /> {tt.label}
                  </span>
                )}

                {/* Title & breadcrumb */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontFamily: "var(--heading)", fontSize: 14, fontWeight: 600, color: "var(--text)",
                    textDecoration: task.done ? "line-through" : "none",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
                  }}>{task.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    {w && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        background: `${w.color}14`, padding: "1px 8px", borderRadius: 6,
                        fontFamily: "var(--mono)", fontSize: 10, color: w.color, fontWeight: 600,
                      }}>{getWsIcon(w.icon, 9)} {w.name}</span>
                    )}
                    {proj && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        background: `${proj.color}14`, padding: "1px 8px", borderRadius: 6,
                        fontFamily: "var(--mono)", fontSize: 10, color: proj.color, fontWeight: 600,
                      }}>{getWsIcon(proj.icon, 9)} {proj.name}</span>
                    )}
                  </div>
                </div>

                {/* Due date */}
                {task.dueDate && (
                  <span style={{
                    fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600, flexShrink: 0,
                    color: overdue ? "var(--danger)" : "var(--muted)",
                    background: overdue ? "rgba(239,68,68,0.08)" : "var(--subtle-bg)",
                    padding: "2px 8px", borderRadius: 8,
                    display: "inline-flex", alignItems: "center", gap: 3,
                  }}>
                    <Clock size={10} /> {task.dueDate}
                  </span>
                )}

                {/* Status pill */}
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  padding: "3px 10px", borderRadius: 8, flexShrink: 0,
                  color: task.done ? "var(--success)" : "var(--warning)",
                  background: task.done ? "var(--success-bg)" : "rgba(245,158,11,0.10)",
                }}>{task.done ? "Done" : "Open"}</span>

                {/* Quick action: mark done */}
                {!task.done && (
                  <Btn small onClick={e => { e.stopPropagation(); updateTaskField(task.id, "done", true); }}>
                    <CheckCircle2 size={12} style={{ marginRight: 3 }} /> Done
                  </Btn>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{"\uD83D\uDD12"}</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No issues found</div>
          <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            {typeFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters."
              : "Create a security issue, bug, or incident to track here."}
          </div>
          {typeFilter === "all" && priorityFilter === "all" && statusFilter === "all" && (
            <Btn primary onClick={handleNewSecurityIssue}>+ New Security Issue</Btn>
          )}
        </div>
      )}
    </div>
  );
}
