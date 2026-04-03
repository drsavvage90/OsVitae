import { useState } from "react";
import { List, LayoutGrid } from "lucide-react";
import { Btn } from "../ui";
import KanbanBoard from "../KanbanBoard";

export default function AllTasksPage({
  filteredTasks, setShowNewTask,
  ws, projects, sprints, activeProjectId, pColors, goTask, toggleTask, deleteTask, startFocus,
  updateTaskStatus, updateTaskField,
}) {
  const [view, setView] = useState(() => localStorage.getItem("osvitae-alltasks-view") || "list");
  const [filter, setFilter] = useState("active");

  const setAndSaveView = (v) => {
    setView(v);
    localStorage.setItem("osvitae-alltasks-view", v);
  };

  const visibleTasks = filter === "active"
    ? filteredTasks.filter(t => !t.done)
    : filteredTasks.filter(t => t.done);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: 0, fontWeight: 800 }}>All Tasks</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Active / Completed filter */}
          <div style={{
            display: "flex", background: "var(--subtle-bg)", borderRadius: 8, padding: 2,
            border: "1px solid var(--border)",
          }}>
            <button onClick={() => setFilter("active")} style={{
              padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              background: filter === "active" ? "var(--primary)" : "transparent",
              color: filter === "active" ? "var(--text-on-primary)" : "var(--muted)",
              fontFamily: "var(--body)", fontSize: 11, fontWeight: 600, transition: "all 0.15s",
            }}>Active</button>
            <button onClick={() => setFilter("completed")} style={{
              padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              background: filter === "completed" ? "var(--primary)" : "transparent",
              color: filter === "completed" ? "var(--text-on-primary)" : "var(--muted)",
              fontFamily: "var(--body)", fontSize: 11, fontWeight: 600, transition: "all 0.15s",
            }}>Completed</button>
          </div>
          {/* View toggle */}
          <div style={{
            display: "flex", background: "var(--subtle-bg)", borderRadius: 8, padding: 2,
            border: "1px solid var(--border)",
          }}>
            <button onClick={() => setAndSaveView("list")} style={{
              padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              background: view === "list" ? "var(--primary)" : "transparent",
              color: view === "list" ? "var(--text-on-primary)" : "var(--muted)",
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "var(--body)", fontSize: 11, fontWeight: 600, transition: "all 0.15s",
            }}><List size={13} /> List</button>
            <button onClick={() => setAndSaveView("kanban")} style={{
              padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              background: view === "kanban" ? "var(--primary)" : "transparent",
              color: view === "kanban" ? "var(--text-on-primary)" : "var(--muted)",
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "var(--body)", fontSize: 11, fontWeight: 600, transition: "all 0.15s",
            }}><LayoutGrid size={13} /> Board</button>
          </div>
          <Btn primary onClick={() => setShowNewTask(true)}>+ New Task</Btn>
        </div>
      </div>

      {view === "list" && (
        visibleTasks.length > 0
          ? visibleTasks.map((t, i) => <TaskRow key={t.id} task={t} idx={i} />)
          : <div style={{ padding:32,textAlign:"center" }}>
              <div style={{ fontSize:32,marginBottom:12 }}>{filter === "active" ? "\u2705" : "\u{1F4AD}"}</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:6 }}>{filter === "active" ? "No tasks yet" : "No completed tasks"}</div>
              <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:16 }}>{filter === "active" ? "Create your first task to get started." : "Completed tasks will appear here."}</div>
              {filter === "active" && <Btn primary onClick={() => setShowNewTask(true)}>+ New Task</Btn>}
            </div>
      )}

      {view === "kanban" && (
        <KanbanBoard
          tasks={visibleTasks}
          ws={ws}
          projects={projects}
          sprints={sprints}
          activeProjectId={activeProjectId}
          pColors={pColors}
          goTask={goTask}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          startFocus={startFocus}
          updateTaskStatus={updateTaskStatus}
          updateTaskField={updateTaskField}
        />
      )}
    </div>
  );
}
