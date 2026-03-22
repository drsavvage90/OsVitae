import { useState, useCallback } from "react";
import {
  Check, Timer, Trash2,
  ChevronDown, SlidersHorizontal, Eye, EyeOff,
} from "lucide-react";
import { Btn } from "./ui";
import { getWsIcon } from "../lib/constants";

// ═══════════════════════════════════════
//  GROUPING CONFIGURATIONS
// ═══════════════════════════════════════
const STATUS_COLUMNS = [
  { key: "todo",        label: "To Do",       color: "#6366F1" },
  { key: "in_progress", label: "In Progress", color: "#F59E0B" },
  { key: "in_review",   label: "In Review",   color: "#8B5CF6" },
  { key: "done",        label: "Done",        color: "#22C55E" },
];

const PRIORITY_COLUMNS = [
  { key: "high",   label: "High",   color: "#EF4444" },
  { key: "medium", label: "Medium", color: "#F59E0B" },
  { key: "low",    label: "Low",    color: "#22C55E" },
];

const SECTION_COLUMNS = [
  { key: "morning",   label: "Morning",   color: "#F59E0B" },
  { key: "afternoon", label: "Afternoon", color: "#5B8DEF" },
  { key: "evening",   label: "Evening",   color: "#8B5CF6" },
];

const GROUPING_OPTIONS = [
  { key: "status",    label: "Status" },
  { key: "priority",  label: "Priority" },
  { key: "section",   label: "Time of Day" },
  { key: "workspace", label: "Workspace" },
  { key: "project",   label: "Project" },
];

