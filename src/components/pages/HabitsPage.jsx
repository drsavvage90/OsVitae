import { Check, Flame, Trash2, Pencil } from "lucide-react";
import { Glass, Btn } from "../ui";
import { getWsIcon } from "../../lib/constants";
import { frequencyLabel, daysForFrequency } from "../../hooks/useHabits";

export default function HabitsPage({ habits, setShowNewHabit, toggleHabit, deleteHabit, setEditingHabit }) {
  const today = new Date().toISOString().split("T")[0];
  const todayDow = new Date().getDay();
  const scheduledToday = habits.filter(h => {
    const days = h.scheduleDays || daysForFrequency(h.frequency);
    return days.includes(todayDow);
  });
  const completedToday = scheduledToday.filter(h => h.completions.includes(today)).length;
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Habits</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{completedToday}/{scheduledToday.length} completed today</p>
        </div>
        <Btn primary onClick={() => setShowNewHabit(true)}>+ New Habit</Btn>
      </div>
      {habits.length === 0 && (
        <Glass style={{ padding:32,textAlign:"center" }}>
          <div style={{ fontSize:32,marginBottom:12 }}>&#x1f331;</div>
          <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:6 }}>No habits yet</div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:16 }}>Build your routine — start with one small habit and grow from there.</div>
          <Btn primary onClick={() => setShowNewHabit(true)}>+ Create Your First Habit</Btn>
        </Glass>
      )}
      <div className="rewards-stats" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
        {habits.map((h, i) => {
          const doneToday = h.completions.includes(today);
          const scheduleDays = h.scheduleDays || daysForFrequency(h.frequency);
          const last7 = Array.from({ length: 7 }, (_, d) => {
            const date = new Date(); date.setDate(date.getDate() - (6 - d));
            const dow = date.getDay();
            const dateStr = date.toISOString().split("T")[0];
            const scheduled = scheduleDays.includes(dow);
            const done = h.completions.includes(dateStr);
            return { scheduled, done };
          });
          return (
            <Glass key={h.id} hover onClick={() => toggleHabit(h.id)} style={{ padding:18,cursor:"pointer",animation:`slideUp 0.3s ${i*0.05}s both ease-out`,border: doneToday ? `1px solid ${h.color}33` : "1px solid var(--card-border)",background: doneToday ? `${h.color}06` : "var(--card-bg)" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:`${h.color}18`,display:"flex",alignItems:"center",justifyContent:"center",color:h.color }}>{getWsIcon(h.icon, 18)}</div>
                  <div>
                    <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{h.name}</div>
                    <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{frequencyLabel(h.frequency, scheduleDays)}</div>
                  </div>
                </div>
                <div style={{ width:24,height:24,borderRadius:8,background:doneToday?h.color:"var(--subtle-bg)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s" }}>
                  {doneToday && <Check size={14} color="#fff" />}
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div style={{ display:"flex",gap:4 }}>
                  {last7.map((day, d) => (
                    <div key={d} style={{
                      width:12,height:12,borderRadius:3,transition:"all 0.2s",
                      background: day.done ? h.color : day.scheduled ? "var(--subtle-bg)" : "transparent",
                      border: !day.scheduled && !day.done ? "1px dashed var(--border-light)" : "1px solid transparent",
                    }} />
                  ))}
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <Flame size={12} color={h.color} />
                  <span style={{ fontFamily:"var(--mono)",fontSize:11,color:h.color,fontWeight:700 }}>{h.streak}</span>
                  <div role="button" onClick={(e) => { e.stopPropagation(); setEditingHabit(h); }} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color="var(--primary)"; e.currentTarget.style.background="var(--subtle-bg)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                  ><Pencil size={13}/></div>
                  <div role="button" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this habit?")) deleteHabit(h.id); }} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                  ><Trash2 size={13}/></div>
                </div>
              </div>
            </Glass>
          );
        })}
      </div>
    </div>
  );
}
