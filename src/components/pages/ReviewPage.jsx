import { Glass } from "../ui";
import { getWsIcon } from "../../lib/constants";

const goalStatusColors = { "in-progress": "#5B8DEF", "on-track": "#22C55E", "at-risk": "#EF4444", "completed": "#A78BFA" };
const healthColors = { strong: "#22C55E", "needs-attention": "#F59E0B", fading: "#EF4444" };

export default function ReviewPage({ tasks, contacts, inbox, habits, goals, toggleHabit, goTask, goContact, pColors }) {
  const incompleteTasks = tasks.filter(t => !t.done);
  const upcomingDeadlines = tasks.filter(t => t.dueDate && !t.done);
  const fadingContacts = contacts.filter(c => c.health === "fading");
  const untriagedInbox = inbox.filter(i => !i.triaged);
  const today = new Date().toISOString().split("T")[0];
  const habitsNotDone = habits.filter(h => !h.completions.includes(today));
  return (
    <div>
      <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:"0 0 4px",fontWeight:800 }}>Weekly Review</h1>
      <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"0 0 24px" }}>Take stock of where you are and plan your next moves.</p>

      <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:24 }}>
        {[
          { label:"Open Tasks",value:incompleteTasks.length,color:"var(--primary)" },
          { label:"Deadlines",value:upcomingDeadlines.length,color:"#F59E0B" },
          { label:"Inbox Items",value:untriagedInbox.length,color:"var(--danger)" },
          { label:"Fading Contacts",value:fadingContacts.length,color:"#EC4899" },
        ].map((s,i) => (
          <Glass key={i} style={{ padding:18,textAlign:"center" }}>
            <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:s.color }}>{s.value}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2 }}>{s.label}</div>
          </Glass>
        ))}
      </div>

      <Glass style={{ padding:20,marginBottom:14 }}>
        <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 14px",fontWeight:700 }}>Goal Progress</h3>
        {goals.map(g => (
          <div key={g.id} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
            <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1,fontWeight:600 }}>{g.title}</span>
            <div style={{ width:120,height:6,background:"var(--card-border)",borderRadius:6,overflow:"hidden" }}>
              <div style={{ width:`${g.progress}%`,height:"100%",borderRadius:6,background:goalStatusColors[g.status] }} />
            </div>
            <span style={{ fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:goalStatusColors[g.status],minWidth:35,textAlign:"right" }}>{g.progress}%</span>
          </div>
        ))}
      </Glass>

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

      {fadingContacts.length > 0 && (
        <Glass style={{ padding:20,marginBottom:14 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:15,color:"var(--text)",margin:"0 0 12px",fontWeight:700 }}>Reconnect With</h3>
          {fadingContacts.map(c => (
            <div key={c.id} onClick={() => goContact(c.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:"1px solid var(--subtle-bg)" }}>
              <div style={{ width:28,height:28,borderRadius:8,background:`${healthColors.fading}18`,display:"flex",alignItems:"center",justifyContent:"center",color:healthColors.fading,fontFamily:"var(--heading)",fontSize:11,fontWeight:700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
              <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1,fontWeight:600 }}>{c.name}</span>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>Last: {c.lastContact}</span>
            </div>
          ))}
        </Glass>
      )}
    </div>
  );
}
