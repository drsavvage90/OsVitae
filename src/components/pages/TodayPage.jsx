import { Flame, Check, Play, ChevronRight, Inbox as InboxIcon, Sun, Sunset, Moon, AlertTriangle, Trophy } from "lucide-react";
import { Glass, Ring, Btn } from "../ui";
import { supabase } from "../../lib/supabase";
import { getUserId } from "../../lib/getUserId";
import { logger } from "../../lib/logger";

const SECTIONS = [
  { key: "morning", label: "Morning", icon: Sun, color: "#FBBF24" },
  { key: "afternoon", label: "Afternoon", icon: Sunset, color: "#F97316" },
  { key: "evening", label: "Evening", icon: Moon, color: "#8B5CF6" },
];

function TodaySchedule({ tasks, TaskRow, setNewTaskWs, setShowNewTask, rewardText }) {
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.dueDate === today);
  const allDone = todayTasks.length > 0 && todayTasks.every(t => t.done);
  // Determine which section is "now"
  const hour = new Date().getHours();
  const activeSection = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div>
      {allDone && (
        <Glass style={{ padding:"20px 22px",marginBottom:18,border:"2px solid rgba(34,197,94,0.25)",background:"rgba(34,197,94,0.04)",textAlign:"center",animation:"scaleIn 0.3s ease" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:rewardText ? 8 : 0 }}>
            <Trophy size={24} color="#22C55E" />
            <span style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:800,color:"var(--text)" }}>You crushed it today!</span>
          </div>
          {rewardText && (
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>Time for your reward: <strong style={{ color:"var(--text)" }}>{rewardText}</strong></div>
          )}
        </Glass>
      )}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
        <h2 style={{ fontFamily:"var(--heading)",fontSize:20,color:"var(--text)",margin:0,fontWeight:800 }}>Today's Schedule</h2>
        <Btn primary onClick={() => { setNewTaskWs(null); setShowNewTask(true); }}>+ Task</Btn>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        {SECTIONS.map(({ key, label, icon: Icon, color }) => {
          const undone = todayTasks.filter(t => (t.section || "morning") === key && !t.done);
          const isActive = key === activeSection;
          return (
            <Glass key={key} style={{
              padding:"16px 18px",
              border: isActive ? `1.5px solid ${color}33` : undefined,
              background: isActive ? `${color}06` : undefined,
            }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom: undone.length > 0 ? 12 : 0 }}>
                <div style={{
                  width:30,height:30,borderRadius:8,
                  background:`${color}18`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{label}</div>
                </div>
                {isActive && (
                  <div style={{ fontFamily:"var(--mono)",fontSize:9,color,fontWeight:700,background:`${color}15`,padding:"3px 8px",borderRadius:6,textTransform:"uppercase" }}>Now</div>
                )}
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>
                  {undone.length}
                </div>
              </div>
              {undone.length === 0 && (
                <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",textAlign:"center",padding:"4px 0" }}>All done!</div>
              )}
              {undone.map((task, i) => (
                <TaskRow key={task.id} task={task} idx={i} />
              ))}
            </Glass>
          );
        })}
      </div>
    </div>
  );
}

