import { FileCode2, Image as ImageIcon, FileText, FileEdit, Trash2 } from "lucide-react";
import { Glass, Btn } from "../ui";
import { getWsIcon } from "../../lib/constants";

export default function WorkspacePage({
  activeWs, activeWsId, tasks, wsNotes, wsDocs,
  wsTab, setWsTab,
  setNewTaskWs, setShowNewTask,
  setShowWsNote, setShowWsDoc,
  deleteWorkspace, deleteWsNote, deleteWsDoc,
  goTask, TaskRow,
}) {
  if (!activeWs) return <div style={{ padding:40,textAlign:"center",fontFamily:"var(--body)",color:"var(--muted)" }}>Select a workspace from the sidebar.</div>;
  const wsTasks = tasks.filter(t => t.wsId === activeWsId);
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
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>{wsTasks.length} tasks · {allNotes.length} notes · {allDocs.length} files</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <Btn primary color={activeWs.color} onClick={() => { setNewTaskWs(activeWsId); setShowNewTask(true); }}>+ Add Task</Btn>
          <div onClick={() => { if (confirm(`Delete workspace "${activeWs.name}"?`)) deleteWorkspace(activeWsId); }} style={{ cursor:"pointer",color:"var(--muted)",padding:8 }}
            onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
          ><Trash2 size={16}/></div>
        </div>
      </div>
      <div style={{ display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid var(--border-light)" }}>
        {["Tasks","Notes","Documents"].map(tab => (
          <button key={tab} onClick={() => setWsTab(tab)} style={{
            background:"none",border:"none",borderBottom:wsTab===tab?`2.5px solid ${activeWs.color}`:"2.5px solid transparent",
            padding:"10px 18px",fontFamily:"var(--body)",fontSize:14,fontWeight:wsTab===tab?700:500,
            color:wsTab===tab?"var(--text)":"var(--muted)",cursor:"pointer",marginBottom:-1,
          }}>{tab}</button>
        ))}
      </div>
      {wsTab === "Tasks" && wsTasks.map((t,i) => <TaskRow key={t.id} task={t} idx={i} showWs={false} />)}
      {wsTab === "Notes" && (
        <div>
          <div style={{ marginBottom:14 }}><Btn primary color={activeWs.color} onClick={() => setShowWsNote(true)}>+ New Note</Btn></div>
          {allNotes.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:20,textAlign:"center" }}>No notes yet.</div>}
          <div className="notes-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            {allNotes.map((n,i) => (
              <Glass key={n.id} hover style={{ padding:16,cursor:"pointer" }} onClick={() => n.taskId ? goTask(n.taskId) : null}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                  <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{n.title || n.taskTitle}</div>
                  <span style={{ fontFamily:"var(--mono)",fontSize:9,color:n.source==="task"?activeWs.color:"var(--muted)",fontWeight:600,background:n.source==="task"?`${activeWs.color}10`:"rgba(0,0,0,0.04)",padding:"2px 8px",borderRadius:6 }}>{n.source === "task" ? "From task" : "Standalone"}</span>
                </div>
                <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--muted)",lineHeight:1.6 }}>{n.text}</div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8 }}>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{n.time}</div>
                  {n.source === "workspace" && <div onClick={(e) => { e.stopPropagation(); deleteWsNote(n.id); }} style={{ cursor:"pointer",color:"var(--muted)" }}
                    onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                  ><Trash2 size={12}/></div>}
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
              {a.source === "workspace" && <div onClick={(e) => { e.stopPropagation(); deleteWsDoc(a.id); }} style={{ cursor:"pointer",color:"var(--muted)",marginLeft:4 }}
                onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
              ><Trash2 size={14}/></div>}
            </Glass>
          ))}
        </div>
      )}
    </div>
  );
}
