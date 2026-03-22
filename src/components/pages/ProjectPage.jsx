import { Trash2 } from "lucide-react";
import { Glass, Btn } from "../ui";
import { getWsIcon } from "../../lib/constants";

export default function ProjectPage({
  activeProject, activeProjectId, activeWs, tasks,
  wsNotes, wsDocs,
  setNewTaskWs, setNewTaskProject, setShowNewTask,
  setShowWsNote, setShowWsDoc,
  deleteProject, deleteWsNote, deleteWsDoc,
  goTask, goWs, TaskRow,
}) {
  if (!activeProject) return <div style={{ padding:40,textAlign:"center",fontFamily:"var(--body)",color:"var(--muted)" }}>Select a project from the sidebar.</div>;
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:6 }}>
        {activeWs && (
          <span onClick={() => goWs(activeWs.id)} style={{ fontFamily:"var(--mono)",fontSize:11,color:activeWs.color,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:4 }}>
            {getWsIcon(activeWs.icon, 12)} {activeWs.name}
          </span>
        )}
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20 }}>
        <div style={{ width:48,height:48,borderRadius:14,background:`linear-gradient(135deg, ${activeProject.color}, ${activeProject.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 4px 16px ${activeProject.color}33` }}>{getWsIcon(activeProject.icon, 24)}</div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:24,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-0.5 }}>{activeProject.name}</h1>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>{projectTasks.length} tasks · {projectTasks.filter(t => t.done).length} completed</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <Btn primary color={activeProject.color} onClick={() => { setNewTaskWs(activeProject.wsId); setNewTaskProject(activeProjectId); setShowNewTask(true); }}>+ Add Task</Btn>
          <div role="button" onClick={() => { if (confirm(`Delete project "${activeProject.name}"?`)) deleteProject(activeProjectId); }} style={{ width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
          ><Trash2 size={16}/></div>
        </div>
      </div>

      {/* Progress bar */}
      {projectTasks.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
            <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>Progress</span>
            <span style={{ fontFamily:"var(--mono)",fontSize:10,color:activeProject.color,fontWeight:700 }}>{Math.round((projectTasks.filter(t=>t.done).length/projectTasks.length)*100)}%</span>
          </div>
          <div style={{ height:6,background:"var(--subtle-bg)",borderRadius:6,overflow:"hidden" }}>
            <div style={{ width:`${(projectTasks.filter(t=>t.done).length/projectTasks.length)*100}%`,height:"100%",borderRadius:6,background:`linear-gradient(90deg, ${activeProject.color}, ${activeProject.color}CC)`,transition:"width 0.5s" }} />
          </div>
        </div>
      )}

      {/* Tasks */}
      {projectTasks.length === 0 && (
        <Glass style={{ padding:32,textAlign:"center" }}>
          <div style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",fontWeight:700,marginBottom:6 }}>No tasks yet</div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:14 }}>Add your first task to this project</div>
          <Btn primary color={activeProject.color} onClick={() => { setNewTaskWs(activeProject.wsId); setNewTaskProject(activeProjectId); setShowNewTask(true); }}>+ Add Task</Btn>
        </Glass>
      )}
      {projectTasks.filter(t => !t.done).map((t,i) => <TaskRow key={t.id} task={t} idx={i} showWs={false} showProject={false} />)}
      {projectTasks.filter(t => t.done).length > 0 && (
        <div style={{ marginTop:16,paddingTop:12,borderTop:"1px solid var(--subtle-bg)" }}>
          <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:1 }}>Completed</div>
          {projectTasks.filter(t => t.done).map((t,i) => <TaskRow key={t.id} task={t} idx={i} showWs={false} showProject={false} />)}
        </div>
      )}
    </div>
  );
}
