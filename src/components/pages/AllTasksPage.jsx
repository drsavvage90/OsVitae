import { useState } from "react";
import { List, LayoutGrid } from "lucide-react";
import { Btn } from "../ui";
import KanbanBoard from "../KanbanBoard";

export default function AllTasksPage({
  filteredTasks, setShowNewTask, TaskRow,
  ws, projects, pColors, goTask, toggleTask, deleteTask, startFocus,
  updateTaskStatus, updateTaskField,
}) {
  const [view, setView] = useState(() => localStorage.getItem("osvitae-alltasks-view") || "list");

  const setAndSaveView = (v) => {
    setView(v);
    localStorage.setItem("osvitae-alltasks-view", v);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: 0, fontWeight: 800 }}>All Tasks</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
        filteredTasks.length > 0
          ? filteredTasks.map((t, i) => <TaskRow key={t.id} task={t} idx={i} />)
          : <div style={{ padding:32,textAlign:"center" }}>
              <div style={{ fontSize:32,marginBottom:12 }}>&#x2705;</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:6 }}>No tasks yet</div>
              <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:16 }}>Create your first task to get started.</div>
              <Btn primary onClick={() => setShowNewTask(true)}>+ New Task</Btn>
            </div>
      )}

      {view === "kanban" && (
        <KanbanBoard
          tasks={filteredTasks}
          ws={ws}
          projects={projects}
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
