import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Glass, Btn } from "../ui";
import KanbanBoard from "../KanbanBoard";

export default function SprintBoardPage({ sprints, tasks, ws, projects, pColors, goTask, toggleTask, deleteTask, startFocus, updateTaskStatus, updateTaskField, setPage }) {
  const activeSprints = (sprints || []).filter(s => s.status === "active");
  const [selectedSprintId, setSelectedSprintId] = useState(activeSprints[0]?.id || null);
  const [showBacklog, setShowBacklog] = useState(false);

  const selectedSprint = (sprints || []).find(s => s.id === selectedSprintId) || null;

  if (!selectedSprint) {
    return (
      <div>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: "0 0 4px", fontWeight: 800 }}>Sprint Board</h1>
        <Glass style={{ padding: 32, textAlign: "center", marginTop: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏃</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No active sprint</div>
          <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Create a sprint to start tracking work on the board.</div>
          <Btn primary onClick={() => setPage("backlog")}>Go to Backlog</Btn>
        </Glass>
      </div>
    );
  }

  const sprintTasks = tasks.filter(t => t.sprint_id === selectedSprintId);
  const doneTasks = sprintTasks.filter(t => t.done || t.status === "done");
  const totalSP = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const doneSP = doneTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);

  const now = new Date();
  const end = new Date(selectedSprint.endDate);
  const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

  const backlogTasks = tasks.filter(t => !t.sprint_id && !t.done);

  const stats = [
    { label: "Goal", value: selectedSprint.goal || "—", isText: true },
    { label: "Velocity", value: `${doneSP} / ${totalSP} SP`, color: "#8B5CF6" },
    { label: "Days Left", value: daysRemaining, color: daysRemaining <= 2 ? "#EF4444" : "#22C55E" },
    { label: "Tasks Done", value: `${doneTasks.length} / ${sprintTasks.length}`, color: "#22C55E" },
  ];

  return (
    <div>
      {/* Header + sprint selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: 0, fontWeight: 800 }}>Sprint Board</h1>
        {activeSprints.length > 1 && (
          <select
            value={selectedSprintId}
            onChange={e => setSelectedSprintId(e.target.value)}
            style={{
              fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: "var(--text)",
              background: "var(--card-bg)", border: "1.5px solid var(--card-border)",
              borderRadius: 8, padding: "6px 12px", cursor: "pointer", outline: "none",
            }}
          >
            {activeSprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
        {activeSprints.length === 1 && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--primary)", fontWeight: 600, background: "var(--primary-bg)", padding: "4px 12px", borderRadius: 8 }}>
            {selectedSprint.name}
          </span>
        )}
      </div>

      {/* Sprint stats */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Glass key={i} style={{ padding: "14px 16px", textAlign: "center" }}>
            {s.isText ? (
              <div style={{ fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</div>
            ) : (
              <div style={{ fontFamily: "var(--heading)", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            )}
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
          </Glass>
        ))}
      </div>

      {/* Kanban board filtered to sprint tasks */}
      <KanbanBoard
        tasks={sprintTasks}
        ws={ws}
        projects={projects}
        sprints={sprints}
        pColors={pColors}
        goTask={goTask}
        toggleTask={toggleTask}
        deleteTask={deleteTask}
        startFocus={startFocus}
        updateTaskStatus={updateTaskStatus}
        updateTaskField={updateTaskField}
      />

      {/* Sprint Backlog */}
      {backlogTasks.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div
            onClick={() => setShowBacklog(!showBacklog)}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}
          >
            {showBacklog ? <ChevronDown size={16} color="var(--muted)" /> : <ChevronRight size={16} color="var(--muted)" />}
            <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, color: "var(--text)", margin: 0, fontWeight: 700 }}>Sprint Backlog</h3>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>({backlogTasks.length} unassigned)</span>
          </div>

          {showBacklog && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {backlogTasks.map(task => {
                const w = ws.find(x => x.id === task.wsId);
                return (
                  <Glass key={task.id} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: pColors[task.priority], flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => goTask(task.id)}>
                      <div style={{ fontFamily: "var(--heading)", fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        {w && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: w.color, fontWeight: 600 }}>{w.name}</span>}
                        {task.storyPoints && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#6366F1", fontWeight: 600 }}>SP {task.storyPoints}</span>}
                        {task.dueDate && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>{task.dueDate}</span>}
                      </div>
                    </div>
                    <Btn small primary onClick={() => updateTaskField(task.id, "sprint_id", selectedSprintId)}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Plus size={12} /> Add</span>
                    </Btn>
                  </Glass>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
