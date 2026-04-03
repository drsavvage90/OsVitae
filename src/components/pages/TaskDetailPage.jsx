import { useState } from "react";
import { Timer, Check, Paperclip, Pencil, Trash2, Clock, Calendar, Sun, Sunset, Moon, Gift } from "lucide-react";
import { Glass, Btn, ConfirmModal } from "../ui";
import { getWsIcon } from "../../lib/constants";
import { priorityDot, badgeStyle, sectionHeader } from "../../lib/styles";

const sectionLabels = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };
const SectionIcon = ({ section, size = 12 }) => {
  if (section === "morning") return <Sun size={size} />;
  if (section === "evening") return <Moon size={size} />;
  return <Sunset size={size} />;
};

export default function TaskDetailPage({
  activeTask, ws, pColors,
  setPage, page,
  startFocus, toggleTask, toggleSubtask,
  setEditingTask, deleteTask,
  setShowNewNote, deleteTaskNote,
  flash,
}) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  if (!activeTask) return <div>Task not found</div>;
  const w = ws.find(x => x.id === activeTask.wsId);
  const subDone = activeTask.subtasks.filter(s => s.done).length;
  return (
    <div style={{ maxWidth:760 }}>
      <div onClick={() => setPage(page === "task" ? "today" : page)} style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--primary)",cursor:"pointer",marginBottom:16,fontWeight:600 }}>← Back</div>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap" }}>
        <div style={priorityDot(pColors[activeTask.priority], 10)} />
        <span style={{ fontFamily:"var(--mono)",fontSize:10,color:pColors[activeTask.priority],fontWeight:700,textTransform:"uppercase",letterSpacing:1 }}>{activeTask.priority} priority</span>
        {w && <span style={{ ...badgeStyle(w?.color), gap:4, padding:"2px 10px", borderRadius:8, fontSize:10 }}>{getWsIcon(w?.icon, 10)} {w?.name}</span>}
        {activeTask.section && (
          <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:"var(--subtle-bg)",padding:"2px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>
            <SectionIcon section={activeTask.section} size={10} /> {sectionLabels[activeTask.section]}
          </span>
        )}
        {activeTask.dueDate && (
          <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:"var(--subtle-bg)",padding:"2px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>
            <Calendar size={10} /> {activeTask.dueDate}
          </span>
        )}
        {activeTask.dueTime && (
          <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:activeTask.priority==="high"?"rgba(239,68,68,0.08)":"var(--subtle-bg)",padding:"2px 10px",borderRadius:8,fontFamily:"var(--mono)",fontSize:10,color:activeTask.priority==="high"?"var(--danger)":"var(--muted)",fontWeight:600 }}>
            <Clock size={10} /> {activeTask.dueTime}
          </span>
        )}
      </div>
      <h1 style={{ fontFamily:"var(--heading)",fontSize:26,color:"var(--text)",margin:"0 0 6px",fontWeight:800,letterSpacing:-0.5 }}>{activeTask.title}</h1>
      {activeTask.desc && <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",lineHeight:1.6,margin:"0 0 20px" }}>{activeTask.desc}</p>}

      <div style={{ display:"flex",gap:10,marginBottom:24,flexWrap:"wrap" }}>
        <Btn primary color={w?.color} onClick={() => startFocus(activeTask.id)}>Start Focus Session</Btn>
        <Btn onClick={() => toggleTask(activeTask.id)}>{activeTask.done ? "Mark Incomplete" : "Mark Complete"}</Btn>
        <Btn onClick={() => setEditingTask({ ...activeTask })}><Pencil size={14} style={{ marginRight:4 }} /> Edit</Btn>
        <Btn onClick={() => setConfirmDelete({ id: activeTask.id, title: activeTask.title })} style={{ color:"#EF4444" }}><Trash2 size={14} style={{ marginRight:4 }} /> Delete</Btn>
      </div>

      {activeTask.totalPomos > 0 && (
        <Glass style={{ padding:18,marginBottom:16,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {Array.from({ length: activeTask.totalPomos }, (_, i) => (
              <div key={i} style={{
                width:32,height:32,borderRadius:10,
                background: i < activeTask.donePomos ? `linear-gradient(135deg, ${w?.color || "var(--primary)"}, ${w?.color || "var(--primary)"}88)` : "var(--subtle-bg)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
                color: i < activeTask.donePomos ? "#fff" : "var(--muted)",
              }}>{i < activeTask.donePomos ? <Timer size={24} /> : i+1}</div>
            ))}
          </div>
          <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{activeTask.donePomos}/{activeTask.totalPomos} pomodoros</span>
        </Glass>
      )}

      {activeTask.subtasks.length > 0 && (
        <Glass style={{ padding:20,marginBottom:16 }}>
          <h3 style={{ ...sectionHeader, margin:"0 0 14px" }}>Steps</h3>
          {activeTask.subtasks.map((s,i) => (
            <div key={s.id} onClick={() => toggleSubtask(activeTask.id, s.id)} style={{
              display:"flex",alignItems:"center",gap:12,padding:"10px 0",cursor:"pointer",
              borderBottom: i < activeTask.subtasks.length-1 ? "1px solid var(--border-light)" : "none",
              opacity: s.done ? 0.5 : 1,
            }}>
              <div style={{
                width:22,height:22,borderRadius:7,flexShrink:0,
                background:s.done?"#22C55E":"transparent",border:s.done?"none":"2px solid var(--checkbox-border)",
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
          <h3 style={{ ...sectionHeader, margin:0 }}>Notes</h3>
          <Btn small primary color="#5B8DEF" onClick={() => setShowNewNote(true)}>+ Add Note</Btn>
        </div>
        {activeTask.notes.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:"10px 0" }}>No notes yet.</div>}
        {activeTask.notes.map(n => (
          <div key={n.id} style={{ background:"var(--input-bg)",borderRadius:10,padding:14,marginBottom:8,border:"1px solid var(--border-light)" }}>
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",lineHeight:1.7,whiteSpace:"pre-wrap" }}>{n.text}</div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6 }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{n.time}</div>
              <div role="button" onClick={() => deleteTaskNote(activeTask.id, n.id)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
              ><Trash2 size={13}/></div>
            </div>
          </div>
        ))}
      </Glass>

      <Glass style={{ padding:20 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <h3 style={{ ...sectionHeader, margin:0 }}>Attachments</h3>
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
          <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
            <Gift size={14} color="#F59E0B" />
            <span style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>After this task...</span>
          </div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)" }}>{activeTask.reward}</div>
        </Glass>
      )}

      <ConfirmModal
        item={confirmDelete}
        onConfirm={() => { deleteTask(confirmDelete.id); setConfirmDelete(null); setPage("allTasks"); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
