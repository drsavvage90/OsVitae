import { Glass } from "../ui";
import { getWsIcon } from "../../lib/constants";

export default function ReviewPage({ tasks, inbox, habits, toggleHabit, goTask, pColors }) {
  const incompleteTasks = tasks.filter(t => !t.done);
  const upcomingDeadlines = tasks.filter(t => t.dueDate && !t.done);
  const untriagedInbox = inbox.filter(i => !i.triaged);
  const today = new Date().toISOString().split("T")[0];
  const habitsNotDone = habits.filter(h => !h.completions.includes(today));
  return (
    <div>
      <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:"0 0 4px",fontWeight:800 }}>Weekly Review</h1>
      <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"0 0 24px" }}>Take stock of where you are and plan your next moves.</p>

      <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:24 }}>
        {[
          { label:"Open Tasks",value:incompleteTasks.length,color:"var(--primary)" },
          { label:"Deadlines",value:upcomingDeadlines.length,color:"#F59E0B" },
          { label:"Inbox Items",value:untriagedInbox.length,color:"var(--danger)" },
        ].map((s,i) => (
          <Glass key={i} style={{ padding:18,textAlign:"center" }}>
            <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:s.color }}>{s.value}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2 }}>{s.label}</div>
          </Glass>
        ))}
      </div>

      {upcomingDeadlines.length > 0 && (
        <Glass style={{ padding:20,marginBottom:14 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 12px",fontWeight:700 }}>Upcoming Deadlines</h3>
          {upcomingDeadlines.map(t => (
            <div key={t.id} onClick={() => goTask(t.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:"1px solid var(--subtle-bg)" }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:pColors[t.priority] }} />
              <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1,fontWeight:600 }}>{t.title}</span>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:t.priority==="high"?"#EF4444":"var(--muted)",fontWeight:600 }}>{t.dueDate}</span>
            </div>
          ))}
        </Glass>
      )}

      {habitsNotDone.length > 0 && (
        <Glass style={{ padding:20,marginBottom:14 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 12px",fontWeight:700 }}>Habits Still Pending Today</h3>
          {habitsNotDone.map(h => (
            <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:"1px solid var(--subtle-bg)" }}>
              <div style={{ width:24,height:24,borderRadius:8,background:`${h.color}18`,display:"flex",alignItems:"center",justifyContent:"center",color:h.color }}>{getWsIcon(h.icon, 12)}</div>
              <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1 }}>{h.name}</span>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{h.streak} streak</span>
            </div>
          ))}
        </Glass>
      )}

      {incompleteTasks.length === 0 && upcomingDeadlines.length === 0 && untriagedInbox.length === 0 && habitsNotDone.length === 0 && (
        <Glass style={{ padding:32,textAlign:"center" }}>
          <div style={{ fontSize:32,marginBottom:12 }}>&#x2728;</div>
          <div style={{ fontFamily:"var(--heading)",fontSize:17,fontWeight:700,color:"var(--text)",marginBottom:6 }}>All clear</div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>Tasks done, habits complete, inbox empty. You've earned a break.</div>
        </Glass>
      )}

    </div>
  );
}
