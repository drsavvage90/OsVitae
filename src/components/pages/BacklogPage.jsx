import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Glass, Btn, Modal } from "../ui";
import { TASK_TYPES, WS_COLOR_OPTIONS } from "../../lib/constants";

const SORT_OPTIONS = [
  { key: "priority", label: "Priority" },
  { key: "storyPoints", label: "Story Points" },
  { key: "created", label: "Created" },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  ...TASK_TYPES.map(t => ({ key: t.key, label: t.label })),
];

function SprintDropdown({ sprints, onSelect, onClose }) {
  const eligible = sprints.filter(s => s.status === "active" || s.status === "planning");
  if (eligible.length === 0) {
    return (
      <div style={{
        position: "absolute", right: 0, top: "100%", marginTop: 4, zIndex: 50,
        background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10,
        boxShadow: "var(--modal-shadow)", padding: 12, minWidth: 160,
      }}>
        <div style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)" }}>No active or planning sprints</div>
      </div>
    );
  }
  return (
    <div style={{
      position: "absolute", right: 0, top: "100%", marginTop: 4, zIndex: 50,
      background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10,
      boxShadow: "var(--modal-shadow)", padding: 6, minWidth: 180,
    }}>
      {eligible.map(s => (
        <div key={s.id} onClick={() => { onSelect(s.id); onClose(); }} style={{
          padding: "8px 12px", borderRadius: 8, cursor: "pointer",
          fontFamily: "var(--body)", fontSize: 12, fontWeight: 600, color: "var(--text)",
          display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9, color: s.status === "active" ? "#22C55E" : "#F59E0B",
            background: s.status === "active" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
            padding: "1px 6px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase",
          }}>{s.status === "active" ? "Active" : "Planning"}</span>
          <span>{s.name}</span>
        </div>
      ))}
    </div>
  );
}

