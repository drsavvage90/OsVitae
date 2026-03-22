import { Flame, Timer, CheckCircle2 } from "lucide-react";
import { Glass } from "../ui";
import { ACHIEVEMENTS } from "../../lib/constants";

export default function RewardsPage({ level, xp, themeName, streak, totalPomosEver, donePomos, doneTasks, totalTasksDone }) {
  return (
    <div>
      <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:"0 0 4px",fontWeight:800,letterSpacing:-0.8 }}>Your Progress</h1>
      <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"0 0 24px" }}>Every step forward earns XP. Consistency unlocks rewards.</p>

      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:24 }}>
        <span style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--xp-color)",fontWeight:700 }}>LVL {level}</span>
        <div style={{ flex:1,height:8,background:"var(--card-border)",borderRadius:8,overflow:"hidden" }}>
          <div style={{ width:`${(xp/500)*100}%`,height:"100%",borderRadius:8,background:themeName === "halo" ? "linear-gradient(90deg, #FFB000, #4ADE80)" : "linear-gradient(90deg, #A78BFA, #6366F1, #818CF8)",transition:"width 0.8s" }} />
        </div>
        <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{xp}/500 XP</span>
      </div>

      <div className="rewards-stats" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:28 }}>
        {[
          { icon:<Flame size={24} />,label:"Current Streak",value:`${streak} days`,sub:"Best: 12 days" },
          { icon:<Timer size={24} />,label:"Total Pomodoros",value:`${totalPomosEver}`,sub:`This week: ${donePomos + 18}` },
          { icon:<CheckCircle2 size={24} />,label:"Tasks Completed",value:`${totalTasksDone}`,sub:`This week: ${doneTasks + 4}` },
        ].map((s,i) => (
          <Glass key={i} style={{ padding:20,textAlign:"center" }}>
            <div style={{ fontSize:28,marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>{s.label}</div>
            <div style={{ fontFamily:"var(--heading)",fontSize:24,fontWeight:800,color:"var(--text)" }}>{s.value}</div>
            <div style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--muted)",marginTop:4 }}>{s.sub}</div>
          </Glass>
        ))}
      </div>

      <h2 style={{ fontFamily:"var(--heading)",fontSize:18,color:"var(--text)",margin:"0 0 16px",fontWeight:700 }}>Achievements</h2>
      <div className="achievements-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        {ACHIEVEMENTS.map(b => (
          <Glass key={b.id} hover style={{ display:"flex",alignItems:"center",gap:14,padding:16,opacity:b.earned?1:0.4 }}>
            <div style={{
              width:44,height:44,borderRadius:12,
              background:b.earned?"linear-gradient(135deg, rgba(253,246,227,0.8), rgba(245,230,200,0.8))":"var(--subtle-bg)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
              filter:b.earned?"none":"grayscale(1)",
            }}>{b.icon}</div>
            <div>
              <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{b.title}</div>
              <div style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--muted)" }}>{b.desc}</div>
            </div>
            {b.earned && <span style={{ marginLeft:"auto",fontFamily:"var(--mono)",fontSize:9,color:"var(--success)",fontWeight:700 }}>EARNED</span>}
          </Glass>
        ))}
      </div>
    </div>
  );
}