const SORT_OPTIONS = [
  { key: "priority",  label: "Priority" },
  { key: "dueDate",   label: "Due Date" },
  { key: "title",     label: "Title" },
  { key: "created",   label: "Created" },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// ═══════════════════════════════════════
//  KANBAN CARD
// ═══════════════════════════════════════
function KanbanCard({ task, ws, project, pColors, goTask, toggleTask, deleteTask, startFocus, onDragStart, onDragEnd }) {
  const subDone = task.subtasks.filter(s => s.done).length;
  const progress = task.subtasks.length > 0 ? (subDone / task.subtasks.length) * 100 : 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => goTask(task.id)}
      style={{
        background: task.done ? "var(--done-bg)" : "var(--card-bg)",
        borderRadius: 10,
        border: "1px solid var(--card-border)",
        padding: "12px 14px",
        cursor: "grab",
        opacity: task.done ? 0.55 : 1,
        transition: "all 0.2s ease",
        boxShadow: "var(--card-shadow-sm)",
        position: "relative",
      }}
      onMouseEnter={e => {
        if (!task.done) {
          e.currentTarget.style.borderColor = "var(--border-hover)";
          e.currentTarget.style.boxShadow = "var(--hover-shadow)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--card-border)";
        e.currentTarget.style.boxShadow = "var(--card-shadow-sm)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Header: checkbox + priority + title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div onClick={e => { e.stopPropagation(); toggleTask(task.id); }} style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
          background: task.done ? (ws?.color || "var(--primary)") : "transparent",
          border: task.done ? "none" : "1.5px solid var(--checkbox-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", cursor: "pointer", transition: "all 0.2s",
        }}>{task.done && <Check size={10} />}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: pColors[task.priority], flexShrink: 0 }} />
            <span style={{
              fontFamily: "var(--heading)", fontSize: 13, fontWeight: 600, color: "var(--text)",
              textDecoration: task.done ? "line-through" : "none",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{task.title}</span>
          </div>
          {task.desc && (
            <div style={{
              fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", marginTop: 3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{task.desc}</div>
          )}
        </div>
      </div>

      {/* Subtask progress bar */}
      {task.subtasks.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{
            height: 3, borderRadius: 2, background: "var(--subtle-bg)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 2, width: `${progress}%`,
              background: "var(--primary)", transition: "width 0.3s ease",
            }} />
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", marginTop: 3 }}>
            {subDone}/{task.subtasks.length} subtasks
          </div>
        </div>
      )}

      {/* Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        {ws && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            background: `${ws.color}14`, padding: "2px 8px", borderRadius: 6,
            fontFamily: "var(--mono)", fontSize: 9, color: ws.color, fontWeight: 600,
          }}>{getWsIcon(ws.icon, 9)} {ws.name}</span>
        )}
        {project && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            background: `${project.color}14`, padding: "2px 8px", borderRadius: 6,
            fontFamily: "var(--mono)", fontSize: 9, color: project.color, fontWeight: 600,
          }}>{getWsIcon(project.icon, 9)} {project.name}</span>
        )}
        {task.totalPomos > 0 && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>
            <Timer size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
            {task.donePomos}/{task.totalPomos}
          </span>
        )}
        {task.dueDate && (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600, color: "var(--muted)",
            background: "var(--subtle-bg)", padding: "2px 6px", borderRadius: 6,
          }}>{task.dueDate}</span>
        )}
        {task.reward && (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9, color: "#F59E0B",
            background: "rgba(251,191,36,0.08)", padding: "2px 6px", borderRadius: 6, fontWeight: 600,
          }}>★</span>
        )}
      </div>

      {/* Quick actions */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4, marginTop: 8,
        justifyContent: "flex-end",
      }}>
        <Btn primary color={ws?.color} small style={{ fontSize: 10, padding: "3px 8px" }}
          onClick={e => { e.stopPropagation(); startFocus(task.id); }}>Focus</Btn>
        <div role="button" onClick={e => { e.stopPropagation(); if (confirm("Delete this task?")) deleteTask(task.id); }}
          style={{ width:28, height:28, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", transition:"all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
        ><Trash2 size={13} /></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  KANBAN COLUMN
// ═══════════════════════════════════════
function KanbanColumn({ column, tasks, ws, projects, pColors, goTask, toggleTask, deleteTask, startFocus, onDropTask, draggedTaskId, collapsed, onToggleCollapse }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) onDropTask(taskId, column.key);
  }, [column.key, onDropTask]);

  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minWidth: 280, maxWidth: 320, flex: "1 1 280px",
        display: "flex", flexDirection: "column",
        background: dragOver ? "var(--primary-bg)" : "transparent",
        borderRadius: 12, padding: 2,
        transition: "background 0.2s ease",
        border: dragOver ? "2px dashed var(--primary)" : "2px dashed transparent",
      }}
    >
      {/* Column header */}
      <div
        onClick={onToggleCollapse}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
          cursor: "pointer", userSelect: "none",
        }}
      >
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: column.color, flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "var(--heading)", fontSize: 13, fontWeight: 700,
          color: "var(--text)", flex: 1,
        }}>{column.label}</span>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)",
          background: "var(--subtle-bg)", padding: "2px 8px", borderRadius: 8,
        }}>{tasks.length}</span>
        <ChevronDown size={14} style={{
          color: "var(--muted)", transition: "transform 0.2s",
          transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
        }} />
      </div>

      {/* Cards */}
      {!collapsed && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 8,
          padding: "4px 6px 8px", flex: 1,
          minHeight: 60, overflowY: "auto",
        }}>
          {tasks.length === 0 && (
            <div style={{
              fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)",
              textAlign: "center", padding: "20px 0", opacity: 0.6,
            }}>Drop tasks here</div>
          )}
          {tasks.map(task => {
            const w = ws.find(x => x.id === task.wsId);
            const proj = projects.find(p => p.id === task.projectId);
            return (
              <KanbanCard
                key={task.id} task={task} ws={w} project={proj} pColors={pColors}
                goTask={goTask} toggleTask={toggleTask} deleteTask={deleteTask} startFocus={startFocus}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", task.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.currentTarget.style.opacity = "0.4";
                }}
                onDragEnd={(e) => { e.currentTarget.style.opacity = "1"; }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
//  SETTINGS PANEL
// ═══════════════════════════════════════
function KanbanSettings({ groupBy, setGroupBy, sortBy, setSortBy, sortAsc, setSortAsc, hideDone, setHideDone, filterPriority, setFilterPriority, filterWs, setFilterWs, ws, onClose }) {
  return (
    <div style={{
      background: "var(--card-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderRadius: 12, border: "1px solid var(--card-border)", boxShadow: "var(--modal-shadow)",
      padding: 20, position: "absolute", top: 44, right: 0, zIndex: 100, width: 300,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontFamily: "var(--heading)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Board Settings</span>
      </div>

      {/* Group by */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Group by</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {GROUPING_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => setGroupBy(opt.key)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
              background: groupBy === opt.key ? "var(--primary)" : "var(--subtle-bg)",
              color: groupBy === opt.key ? "var(--text-on-primary)" : "var(--muted)",
              border: "none", transition: "all 0.15s",
            }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Sort by */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Sort cards by</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {SORT_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => { if (sortBy === opt.key) setSortAsc(!sortAsc); else { setSortBy(opt.key); setSortAsc(true); } }} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
              background: sortBy === opt.key ? "var(--primary)" : "var(--subtle-bg)",
              color: sortBy === opt.key ? "var(--text-on-primary)" : "var(--muted)",
              border: "none", transition: "all 0.15s",
            }}>{opt.label}{sortBy === opt.key ? (sortAsc ? " ↑" : " ↓") : ""}</button>
          ))}
        </div>
      </div>

      {/* Filter: priority */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Filter by priority</label>
        <div style={{ display: "flex", gap: 4 }}>
          {["all", "high", "medium", "low"].map(p => (
            <button key={p} onClick={() => setFilterPriority(p)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
              background: filterPriority === p ? "var(--primary)" : "var(--subtle-bg)",
              color: filterPriority === p ? "var(--text-on-primary)" : "var(--muted)",
              border: "none", transition: "all 0.15s", textTransform: "capitalize",
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Filter: workspace */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Filter by workspace</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          <button onClick={() => setFilterWs("all")} style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
            background: filterWs === "all" ? "var(--primary)" : "var(--subtle-bg)",
            color: filterWs === "all" ? "var(--text-on-primary)" : "var(--muted)",
            border: "none", transition: "all 0.15s",
          }}>All</button>
          <button onClick={() => setFilterWs("none")} style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
            background: filterWs === "none" ? "var(--primary)" : "var(--subtle-bg)",
            color: filterWs === "none" ? "var(--text-on-primary)" : "var(--muted)",
            border: "none", transition: "all 0.15s",
          }}>No Workspace</button>
          {ws.map(w => (
            <button key={w.id} onClick={() => setFilterWs(w.id)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
              background: filterWs === w.id ? w.color : "var(--subtle-bg)",
              color: filterWs === w.id ? "#fff" : "var(--muted)",
              border: "none", transition: "all 0.15s",
            }}>{w.name}</button>
          ))}
        </div>
      </div>

      {/* Hide done */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => setHideDone(!hideDone)} style={{
          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
          background: hideDone ? "var(--primary)" : "var(--subtle-bg)",
          color: hideDone ? "var(--text-on-primary)" : "var(--muted)",
          border: "none", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 4,
        }}>{hideDone ? <EyeOff size={11} /> : <Eye size={11} />} {hideDone ? "Completed hidden" : "Showing completed"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  MAIN KANBAN BOARD
// ═══════════════════════════════════════
export default function KanbanBoard({ tasks, ws, projects, pColors, goTask, toggleTask, deleteTask, startFocus, updateTaskStatus, updateTaskField }) {
  const [groupBy, setGroupBy] = useState("status");
  const [sortBy, setSortBy] = useState("priority");
  const [sortAsc, setSortAsc] = useState(true);
  const [hideDone, setHideDone] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterWs, setFilterWs] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [collapsedCols, setCollapsedCols] = useState({});
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // ─── Filter tasks ───
  let filtered = [...tasks];
  if (hideDone) filtered = filtered.filter(t => !t.done);
  if (filterPriority !== "all") filtered = filtered.filter(t => t.priority === filterPriority);
  if (filterWs === "none") filtered = filtered.filter(t => !t.wsId);
  else if (filterWs !== "all") filtered = filtered.filter(t => t.wsId === filterWs);

  // ─── Sort tasks ───
  const sortFn = (a, b) => {
    let cmp = 0;
    if (sortBy === "priority") cmp = (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
    else if (sortBy === "dueDate") {
      const da = a.dueDate || "9999-99-99", db = b.dueDate || "9999-99-99";
      cmp = da.localeCompare(db);
    }
    else if (sortBy === "title") cmp = a.title.localeCompare(b.title);
    else cmp = 0; // created = natural order
    return sortAsc ? cmp : -cmp;
  };
  filtered.sort(sortFn);

  // ─── Build columns based on groupBy ───
  let columns;
  let getColumnKey;

  if (groupBy === "status") {
    columns = STATUS_COLUMNS;
    getColumnKey = (t) => t.status || "todo";
  } else if (groupBy === "priority") {
    columns = PRIORITY_COLUMNS;
    getColumnKey = (t) => t.priority || "medium";
  } else if (groupBy === "section") {
    columns = SECTION_COLUMNS;
    getColumnKey = (t) => t.section || "afternoon";
  } else if (groupBy === "workspace") {
    const usedWsIds = new Set(filtered.map(t => t.wsId).filter(Boolean));
    columns = [
      { key: "__none__", label: "No Workspace", color: "var(--muted)" },
      ...ws.filter(w => usedWsIds.has(w.id)).map(w => ({ key: w.id, label: w.name, color: w.color })),
    ];
    getColumnKey = (t) => t.wsId || "__none__";
  } else if (groupBy === "project") {
    const usedProjIds = new Set(filtered.map(t => t.projectId).filter(Boolean));
    columns = [
      { key: "__none__", label: "No Project", color: "var(--muted)" },
      ...projects.filter(p => usedProjIds.has(p.id)).map(p => ({ key: p.id, label: p.name, color: p.color })),
    ];
    getColumnKey = (t) => t.projectId || "__none__";
  }

  // ─── Group tasks into columns ───
  const columnTasks = {};
  columns.forEach(c => { columnTasks[c.key] = []; });
  filtered.forEach(t => {
    const key = getColumnKey(t);
    if (columnTasks[key]) columnTasks[key].push(t);
    else {
      // Task belongs to a column that doesn't exist (e.g. deleted workspace) — put in first column
      columnTasks[columns[0].key].push(t);
    }
  });

  // ─── Handle drop ───
  const handleDropTask = useCallback((taskId, targetColumnKey) => {
    if (groupBy === "status") {
      updateTaskStatus(taskId, targetColumnKey);
    } else if (groupBy === "priority") {
      // For priority grouping, update priority via status update mechanism
      // We need a generic field updater — for now, update inline
      const task = tasks.find(t => t.id === taskId);
      if (task && task.priority !== targetColumnKey) {
        updateTaskField(taskId, "priority", targetColumnKey);
      }
    } else if (groupBy === "section") {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.section !== targetColumnKey) {
        updateTaskField(taskId, "section", targetColumnKey);
      }
    }
    // workspace/project grouping — drop changes the workspace/project
    else if (groupBy === "workspace") {
      const task = tasks.find(t => t.id === taskId);
      const newWsId = targetColumnKey === "__none__" ? null : targetColumnKey;
      if (task && task.wsId !== newWsId) {
        updateTaskField(taskId, "wsId", newWsId);
      }
    } else if (groupBy === "project") {
      const task = tasks.find(t => t.id === taskId);
      const newProjId = targetColumnKey === "__none__" ? null : targetColumnKey;
      if (task && task.projectId !== newProjId) {
        updateTaskField(taskId, "projectId", newProjId);
      }
    }
  }, [groupBy, tasks, updateTaskStatus, updateTaskField]);


  const toggleCollapse = (key) => {
    setCollapsedCols(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Stats
  const totalShown = filtered.length;
  const totalAll = tasks.length;

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
        flexWrap: "wrap",
      }}>
        {/* Group-by quick pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600, marginRight: 4 }}>Group:</span>
          {GROUPING_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => setGroupBy(opt.key)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
              background: groupBy === opt.key ? "var(--primary)" : "var(--subtle-bg)",
              color: groupBy === opt.key ? "var(--text-on-primary)" : "var(--muted)",
              border: "none", transition: "all 0.15s",
            }}>{opt.label}</button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Stats */}
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
          {totalShown}{totalShown !== totalAll ? ` / ${totalAll}` : ""} tasks
        </span>

        {/* Settings button */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowSettings(!showSettings)} style={{
            padding: "5px 10px", borderRadius: 8, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
            background: showSettings ? "var(--primary)" : "var(--subtle-bg)",
            color: showSettings ? "var(--text-on-primary)" : "var(--muted)",
            border: "none", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s",
          }}><SlidersHorizontal size={12} /> Settings</button>
          {showSettings && (
            <KanbanSettings
              groupBy={groupBy} setGroupBy={setGroupBy}
              sortBy={sortBy} setSortBy={setSortBy}
              sortAsc={sortAsc} setSortAsc={setSortAsc}
              hideDone={hideDone} setHideDone={setHideDone}
              filterPriority={filterPriority} setFilterPriority={setFilterPriority}
              filterWs={filterWs} setFilterWs={setFilterWs}
              ws={ws} onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>

      {/* Click outside to close settings */}
      {showSettings && (
        <div onClick={() => setShowSettings(false)} style={{
          position: "fixed", inset: 0, zIndex: 99,
        }} />
      )}

      {/* Columns */}
      <div style={{
        display: "flex", gap: 12, overflowX: "auto",
        paddingBottom: 16, minHeight: 300,
        alignItems: "flex-start",
      }}>
        {columns.map(col => (
          <KanbanColumn
            key={col.key} column={col}
            tasks={columnTasks[col.key] || []}
            ws={ws} projects={projects} pColors={pColors}
            goTask={goTask} toggleTask={toggleTask}
            deleteTask={deleteTask} startFocus={startFocus}
            onDropTask={handleDropTask}
            draggedTaskId={draggedTaskId}
            collapsed={!!collapsedCols[col.key]}
            onToggleCollapse={() => toggleCollapse(col.key)}
          />
        ))}
      </div>
    </div>
  );
}
