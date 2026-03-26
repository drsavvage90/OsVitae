import { FileCode2, Image as ImageIcon, FileText, FileEdit, Trash2, Plus, Pencil } from "lucide-react";
import { Glass, Btn } from "../ui";
import { getWsIcon } from "../../lib/constants";

export default function WorkspacePage({
  activeWs, activeWsId, tasks, projects, wsNotes, wsDocs,
  wsTab, setWsTab,
  setNewTaskWs, setNewTaskProject, setShowNewTask,
  setShowWsNote, setShowWsDoc,
  deleteWorkspace, deleteWsNote, deleteWsDoc, openEditWs,
  goTask, goProject,
  setShowNewProject, setNewProjectWsId, deleteProject,
  TaskRow,
}) {
  if (!activeWs) return <div style={{ padding:40,textAlign:"center",fontFamily:"var(--body)",color:"var(--muted)" }}>Select a workspace from the sidebar.</div>;
  const wsProjects = projects.filter(p => p.wsId === activeWsId);
  const wsTasks = tasks.filter(t => t.wsId === activeWsId);
  const unassignedTasks = wsTasks.filter(t => !t.projectId);
  const taskNotes = wsTasks.flatMap(t => t.notes.map(n => ({ ...n, taskTitle: t.title, taskId: t.id, source: "task" })));
  const standaloneNotes = wsNotes.filter(n => n.wsId === activeWsId).map(n => ({ ...n, source: "workspace" }));
  const allNotes = [...standaloneNotes, ...taskNotes];
  const taskAttachments = wsTasks.flatMap(t => t.attachments.map(a => ({ ...a, taskTitle: t.title, taskId: t.id, source: "task" })));
  const standaloneDocs = wsDocs.filter(d => d.wsId === activeWsId).map(d => ({ ...d, source: "workspace" }));
  const allDocs = [...standaloneDocs, ...taskAttachments];
  const getDocIcon = (iconKey) => {
    const map = { FileEdit: <FileEdit size={20} />, FileText: <FileText size={20} />, FileCode2: <FileCode2 size={20} />, ImageIcon: <ImageIcon size={20} /> };
    return map[iconKey] || <FileText size={20} />;
  };
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20 }}>
        <div style={{ width:48,height:48,borderRadius:14,background:`linear-gradient(135deg, ${activeWs.color}, ${activeWs.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 4px 16px ${activeWs.color}33` }}>{getWsIcon(activeWs.icon, 24)}</div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:24,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-0.5 }}>{activeWs.name}</h1>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>{wsProjects.length} projects · {wsTasks.length} tasks</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <Btn primary color={activeWs.color} onClick={() => { setNewProjectWsId(activeWsId); setShowNewProject(true); }}>+ New Project</Btn>
          <div role="button" onClick={() => openEditWs(activeWs)} style={{ width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color="var(--primary)"; e.currentTarget.style.background="var(--subtle-bg)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
          ><Pencil size={16}/></div>
          <div role="button" onClick={() => { if (confirm(`Delete workspace "${activeWs.name}"?`)) deleteWorkspace(activeWsId); }} style={{ width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
          ><Trash2 size={16}/></div>
        </div>
      </div>
      <div style={{ display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid var(--border-light)" }}>
        {["Projects","Notes","Documents"].map(tab => (
          <button key={tab} onClick={() => setWsTab(tab)} style={{
            background:"none",border:"none",borderBottom:wsTab===tab?`2.5px solid ${activeWs.color}`:"2.5px solid transparent",
            padding:"10px 18px",fontFamily:"var(--body)",fontSize:14,fontWeight:wsTab===tab?700:500,
            color:wsTab===tab?"var(--text)":"var(--muted)",cursor:"pointer",marginBottom:-1,
          }}>{tab}</button>
        ))}
      </div>

      {wsTab === "Projects" && (
        <div>
          {/* Project cards */}
          {wsProjects.length === 0 && (
            <Glass style={{ padding:32,textAlign:"center" }}>
              <div style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",fontWeight:700,marginBottom:6 }}>No projects yet</div>
              <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:14 }}>Create your first project to organize tasks</div>
              <Btn primary color={activeWs.color} onClick={() => { setNewProjectWsId(activeWsId); setShowNewProject(true); }}>+ New Project</Btn>
            </Glass>
          )}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            {wsProjects.map(p => {
              const pTasks = tasks.filter(t => t.projectId === p.id);
              const pDone = pTasks.filter(t => t.done).length;
              const pTotal = pTasks.length;
              const percent = pTotal > 0 ? Math.round((pDone/pTotal)*100) : 0;
              return (
                <Glass key={p.id} hover onClick={() => goProject(p.id)} style={{ padding:18,cursor:"pointer",position:"relative" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                    <div style={{ width:38,height:38,borderRadius:11,background:`linear-gradient(135deg, ${p.color}, ${p.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0 }}>{getWsIcon(p.icon, 18)}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</div>
                      <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{pTotal} tasks · {pDone} done</div>
                    </div>
                    <div role="button" onClick={(e) => { e.stopPropagation(); if (confirm(`Delete project "${p.name}"?`)) deleteProject(p.id); }} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                    ><Trash2 size={13}/></div>
                  </div>
                  <div style={{ height:5,background:"var(--subtle-bg)",borderRadius:4,overflow:"hidden" }}>
                    <div style={{ width:`${percent}%`,height:"100%",borderRadius:4,background:`linear-gradient(90deg, ${p.color}, ${p.color}CC)`,transition:"width 0.5s" }} />
                  </div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",marginTop:4,textAlign:"right" }}>{percent}%</div>
                </Glass>
              );
            })}
          </div>

          {/* Unassigned tasks */}
          {unassignedTasks.length > 0 && (
            <div style={{ marginTop:24 }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600,marginBottom:10,textTransform:"uppercase",letterSpacing:1 }}>Unassigned Tasks</div>
              {unassignedTasks.map((t,i) => <TaskRow key={t.id} task={t} idx={i} showWs={false} />)}
            </div>
          )}
        </div>
      )}

      {wsTab === "Notes" && (
        <div>
          <div style={{ marginBottom:14 }}><Btn primary color={activeWs.color} onClick={() => setShowWsNote(true)}>+ New Note</Btn></div>
          {allNotes.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:20,textAlign:"center" }}>No notes yet.</div>}
          <div className="notes-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            {allNotes.map((n,i) => (
              <Glass key={n.id} hover style={{ padding:16,cursor:"pointer" }} onClick={() => n.taskId ? goTask(n.taskId) : null}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                  <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{n.title || n.taskTitle}</div>
                  <span style={{ fontFamily:"var(--mono)",fontSize:9,color:n.source==="task"?activeWs.color:"var(--muted)",fontWeight:600,background:n.source==="task"?`${activeWs.color}10`:"var(--subtle-bg)",padding:"2px 8px",borderRadius:6 }}>{n.source === "task" ? "From task" : "Standalone"}</span>
                </div>
                <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--muted)",lineHeight:1.6 }}>{n.text}</div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8 }}>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{n.time}</div>
                  {n.source === "workspace" && <div role="button" onClick={(e) => { e.stopPropagation(); deleteWsNote(n.id); }} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                  ><Trash2 size={13}/></div>}
                </div>
              </Glass>
            ))}
          </div>
        </div>
      )}
      {wsTab === "Documents" && (
        <div>
          <div style={{ marginBottom:14 }}><Btn primary color={activeWs.color} onClick={() => setShowWsDoc(true)}>+ Add Document</Btn></div>
          {allDocs.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:20,textAlign:"center" }}>No documents yet.</div>}
          {allDocs.map((a,i) => (
            <Glass key={a.id || i} hover style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 18px",marginBottom:8,cursor:"pointer" }} onClick={() => a.taskId ? goTask(a.taskId) : null}>
              <div style={{ width:40,height:40,borderRadius:10,background:"var(--subtle-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)" }}>{typeof a.icon === "string" ? getDocIcon(a.icon) : a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{a.name}</div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{a.size}{a.taskTitle ? ` · from "${a.taskTitle}"` : " · standalone"}</div>
              </div>
              <span style={{ background:"var(--subtle-bg)",padding:"3px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>{a.type}</span>
              {a.source === "workspace" && <div role="button" onClick={(e) => { e.stopPropagation(); deleteWsDoc(a.id); }} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",marginLeft:4,transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
              ><Trash2 size={14}/></div>}
            </Glass>
          ))}
        </div>
      )}
    </div>
  );
}