function BacklogTaskRow({ task, pColors, goTask, sprints, updateTaskField }) {
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const tt = TASK_TYPES.find(t => t.key === task.taskType);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--card-border)", marginBottom: 6, transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "var(--hover-shadow)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: pColors[task.priority], flexShrink: 0 }} />
      {tt && (
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, color: tt.color, background: `${tt.color}18`, padding: "1px 6px", borderRadius: 6, textTransform: "uppercase", flexShrink: 0 }}>{tt.label}</span>
      )}
      <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => goTask(task.id)}>
        <span style={{ fontFamily: "var(--heading)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{task.title}</span>
      </div>
      <span style={{
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, flexShrink: 0,
        color: task.storyPoints ? "#6366F1" : "var(--muted)",
        background: task.storyPoints ? "rgba(99,102,241,0.08)" : "var(--subtle-bg)",
        padding: "2px 8px", borderRadius: 6,
      }}>{task.storyPoints ? `SP ${task.storyPoints}` : "—"}</span>
      {task.dueDate && (
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", fontWeight: 600, flexShrink: 0 }}>{task.dueDate}</span>
      )}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Btn small primary onClick={() => setShowSprintMenu(!showSprintMenu)}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Plus size={12} /> Sprint</span>
        </Btn>
        {showSprintMenu && (
          <>
            <div onClick={() => setShowSprintMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
            <SprintDropdown
              sprints={sprints}
              onSelect={sprintId => updateTaskField(task.id, "sprint_id", sprintId)}
              onClose={() => setShowSprintMenu(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function BacklogPage({ tasks, epics, sprints, ws, projects: _projects, pColors, goTask, toggleTask: _toggleTask, deleteTask: _deleteTask, startFocus: _startFocus, updateTaskField, addEpic, flash: _flash }) {
  const [filterWs, setFilterWs] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [showNewEpic, setShowNewEpic] = useState(false);
  const [newEpicTitle, setNewEpicTitle] = useState("");
  const [newEpicDesc, setNewEpicDesc] = useState("");
  const [newEpicColor, setNewEpicColor] = useState(WS_COLOR_OPTIONS[0]);
  const [newEpicWs, setNewEpicWs] = useState("");

  // Backlog = tasks not assigned to any sprint
  let backlog = tasks.filter(t => !t.sprint_id && !t.done);
  if (filterWs !== "all") backlog = backlog.filter(t => t.wsId === filterWs);
  if (filterType !== "all") backlog = backlog.filter(t => t.taskType === filterType);

  // Sort
  backlog.sort((a, b) => {
    if (sortBy === "priority") return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
    if (sortBy === "storyPoints") return (b.storyPoints || 0) - (a.storyPoints || 0);
    return 0; // created = natural order
  });

  // Group by epic
  const epicGroups = {};
  (epics || []).forEach(e => { epicGroups[e.id] = { epic: e, tasks: [] }; });
  epicGroups["__none__"] = { epic: null, tasks: [] };
  backlog.forEach(t => {
    const key = t.epic_id && epicGroups[t.epic_id] ? t.epic_id : "__none__";
    epicGroups[key].tasks.push(t);
  });

  // Epics with tasks first, then ungroomed
  const orderedGroups = [
    ...Object.entries(epicGroups).filter(([k]) => k !== "__none__" && epicGroups[k].tasks.length > 0),
    ...Object.entries(epicGroups).filter(([k]) => k !== "__none__" && epicGroups[k].tasks.length === 0),
  ];
  const ungrouped = epicGroups["__none__"];

  const handleCreateEpic = () => {
    if (!newEpicTitle.trim()) return;
    addEpic({ title: newEpicTitle.trim(), description: newEpicDesc.trim(), color: newEpicColor, wsId: newEpicWs || null });
    setShowNewEpic(false);
    setNewEpicTitle("");
    setNewEpicDesc("");
    setNewEpicColor(WS_COLOR_OPTIONS[0]);
    setNewEpicWs("");
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid var(--card-border)", background: "var(--card-bg)",
    fontFamily: "var(--body)", fontSize: 13, color: "var(--text)",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: 0, fontWeight: 800 }}>Backlog</h1>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{backlog.length} tasks</span>
        <div style={{ flex: 1 }} />
        <Btn primary onClick={() => setShowNewEpic(true)}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Plus size={14} /> Add Epic</span>
        </Btn>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Workspace filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Workspace:</span>
          <select value={filterWs} onChange={e => setFilterWs(e.target.value)} style={{
            fontFamily: "var(--body)", fontSize: 11, fontWeight: 600, color: "var(--text)",
            background: "var(--subtle-bg)", border: "1px solid var(--card-border)",
            borderRadius: 6, padding: "4px 8px", cursor: "pointer", outline: "none",
          }}>
            <option value="all">All</option>
            {ws.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        {/* Type filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Type:</span>
          {TYPE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilterType(f.key)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
              background: filterType === f.key ? "var(--primary)" : "var(--subtle-bg)",
              color: filterType === f.key ? "var(--text-on-primary)" : "var(--muted)",
              border: "none", transition: "all 0.15s",
            }}>{f.label}</button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Sort:</span>
          {SORT_OPTIONS.map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, cursor: "pointer",
              background: sortBy === s.key ? "var(--primary)" : "var(--subtle-bg)",
              color: sortBy === s.key ? "var(--text-on-primary)" : "var(--muted)",
              border: "none", transition: "all 0.15s",
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Epic groups */}
      {orderedGroups.filter(([, g]) => g.tasks.length > 0).map(([key, group]) => (
        <div key={key} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: group.epic.color || "var(--primary)", flexShrink: 0 }} />
            <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, color: "var(--text)", margin: 0, fontWeight: 700 }}>{group.epic.title}</h3>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{group.tasks.length} tasks</span>
            {group.epic.description && (
              <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>— {group.epic.description}</span>
            )}
          </div>
          {group.tasks.map(t => (
            <BacklogTaskRow key={t.id} task={t} pColors={pColors} goTask={goTask} sprints={sprints} updateTaskField={updateTaskField} />
          ))}
        </div>
      ))}

      {/* Ungroomed */}
      {ungrouped.tasks.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--muted)", flexShrink: 0, opacity: 0.5 }} />
            <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, color: "var(--muted)", margin: 0, fontWeight: 700 }}>Ungroomed</h3>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{ungrouped.tasks.length} tasks</span>
          </div>
          {ungrouped.tasks.map(t => (
            <BacklogTaskRow key={t.id} task={t} pColors={pColors} goTask={goTask} sprints={sprints} updateTaskField={updateTaskField} />
          ))}
        </div>
      )}

      {backlog.length === 0 && (
        <Glass style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Backlog is empty</div>
          <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)" }}>All tasks are either assigned to a sprint or completed.</div>
        </Glass>
      )}

      {/* Add Epic Modal */}
      <Modal open={showNewEpic} onClose={() => setShowNewEpic(false)} title="New Epic">
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Title</label>
          <input value={newEpicTitle} onChange={e => setNewEpicTitle(e.target.value)} placeholder="Epic name" style={inputStyle} autoFocus onKeyDown={e => { if (e.key === "Enter") handleCreateEpic(); }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Description</label>
          <textarea value={newEpicDesc} onChange={e => setNewEpicDesc(e.target.value)} placeholder="What's this epic about?" style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Color</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {WS_COLOR_OPTIONS.map(c => (
              <div key={c} onClick={() => setNewEpicColor(c)} style={{
                width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer",
                border: newEpicColor === c ? "2.5px solid var(--text)" : "2px solid transparent",
                transition: "all 0.15s", transform: newEpicColor === c ? "scale(1.15)" : "none",
              }} />
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Workspace</label>
          <select value={newEpicWs} onChange={e => setNewEpicWs(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">None</option>
            {ws.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <Btn primary onClick={handleCreateEpic} disabled={!newEpicTitle.trim()}>Create Epic</Btn>
      </Modal>
    </div>
  );
}
