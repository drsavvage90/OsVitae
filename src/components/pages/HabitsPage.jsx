import { Check, Flame, Trash2, Pencil } from "lucide-react";
import { Glass, Btn } from "../ui";
import { getWsIcon } from "../../lib/constants";

export default function HabitsPage({ habits, setShowNewHabit, toggleHabit, deleteHabit, setEditingHabit }) {
  const today = new Date().toISOString().split("T")[0];
  const completedToday = habits.filter(h => h.completions.includes(today)).length;
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Habits</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{completedToday}/{habits.length} completed today</p>
        </div>
        <Btn primary onClick={() => setShowNewHabit(true)}>+ New Habit</Btn>
      </div>
      <div className="rewards-stats" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
        {habits.map((h, i) => {
          const doneToday = h.completions.includes(today);
          const last7 = Array.from({ length: 7 }, (_, d) => {
            const date = new Date(); date.setDate(date.getDate() - (6 - d));
            return h.completions.includes(date.toISOString().split("T")[0]);
          });
          return (
            <Glass key={h.id} hover onClick={() => toggleHabit(h.id)} style={{ padding:18,cursor:"pointer",animation:`slideUp 0.3s ${i*0.05}s both ease-out`,border: doneToday ? `1px solid ${h.color}33` : "1px solid var(--card-border)",background: doneToday ? `${h.color}06` : "var(--card-bg)" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:`${h.color}18`,display:"flex",alignItems:"center",justifyContent:"center",color:h.color }}>{getWsIcon(h.icon, 18)}</div>
                  <div>
                    <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{h.name}</div>
                    <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{h.frequency}</div>
                  </div>
                </div>
                <div style={{ width:24,height:24,borderRadius:8,background:doneToday?h.color:"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s" }}>
                  {doneToday && <Check size={14} color="#fff" />}
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div style={{ display:"flex",gap:4 }}>
                  {last7.map((done, d) => (
                    <div key={d} style={{ width:12,height:12,borderRadius:3,background:done?h.color:"rgba(0,0,0,0.06)",transition:"all 0.2s" }} />
                  ))}
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <Flame size={12} color={h.color} />
                  <span style={{ fontFamily:"var(--mono)",fontSize:11,color:h.color,fontWeight:700 }}>{h.streak}</span>
                  <div onClick={(e) => { e.stopPropagation(); setEditingHabit(h); }} style={{ cursor:"pointer",color:"var(--muted)",marginLeft:4 }}
                    onMouseEnter={e => e.currentTarget.style.color="var(--primary)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                  ><Pencil size={12}/></div>
                  <div onClick={(e) => { e.stopPropagation(); if (confirm("Delete this habit?")) deleteHabit(h.id); }} style={{ cursor:"pointer",color:"var(--muted)" }}
                    onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                  ><Trash2 size={12}/></div>
                </div>
              </div>
            </Glass>
          );
        })}
      </div>
    </div>
  );
}