export default function TodayPage({
  greeting, totalTasks, doneTasks, totalPomos, donePomos, habits, toggleHabit, streak, themeName,
  timerActive, timeLeft, fmt, setTimerTaskId, setPage, tasks, TaskRow, inbox,
  intentionText, setIntentionText, editingIntention, setEditingIntention,
  setNewTaskWs, setShowNewTask, flash, inputStyle,
  rewardText, setRewardText, editingReward, setEditingReward,
  xp, level,
}) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap" }}>
        <div style={{ flex:1,minWidth:0 }}>
          <h1 className="today-heading" style={{ fontFamily:"var(--heading)",fontSize:32,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-1 }}>{greeting}</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:15,color:"var(--muted)",margin:"6px 0 0" }}>
            <strong style={{ color:"var(--text)" }}>{totalTasks - doneTasks} tasks</strong> and <strong style={{ color:"var(--text)" }}>{totalPomos - donePomos} pomodoros</strong> on your plate
          </p>
          {level != null && (
            <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--xp-color, var(--primary))",fontWeight:700 }}>LVL {level}</span>
              <div style={{ flex:1,height:4,background:"var(--card-border)",borderRadius:4,overflow:"hidden" }}>
                <div style={{ width:`${(xp/500)*100}%`,height:"100%",borderRadius:4,background:themeName === "halo" ? "linear-gradient(90deg, #FFB000, #4ADE80)" : "linear-gradient(90deg, #A78BFA, #6366F1, #818CF8)",transition:"width 0.8s" }} />
              </div>
              <span style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>{xp}/500 XP</span>
            </div>
          )}
        </div>
        <div className="today-date" style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)",textAlign:"right",flexShrink:0 }}>
          <div style={{ fontWeight:700,color:"var(--text)",fontSize:14 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <div style={{ fontSize:11 }}>Week {Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1.4fr",gap:14,marginBottom:24 }}>
        <Glass onClick={() => setPage("allTasks")} hover style={{ padding:18,display:"flex",alignItems:"center",gap:14,cursor:"pointer" }}>
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
          {(() => { const today = new Date().toISOString().split("T")[0]; const dow = new Date().getDay(); const todayHabits = habits.filter(h => { const days = h.scheduleDays || (h.frequency === "daily" ? [0,1,2,3,4,5,6] : [1]); return days.includes(dow); }); const done = todayHabits.filter(h => h.completions.includes(today)).length; const total = todayHabits.length; return (<>
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
        <Glass onClick={() => setPage("habits")} hover style={{ padding:18,display:"flex",alignItems:"center",gap:12,cursor:"pointer" }}>
          <span style={{ fontSize:32, color:"var(--danger)", display:"flex", alignItems:"center", justifyContent:"center" }}><Flame size={32} /></span>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:22,fontWeight:800,color:"var(--text)" }}>{streak}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>day streak</div>
          </div>
        </Glass>
        <div onClick={() => { setTimerTaskId(null); setPage("timer"); }} style={{
          background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",borderRadius:16,padding:"20px 28px",
          display:"flex",alignItems:"center",justifyContent:"center",gap:14,cursor:"pointer",color:themeName === "halo" ? "#0A120E" : "#fff",
          boxShadow:themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)",transition:"all 0.25s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 8px 32px rgba(74,222,128,0.4)" : "0 8px 32px rgba(99,102,241,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)"; }}
        >
          <div style={{ width:48,height:48,borderRadius:14,background:themeName === "halo" ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}><Play fill="currentColor" size={22} /></div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:themeName === "halo" ? "#0A120E" : "#fff" }}>Start Focus</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:11,color:themeName === "halo" ? "rgba(10,18,14,0.6)" : "rgba(255,255,255,0.7)" }}>{timerActive ? fmt(timeLeft) : "25:00"}</div>
          </div>
        </div>
      </div>

      {/* Schedule + sidebar */}
      <div className="today-layout" style={{ display:"flex",gap:22 }}>
        <div style={{ flex:1,minWidth:0 }}>
          {/* Overdue Tasks - prominent placement */}
          {(() => {
            const today = new Date().toISOString().split("T")[0];
            const overdue = tasks.filter(t => !t.done && t.dueDate && t.dueDate < today);
            return overdue.length > 0 ? (
              <Glass style={{ padding:"18px 18px 14px 18px",marginBottom:18,background:"rgba(239,68,68,0.04)",border:"2px solid rgba(239,68,68,0.25)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                  <AlertTriangle size={16} color="#EF4444" style={{ animation:"pulse 2s ease-in-out infinite" }} />
                  <h3 style={{ fontFamily:"var(--heading)",fontSize:14,color:"#EF4444",margin:0,fontWeight:700 }}>Overdue ({overdue.length})</h3>
                </div>
                <div style={{ maxHeight:200,overflowY:"auto",paddingRight:4 }}>
                  {overdue.map((task, i) => (
                    <TaskRow key={task.id} task={task} idx={i} />
                  ))}
                </div>
              </Glass>
            ) : null;
          })()}
          <TodaySchedule
            tasks={tasks}
            TaskRow={TaskRow}
            setNewTaskWs={setNewTaskWs}
            setShowNewTask={setShowNewTask}
            rewardText={rewardText}
          />
        </div>

        {/* Sidebar */}
        <div className="today-sidebar" style={{ width:280,flexShrink:0 }}>
          {/* Today's Habits */}
          <Glass style={{ padding:18,marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
              <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:0,fontWeight:700 }}>Today's Habits</h3>
              <span onClick={() => setPage("habits")} style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--primary)",cursor:"pointer",fontWeight:600 }}>View all</span>
            </div>
            {(() => { const today = new Date().toISOString().split("T")[0]; const dow = new Date().getDay(); return habits.filter(h => { const days = h.scheduleDays || (h.frequency === "daily" ? [0,1,2,3,4,5,6] : [1]); return days.includes(dow); }).map(h => {
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

          <Glass style={{ padding:18,marginBottom:14 }}>
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 10px",fontWeight:700 }}>Today's Intention</h3>
            {editingIntention ? (
              <div>
                <textarea value={intentionText} onChange={e => setIntentionText(e.target.value)} autoFocus
                  onBlur={async () => { setEditingIntention(false); flash("Intention saved!"); const userId = await getUserId(); if (userId) { const { error } = await supabase.from("profiles").update({ intention_text: intentionText }).eq("id", userId); if (error) logger.error("Failed to save intention:", error); } }}
                  onKeyDown={e => { if (e.key === "Escape") e.target.blur(); }}
                  style={{ ...inputStyle, minHeight:70,resize:"vertical",fontStyle:"italic" }} />
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",marginTop:6 }}>Press Escape or click away to save</div>
              </div>
            ) : (
              <div>
                <div style={{ background:"var(--input-bg)",borderRadius:10,padding:14,border:"1px dashed var(--border-light)",fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)",lineHeight:1.7,fontStyle:"italic" }}>"{intentionText}"</div>
                <div onClick={() => setEditingIntention(true)} style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--primary)",cursor:"pointer",marginTop:8,fontWeight:600 }}>Edit intention</div>
              </div>
            )}
          </Glass>
          <Glass style={{ padding:18,background:"linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.04))",border:"1px solid rgba(251,191,36,0.15)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:8 }}>
              <div style={{ position:"relative",width:36,height:36,flexShrink:0 }}>
                <Ring percent={totalTasks > 0 ? (doneTasks/totalTasks)*100 : 0} size={36} stroke={3} color="#FBBF24" />
                <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:8,fontWeight:700,color:"var(--text)" }}>{Math.round(totalTasks > 0 ? (doneTasks/totalTasks)*100 : 0)}%</div>
              </div>
              <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:0,fontWeight:700 }}>Today's Reward</h3>
            </div>
            {editingReward ? (
              <div>
                <input
                  value={rewardText}
                  onChange={e => setRewardText(e.target.value)}
                  placeholder="e.g. Movie night, ice cream, gaming..."
                  style={{ ...inputStyle, fontSize:12.5 }}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); e.target.blur(); } }}
                  onBlur={async () => { setEditingReward(false); flash("Reward saved!"); const userId = await getUserId(); if (userId) { const { error } = await supabase.from("profiles").update({ reward_text: rewardText }).eq("id", userId); if (error) logger.error("Failed to save reward:", error); } }}
                  autoFocus
                />
                <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",marginTop:6 }}>Press Enter or click away to save</div>
              </div>
            ) : (
              <div>
                {rewardText ? (
                  <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--text)" }}>Finish all tasks: <strong>{rewardText}</strong></div>
                ) : (
                  <div style={{ fontFamily:"var(--body)",fontSize:12.5,color:"var(--muted)",fontStyle:"italic" }}>Set a reward to motivate yourself</div>
                )}
                <div onClick={() => setEditingReward(true)} style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--primary)",cursor:"pointer",marginTop:8,fontWeight:600 }}>{rewardText ? "Edit reward" : "Set reward"}</div>
              </div>
            )}
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
