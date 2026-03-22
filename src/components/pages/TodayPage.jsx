import { Sunrise, Sun, Moon, Flame, Check, Play, ChevronRight, Inbox as InboxIcon } from "lucide-react";
import { Glass, Ring, Btn } from "../ui";
import { supabase } from "../../lib/supabase";
import { getUserId } from "../../lib/getUserId";

export default function TodayPage({
  greeting, totalTasks, doneTasks, totalPomos, donePomos,
  habits, toggleHabit, streak, themeName,
  timerActive, timeLeft, fmt, setTimerTaskId, setPage,
  tasks, goTask, TaskRow,
  inbox, contacts, goContact,
  intentionText, setIntentionText, editingIntention, setEditingIntention,
  setNewTaskWs, setShowNewTask, flash, inputStyle,
}) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap" }}>
        <div style={{ flex:1,minWidth:0 }}>
          <h1 className="today-heading" style={{ fontFamily:"var(--heading)",fontSize:32,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-1 }}>{greeting}</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:15,color:"var(--muted)",margin:"6px 0 0" }}>
            <strong style={{ color:"var(--text)" }}>{totalTasks - doneTasks} tasks</strong> and <strong style={{ color:"var(--text)" }}>{totalPomos - donePomos} pomodoros</strong> on your plate
          </p>
        </div>
        <div className="today-date" style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)",textAlign:"right",flexShrink:0 }}>
          <div style={{ fontWeight:700,color:"var(--text)",fontSize:14 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <div style={{ fontSize:11 }}>Week {Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:24 }}>
        <Glass style={{ padding:18,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ position:"relative",width:48,height:48,flexShrink:0 }}>
            <Ring percent={(doneTasks/totalTasks)*100} size={48} stroke={4} color="#22C55E" />
            <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:"var(--text)" }}>{doneTasks}/{totalTasks}</div>
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>Tasks</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{Math.round((doneTasks/totalTasks)*100)}% complete</div>
          </div>
        </Glass>
        <Glass onClick={() => setPage("habits")} hover style={{ padding:18,display:"flex",alignItems:"center",gap:14,cursor:"pointer" }}>
          {(() => { const today = new Date().toISOString().split("T")[0]; const done = habits.filter(h => h.completions.includes(today)).length; const total = habits.length; return (<>
            <div style={{ position:"relative",width:48,height:48,flexShrink:0 }}>
              <Ring percent={total > 0 ? (done/total)*100 : 0} size={48} stroke={4} color="#22C55E" />
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:"var(--text)" }}>{done}/{total}</div>
            </div>
            <div>
              <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>Habits</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{total - done > 0 ? `${total - done} remaining` : "All done!"}</div>
            </div>
          </>); })()}
        </Glass>
        <Glass style={{ padding:18,display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:32, color:"var(--danger)", display:"flex", alignItems:"center", justifyContent:"center" }}><Flame size={32} /></span>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:22,fontWeight:800,color:"var(--text)" }}>{streak}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>day streak</div>
          </div>
        </Glass>
        <div onClick={() => { setTimerTaskId(null); setPage("timer"); }} style={{
          background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",borderRadius:16,padding:20,
          display:"flex",alignItems:"center",justifyContent:"center",gap:14,cursor:"pointer",color:"#fff",
          boxShadow:themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)",transition:"all 0.25s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 8px 32px rgba(74,222,128,0.4)" : "0 8px 32px rgba(99,102,241,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)"; }}
        >
          <div style={{ width:44,height:44,borderRadius:14,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}><Play fill="currentColor" size={20} /></div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"#fff" }}>Start Focus</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:11,color:"rgba(255,255,255,0.7)" }}>{timerActive ? fmt(timeLeft) : "25:00"}</div>
          </div>
        </div>
      </div>

      {/* Tasks + sidebar */}
      <div className="today-layout" style={{ display:"flex",gap:22 }}>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <h2 style={{ fontFamily:"var(--heading)",fontSize:19,color:"var(--text)",margin:0,fontWeight:700 }}>Today's Plan</h2>
            <Btn primary onClick={() => { setNewTaskWs("cs301"); setShowNewTask(true); }}>+ Add Task</Btn>
          </div>
          {[
            { label:"Morning",icon:<Sunrise size={18} />,time:"8 AM – 12 PM",section:"morning" },
            { label:"Afternoon",icon:<Sun size={18} />,time:"12 – 5 PM",section:"afternoon" },
            { label:"Evening",icon:<Moon size={18} />,time:"5 – 10 PM",section:"evening" },
          ].map((block,bi) => {
            const bt = tasks.filter(t => t.section === block.section);
            const bd = bt.filter(t => t.done).length;
            return (
              <div key={block.section} style={{ marginBottom:20 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"0 4px" }}>
                  <span style={{ fontSize:15 }}>{block.icon}</span>
                  <span style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{block.label}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{block.time}</span>
                  <div style={{ flex:1,height:1,background:"var(--card-border)",marginLeft:8 }} />
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600 }}>{bd}/{bt.length}</span>
                </div>
                {bt.map((task,i) => <TaskRow key={task.id} task={task} idx={bi*3+i} />)}
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="today-sidebar" style={{ width:280,flexShrink:0 }}>
          <Glass style={{ padding:18,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 12px",fontWeight:700 }}>Upcoming</h3>
            {tasks.filter(t=>t.dueDate&&!t.done).slice(0,3).map((t,i) => (
              <div key={t.id} onClick={() => goTask(t.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<2?"1px solid rgba(0,0,0,0.04)":"none",cursor:"pointer" }}>
                <div style={{ width:5,height:5,borderRadius:"50%",background:t.priority==="high"?"#EF4444":"#F59E0B",flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)",fontWeight:600 }}>{t.title}</div>
                </div>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,fontWeight:600,color:t.priority==="high"?"#EF4444":"var(--muted)" }}>{t.dueDate}</span>
              </div>
            ))}
          </Glass>

          {/* Today's Habits */}
          <Glass style={{ padding:18,marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
              <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:0,fontWeight:700 }}>Today's Habits</h3>
              <span onClick={() => setPage("habits")} style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--primary)",cursor:"pointer",fontWeight:600 }}>View all</span>
            </div>
            {(() => { const today = new Date().toISOString().split("T")[0]; return habits.map(h => {
              const done = h.completions.includes(today);
              return (
                <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"6px 0",cursor:"pointer",borderBottom:"1px solid var(--subtle-bg)" }}>
                  <div style={{ width:18,height:18,borderRadius:6,background:done?h.color:"transparent",border:done?"none":`1.5px solid var(--checkbox-border)`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0 }}>{done && <Check size={10} color="#fff" />}</div>
                  <span style={{ fontFamily:"var(--body)",fontSize:12,color:done?"var(--muted)":"var(--text)",textDecoration:done?"line-through":"none",flex:1 }}>{h.name}</span>
                  <div style={{ display:"flex",alignItems:"center",gap:3 }}><Flame size={10} color={h.color} /><span style={{ fontFamily:"var(--mono)",fontSize:9,color:h.color,fontWeight:700 }}>{h.streak}</span></div>
                </div>
              );
            }); })()}
          </Glass>

          {/* Inbox alert */}
          {(() => { const untriaged = inbox.filter(i => !i.triaged).length; return untriaged > 0 ? (
            <Glass onClick={() => setPage("inbox")} hover style={{ padding:14,marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.12)" }}>
              <div style={{ width:32,height:32,borderRadius:10,background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center" }}><InboxIcon size={16} color="#EF4444" /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{untriaged} inbox item{untriaged > 1 ? "s" : ""}</div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>waiting to be triaged</div>
              </div>
              <ChevronRight size={14} color="var(--muted)" />
            </Glass>
          ) : null; })()}

          {/* Reconnect */}
          {(() => { const fading = contacts.filter(c => c.health === "fading"); return fading.length > 0 ? (
            <Glass style={{ padding:14,marginBottom:14 }}>
              <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 10px",fontWeight:700 }}>Reconnect</h3>
              {fading.slice(0,3).map(c => (
                <div key={c.id} onClick={() => goContact(c.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"6px 0",cursor:"pointer" }}>
                  <div style={{ width:24,height:24,borderRadius:7,background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--danger)",fontFamily:"var(--heading)",fontSize:9,fontWeight:700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
                  <span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)",flex:1,fontWeight:500 }}>{c.name}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>{c.lastContact}</span>
                </div>
              ))}
            </Glass>
          ) : null; })()}

          <Glass style={{ padding:18,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 10px",fontWeight:700 }}>Today's Intention</h3>
            {editingIntention ? (
              <div>
                <textarea value={intentionText} onChange={e => setIntentionText(e.target.value)} style={{ ...inputStyle, minHeight:70,resize:"vertical",fontStyle:"italic" }} />
                <Btn small primary style={{ marginTop:8 }} onClick={async () => { setEditingIntention(false); flash("Intention saved!"); const userId = await getUserId(); if (userId) { const { error } = await supabase.from("profiles").update({ intention_text: intentionText }).eq("id", userId); if (error) console.error("Failed to save intention:", error); } }}>Save</Btn>
              </div>
            ) : (
              <div>
                <div style={{ background:"var(--input-bg)",borderRadius:10,padding:14,border:"1px dashed rgba(0,0,0,0.08)",fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)",lineHeight:1.7,fontStyle:"italic" }}>"{intentionText}"</div>
                <div onClick={() => setEditingIntention(true)} style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--primary)",cursor:"pointer",marginTop:8,fontWeight:600 }}>Edit intention</div>
              </div>
            )}
          </Glass>
          <Glass style={{ padding:18,background:"linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.04))",border:"1px solid rgba(251,191,36,0.15)" }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 8px",fontWeight:700 }}>Today's Reward</h3>
            <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)" }}>Finish all tasks: <strong>Movie night!</strong></div>
            <div style={{ marginTop:10,height:5,background:"var(--card-border)",borderRadius:6,overflow:"hidden" }}>
              <div style={{ width:`${(doneTasks/totalTasks)*100}%`,height:"100%",borderRadius:6,background:"linear-gradient(90deg, #FBBF24, #F59E0B)",transition:"width 0.5s" }} />
            </div>
            <div style={{ fontFamily:"var(--mono)",fontSize:9.5,color:"var(--muted)",marginTop:6,textAlign:"center" }}>{doneTasks}/{totalTasks}</div>
          </Glass>
        </div>
      </div>
    </div>
  );
}
