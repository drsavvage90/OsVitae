import { Timer, Check, Paperclip, Pencil, Trash2 } from "lucide-react";
import { Glass, Btn } from "../ui";
import { getWsIcon } from "../../lib/constants";

export default function TaskDetailPage({
  activeTask, ws, pColors,
  setPage, page,
  startFocus, toggleTask, toggleSubtask,
  setEditingTask, deleteTask,
  setShowNewNote, deleteTaskNote,
  flash,
}) {
  if (!activeTask) return <div>Task not found</div>;
  const w = ws.find(x => x.id === activeTask.wsId);
  const subDone = activeTask.subtasks.filter(s => s.done).length;
  return (
    <div style={{ maxWidth:760 }}>
      <div onClick={() => setPage(page === "task" ? "today" : page)} style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--primary)",cursor:"pointer",marginBottom:16,fontWeight:600 }}>← Back</div>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
        <div style={{ width:10,height:10,borderRadius:"50%",background:pColors[activeTask.priority] }} />
        <span style={{ fontFamily:"var(--mono)",fontSize:10,color:pColors[activeTask.priority],fontWeight:700,textTransform:"uppercase",letterSpacing:1 }}>{activeTask.priority} priority</span>
        <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:`${w?.color}14`,padding:"2px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:w?.color,fontWeight:600 }}>{getWsIcon(w?.icon, 10)} {w?.name}</span>
      </div>
      <h1 style={{ fontFamily:"var(--heading)",fontSize:26,color:"var(--text)",margin:"0 0 6px",fontWeight:800,letterSpacing:-0.5 }}>{activeTask.title}</h1>
      <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",lineHeight:1.6,margin:"0 0 20px" }}>{activeTask.desc}</p>

      <div style={{ display:"flex",gap:10,marginBottom:24,flexWrap:"wrap" }}>
        <Btn primary color={w?.color} onClick={() => startFocus(activeTask.id)}>Start Focus Session</Btn>
        <Btn onClick={() => toggleTask(activeTask.id)}>{activeTask.done ? "Mark Incomplete" : "Mark Complete"}</Btn>
        <Btn onClick={() => setEditingTask({ ...activeTask })}><Pencil size={14} style={{ marginRight:4 }} /> Edit</Btn>
        <Btn onClick={() => { if (confirm("Delete this task?")) { deleteTask(activeTask.id); setPage("allTasks"); } }} style={{ color:"#EF4444" }}><Trash2 size={14} style={{ marginRight:4 }} /> Delete</Btn>
      </div>

      <Glass style={{ padding:18,marginBottom:16,display:"flex",alignItems:"center",gap:14 }}>
        <div style={{ display:"flex",gap:6 }}>
          {Array.from({ length: activeTask.totalPomos }, (_, i) => (
            <div key={i} style={{
              width:32,height:32,borderRadius:10,
              background: i < activeTask.donePomos ? `linear-gradient(135deg, ${w?.color}, ${w?.color}88)` : "rgba(0,0,0,0.05)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
              color: i < activeTask.donePomos ? "#fff" : "var(--muted)",
            }}>{i < activeTask.donePomos ? <Timer size={24} /> : i+1}</div>
          ))}
        </div>
        <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{activeTask.donePomos}/{activeTask.totalPomos} pomodoros</span>
      </Glass>

      {activeTask.subtasks.length > 0 && (
        <Glass style={{ padding:20,marginBottom:16 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 14px",fontWeight:700 }}>Steps</h3>
          {activeTask.subtasks.map((s,i) => (
            <div key={s.id} onClick={() => toggleSubtask(activeTask.id, s.id)} style={{
              display:"flex",alignItems:"center",gap:12,padding:"10px 0",cursor:"pointer",
              borderBottom: i < activeTask.subtasks.length-1 ? "1px solid rgba(0,0,0,0.04)" : "none",
              opacity: s.done ? 0.5 : 1,
            }}>
              <div style={{
                width:22,height:22,borderRadius:7,flexShrink:0,
                background:s.done?"#22C55E":"transparent",border:s.done?"none":"2px solid rgba(0,0,0,0.12)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",transition:"all 0.2s",
              }}>{s.done && <Check size={12} />}</div>
              <span style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--text)",flex:1,textDecoration:s.done?"line-through":"none" }}>{s.text}</span>
              <span style={{ fontFamily:"var(--mono)",fontSize:11,color:s.done?"#22C55E":"var(--muted)",fontWeight:600 }}>+{s.xp} XP</span>
            </div>
          ))}
          <div style={{ marginTop:12,fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{subDone}/{activeTask.subtasks.length} steps complete</div>
        </Glass>
      )}

      <Glass style={{ padding:20,marginBottom:16 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:0,fontWeight:700 }}>Notes</h3>
          <Btn small primary color="#5B8DEF" onClick={() => setShowNewNote(true)}>+ Add Note</Btn>
        </div>
        {activeTask.notes.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:"10px 0" }}>No notes yet.</div>}
        {activeTask.notes.map(n => (
          <div key={n.id} style={{ background:"var(--input-bg)",borderRadius:10,padding:14,marginBottom:8,border:"1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",lineHeight:1.7 }}>{n.text}</div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6 }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{n.time}</div>
              <div onClick={() => deleteTaskNote(activeTask.id, n.id)} style={{ cursor:"pointer",color:"var(--muted)" }}
                onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
              ><Trash2 size={12}/></div>
            </div>
          </div>
        ))}
      </Glass>

      <Glass style={{ padding:20 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:0,fontWeight:700 }}>Attachments</h3>
          <Btn small onClick={() => flash("File upload coming in the full build!")}><Paperclip size={14} style={{ marginRight: 4 }} /> Upload</Btn>
        </div>
        {activeTask.attachments.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:"10px 0" }}>No attachments yet.</div>}
        <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
          {activeTask.attachments.map((a,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 16px",background:"var(--input-bg)",borderRadius:12,border:"1px solid var(--border-light)",cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--subtle-bg)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--input-bg)"}
            >
              <span style={{ fontSize:20 }}>{a.icon}</span>
              <div>
                <div style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{a.name}</div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{a.size}</div>
              </div>
            </div>
          ))}
        </div>
      </Glass>

      {activeTask.reward && (
        <Glass style={{ marginTop:16,padding:18,background:"linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.04))",border:"1px solid rgba(251,191,36,0.15)" }}>
          <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:4 }}>After this task...</div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)" }}> {activeTask.reward}</div>
        </Glass>
      )}
    </div>
  );
}
