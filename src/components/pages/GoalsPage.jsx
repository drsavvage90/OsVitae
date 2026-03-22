import { ChevronRight, Trash2, Pencil } from "lucide-react";
import { Glass, Btn } from "../ui";

const goalStatusColors = { "in-progress": "#5B8DEF", "on-track": "#22C55E", "at-risk": "#EF4444", "completed": "#A78BFA" };

export default function GoalsPage({ goals, setShowNewGoal, expandedGoals, setExpandedGoals, deleteGoal, setEditingGoal, tasks, goTask }) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Goals & OKRs</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{goals.length} objectives tracked</p>
        </div>
        <Btn primary onClick={() => setShowNewGoal(true)}>+ New Goal</Btn>
      </div>
      {goals.map((g, i) => {
        const expanded = expandedGoals[g.id];
        return (
          <Glass key={g.id} style={{ padding:20,marginBottom:14,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
            <div onClick={() => setExpandedGoals(prev => ({ ...prev, [g.id]: !prev[g.id] }))} style={{ cursor:"pointer",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ transition:"transform 0.2s",transform:expanded?"rotate(90deg)":"none" }}><ChevronRight size={18} color="var(--muted)" /></div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
                  <span style={{ fontFamily:"var(--heading)",fontSize:16,fontWeight:700,color:"var(--text)" }}>{g.title}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:9,fontWeight:700,color:goalStatusColors[g.status],background:`${goalStatusColors[g.status]}14`,padding:"2px 8px",borderRadius:6,textTransform:"uppercase",letterSpacing:0.5 }}>{g.status}</span>
                </div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{g.quarter}</div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ width:80 }}>
                  <div style={{ height:6,background:"var(--card-border)",borderRadius:6,overflow:"hidden" }}>
                    <div style={{ width:`${g.progress}%`,height:"100%",borderRadius:6,background:goalStatusColors[g.status],transition:"width 0.5s" }} />
                  </div>
                </div>
                <span style={{ fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:goalStatusColors[g.status] }}>{g.progress}%</span>
                <div onClick={(e) => { e.stopPropagation(); setEditingGoal(g); }} style={{ cursor:"pointer",color:"var(--muted)",marginLeft:4 }}
                  onMouseEnter={e => e.currentTarget.style.color="var(--primary)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                ><Pencil size={14}/></div>
                <div onClick={(e) => { e.stopPropagation(); if (confirm("Delete this goal?")) deleteGoal(g.id); }} style={{ cursor:"pointer",color:"var(--muted)" }}
                  onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                ><Trash2 size={14}/></div>
              </div>
            </div>
            {expanded && g.keyResults && (
              <div style={{ marginTop:16,paddingLeft:30 }}>
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontWeight:600 }}>Key Results</div>
                {g.keyResults.map(kr => (
                  <div key={kr.id} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",marginBottom:4 }}>{kr.title}</div>
                      <div style={{ height:4,background:"var(--card-border)",borderRadius:4,overflow:"hidden" }}>
                        <div style={{ width:`${kr.progress}%`,height:"100%",borderRadius:4,background:goalStatusColors[g.status],transition:"width 0.5s" }} />
                      </div>
                    </div>
                    <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",fontWeight:600,minWidth:35,textAlign:"right" }}>{kr.progress}%</span>
                  </div>
                ))}
                {g.linkedTaskIds.length > 0 && (
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontWeight:600 }}>Linked Tasks</div>
                    {g.linkedTaskIds.map(tid => {
                      const t = tasks.find(x => x.id === tid);
                      if (!t) return null;
                      return <div key={tid} onClick={() => goTask(tid)} style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--primary)",cursor:"pointer",padding:"4px 0",fontWeight:600 }}>→ {t.title}</div>;
                    })}
                  </div>
                )}
              </div>
            )}
          </Glass>
        );
      })}
    </div>
  );
}
