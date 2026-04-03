import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Glass, Btn, ConfirmModal } from "../ui";
import { getWsIcon } from "../../lib/constants";
import { monoLabel } from "../../lib/styles";

export default function ProjectPage({
  activeProject, activeProjectId, activeWs, tasks,
  setNewTaskWs, setNewTaskProject, setShowNewTask,
  deleteProject,
  goWs, TaskRow, sprints,
}) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [taskFilter, setTaskFilter] = useState("all");
  if (!activeProject) return <div style={{ padding:40,textAlign:"center",fontFamily:"var(--body)",color:"var(--muted)" }}>Select a project from the sidebar.</div>;

  const activeSprint = (sprints || []).find(s => s.status === "active") || null;
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);
  const sprintHasProjectTasks = activeSprint && projectTasks.some(t => t.sprint_id === activeSprint.id);

  // Story points
  const totalSP = projectTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const doneSP = projectTasks.filter(t => t.done).reduce((s, t) => s + (t.storyPoints || 0), 0);
  const hasSP = totalSP > 0;

  // Task filtering
  const filteredTasks = taskFilter === "sprint" && activeSprint
    ? projectTasks.filter(t => t.sprint_id === activeSprint.id)
    : taskFilter === "backlog"
    ? projectTasks.filter(t => !t.sprint_id)
    : projectTasks;

  // Sprint day calculation
  const now = new Date();
  const sprintCurrentDay = activeSprint ? Math.max(1, Math.ceil((now - new Date(activeSprint.startDate)) / (1000 * 60 * 60 * 24))) : 0;
  const sprintTotalDays = activeSprint ? Math.max(1, Math.ceil((new Date(activeSprint.endDate) - new Date(activeSprint.startDate)) / (1000 * 60 * 60 * 24))) : 0;

  const taskPct = projectTasks.length > 0 ? Math.round((projectTasks.filter(t => t.done).length / projectTasks.length) * 100) : 0;
  const spPct = totalSP > 0 ? Math.round((doneSP / totalSP) * 100) : 0;

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:6 }}>
        {activeWs && (
          <span onClick={() => goWs(activeWs.id)} style={{ fontFamily:"var(--mono)",fontSize:11,color:activeWs.color,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:4 }}>
            {getWsIcon(activeWs.icon, 12)} {activeWs.name}
          </span>
        )}
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:4 }}>
        <div style={{ width:48,height:48,borderRadius:14,background:`linear-gradient(135deg, ${activeProject.color}, ${activeProject.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 4px 16px ${activeProject.color}33` }}>{getWsIcon(activeProject.icon, 24)}</div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:24,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-0.5 }}>{activeProject.name}</h1>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>{projectTasks.length} tasks · {projectTasks.filter(t => t.done).length} completed</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <Btn primary color={activeProject.color} onClick={() => { setNewTaskWs(activeProject.wsId); setNewTaskProject(activeProjectId); setShowNewTask(true); }}>+ Add Task</Btn>
          <div role="button" onClick={() => setConfirmDelete({ id: activeProjectId, title: activeProject.name })} style={{ width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
          ><Trash2 size={16}/></div>
        </div>
      </div>

      {/* Sprint badge */}
      {activeSprint && sprintHasProjectTasks && (
        <div style={{ marginBottom:16,marginTop:4 }}>
          <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--primary)",fontWeight:600,display:"inline-flex",alignItems:"center",gap:4,background:"var(--primary-bg)",padding:"3px 10px",borderRadius:8 }}>
            Sprint: {activeSprint.name} · Day {sprintCurrentDay} of {sprintTotalDays}
          </span>
        </div>
      )}

      {/* Dual progress bars */}
      {projectTasks.length > 0 && (
        <div style={{ marginBottom:20, marginTop: !(activeSprint && sprintHasProjectTasks) ? 16 : 0 }}>
          {/* Task completion bar */}
          <div style={{ marginBottom: hasSP ? 10 : 0 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>Tasks</span>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:activeProject.color,fontWeight:700 }}>{taskPct}%</span>
            </div>
            <div style={{ height:6,background:"var(--subtle-bg)",borderRadius:6,overflow:"hidden" }}>
              <div style={{ width:`${taskPct}%`,height:"100%",borderRadius:6,background:`linear-gradient(90deg, ${activeProject.color}, ${activeProject.color}CC)`,transition:"width 0.5s" }} />
            </div>
          </div>
          {/* Story points bar */}
          {hasSP && (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>Story Points ({doneSP}/{totalSP})</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"#8B5CF6",fontWeight:700 }}>{spPct}%</span>
              </div>
              <div style={{ height:6,background:"var(--subtle-bg)",borderRadius:6,overflow:"hidden" }}>
                <div style={{ width:`${spPct}%`,height:"100%",borderRadius:6,background:"linear-gradient(90deg, #8B5CF6, #A855F7)",transition:"width 0.5s" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task grouping toggle */}
      {projectTasks.length > 0 && (
        <div style={{ display:"flex",gap:6,marginBottom:16 }}>
          {[
            { id: "all", label: "All" },
            { id: "sprint", label: "Sprint" },
            { id: "backlog", label: "Backlog" },
          ].map(f => (
            <div
              key={f.id}
              onClick={() => setTaskFilter(f.id)}
              style={{
                padding:"6px 14px",borderRadius:8,cursor:"pointer",transition:"all 0.15s",
                fontFamily:"var(--heading)",fontSize:12,fontWeight:taskFilter === f.id ? 700 : 500,
                color:taskFilter === f.id ? "var(--primary)" : "var(--muted)",
                background:taskFilter === f.id ? "var(--primary-bg)" : "transparent",
              }}
              onMouseEnter={e => { if (taskFilter !== f.id) e.currentTarget.style.background = "var(--hover-bg)"; }}
              onMouseLeave={e => { if (taskFilter !== f.id) e.currentTarget.style.background = taskFilter === f.id ? "var(--primary-bg)" : "transparent"; }}
            >
              {f.label}
            </div>
          ))}
        </div>
      )}

      {/* Tasks */}
      {filteredTasks.length === 0 && projectTasks.length === 0 && (
        <Glass style={{ padding:32,textAlign:"center" }}>
          <div style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",fontWeight:700,marginBottom:6 }}>No tasks yet</div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:14 }}>Add your first task to this project</div>
          <Btn primary color={activeProject.color} onClick={() => { setNewTaskWs(activeProject.wsId); setNewTaskProject(activeProjectId); setShowNewTask(true); }}>+ Add Task</Btn>
        </Glass>
      )}
      {filteredTasks.length === 0 && projectTasks.length > 0 && (
        <Glass style={{ padding:24,textAlign:"center" }}>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>No tasks match the "{taskFilter}" filter.</div>
        </Glass>
      )}
      {filteredTasks.filter(t => !t.done).map((t,i) => <TaskRow key={t.id} task={t} idx={i} showWs={false} showProject={false} />)}
      {filteredTasks.filter(t => t.done).length > 0 && (
        <div style={{ marginTop:16,paddingTop:12,borderTop:"1px solid var(--subtle-bg)" }}>
          <div style={{ ...monoLabel, marginBottom:8 }}>Completed</div>
          {filteredTasks.filter(t => t.done).map((t,i) => <TaskRow key={t.id} task={t} idx={i} showWs={false} showProject={false} />)}
        </div>
      )}

      <ConfirmModal
        item={confirmDelete}
        onConfirm={() => { deleteProject(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
