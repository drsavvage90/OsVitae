import { Flame, Check, Play, ChevronRight, Inbox as InboxIcon, Sun, Sunset, Moon, AlertTriangle, Trophy, Plus } from "lucide-react";
import { Glass, Ring, Btn } from "../ui";
import { supabase } from "../../lib/supabase";
import { getUserId } from "../../lib/getUserId";
import { logger } from "../../lib/logger";
import { sectionHeader } from "../../lib/styles";

function SprintBanner({ activeSprint, sprintTasks }) {
  if (!activeSprint) return null;

  const doneTasks = sprintTasks.filter(t => t.done || t.status === "done");
  const totalSP = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const doneSP = doneTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const pct = totalSP > 0
    ? Math.round((doneSP / totalSP) * 100)
    : sprintTasks.length > 0 ? Math.round((doneTasks.length / sprintTasks.length) * 100) : 0;

  const now = new Date();
  const start = new Date(activeSprint.startDate);
  const end = new Date(activeSprint.endDate);
  const currentDay = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

  const overdue = now > end;
  const expectedPct = Math.min(100, Math.round((currentDay / totalDays) * 100));
  const status = overdue ? "overdue" : pct < expectedPct - 15 ? "at-risk" : "on-track";
  const statusColors = { "on-track": "#22C55E", "at-risk": "#F59E0B", overdue: "#EF4444" };
  const statusLabel = { "on-track": "On Track", "at-risk": "At Risk", overdue: "Overdue" };

  return (
    <Glass style={{ padding: "16px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 20 }}>
      {/* Left: name + goal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...sectionHeader, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activeSprint.name}</div>
        {activeSprint.goal && <div style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activeSprint.goal}</div>}
      </div>

      {/* Center: ring */}
      <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
        <Ring percent={pct} size={44} stroke={4} color="#22C55E" />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: "var(--text)" }}>{pct}%</div>
      </div>

      {/* Right: day counter + status */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--heading)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Day {currentDay} of {totalDays}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{daysLeft} day{daysLeft !== 1 ? "s" : ""} left</div>
        <span style={{
          display: "inline-block", marginTop: 4, fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
          color: statusColors[status], background: `${statusColors[status]}18`,
          padding: "2px 8px", borderRadius: 6, textTransform: "uppercase",
        }}>{statusLabel[status]}</span>
      </div>
    </Glass>
  );
}

const SECTIONS = [
  { key: "morning", label: "Morning", icon: Sun, color: "#FBBF24" },
  { key: "afternoon", label: "Afternoon", icon: Sunset, color: "#F97316" },
  { key: "evening", label: "Evening", icon: Moon, color: "#8B5CF6" },
];

function TodaySchedule({ tasks, TaskRow, setNewTaskWs, setShowNewTask, rewardText }) {
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.dueDate === today);
  const allDone = todayTasks.length > 0 && todayTasks.every(t => t.done);
  const hasTasks = todayTasks.length > 0;
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
        {hasTasks && <Btn primary small onClick={() => { setNewTaskWs(null); setShowNewTask(true); }}>+ Task</Btn>}
      </div>

      {!hasTasks ? (
        <Glass style={{ padding:"40px 24px",textAlign:"center",border:"1.5px dashed var(--border)" }}>
          <div style={{ fontFamily:"var(--heading)",fontSize:16,fontWeight:700,color:"var(--text)",marginBottom:6 }}>No tasks scheduled</div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:16 }}>Add a task to get your day started</div>
          <Btn primary onClick={() => { setNewTaskWs(null); setShowNewTask(true); }}>
            <span style={{ display:"flex",alignItems:"center",gap:4 }}><Plus size={14} /> Add task</span>
          </Btn>
        </Glass>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {SECTIONS.map(({ key, label, icon: Icon, color }) => {
            const undone = todayTasks.filter(t => (t.section || "morning") === key && !t.done);
            const isActive = key === activeSection;

            if (undone.length === 0) {
              return (
                <div key={key} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"8px 14px",
                  borderRadius:10,
                  background: isActive ? `${color}08` : "transparent",
                  border: isActive ? `1px solid ${color}20` : "1px solid transparent",
                }}>
                  <div style={{
                    width:24,height:24,borderRadius:6,
                    background:`${color}15`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>
                    <Icon size={12} color={color} />
                  </div>
                  <span style={{ fontFamily:"var(--heading)",fontSize:12,fontWeight:600,color:"var(--muted)" }}>{label}</span>
                  {isActive && (
                    <div style={{ fontFamily:"var(--mono)",fontSize:8,color,fontWeight:700,background:`${color}15`,padding:"2px 6px",borderRadius:4,textTransform:"uppercase" }}>Now</div>
                  )}
                  <Check size={12} color="var(--muted)" style={{ marginLeft:"auto",opacity:0.5 }} />
                </div>
              );
            }

            return (
              <Glass key={key} style={{
                padding:"16px 18px",
                border: isActive ? `1.5px solid ${color}33` : undefined,
                background: isActive ? `${color}06` : undefined,
              }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
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
                {undone.map((task, i) => (
                  <TaskRow key={task.id} task={task} idx={i} />
                ))}
              </Glass>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TodayPage({
  greeting, totalTasks, doneTasks, totalPomos, donePomos, habits, toggleHabit, streak, themeName,
  timerActive, timeLeft, fmt, setTimerTaskId, setPage, tasks, TaskRow, inbox,
  intentionText, setIntentionText, editingIntention, setEditingIntention,
  setNewTaskWs, setShowNewTask, flash, inputStyle,
  rewardText, setRewardText, editingReward, setEditingReward,
  xp, level, sprints,
}) {
  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const today = new Date().toISOString().split("T")[0];
  const dow = new Date().getDay();
  const todayHabits = habits.filter(h => {
    const days = h.scheduleDays || (h.frequency === "daily" ? [0,1,2,3,4,5,6] : [1]);
    return days.includes(dow);
  });
  const habitsDone = todayHabits.filter(h => h.completions.includes(today)).length;
  const habitsTotal = todayHabits.length;

  return (
    <div>
      {/* Header: greeting + intention inline + date/XP pill */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap" }}>
        <div style={{ flex:1,minWidth:0 }}>
          <h1 className="today-heading" style={{ fontFamily:"var(--heading)",fontSize:32,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-1 }}>{greeting}</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:15,color:"var(--muted)",margin:"6px 0 0" }}>
            <strong style={{ color:"var(--text)" }}>{totalTasks - doneTasks} tasks</strong> and <strong style={{ color:"var(--text)" }}>{totalPomos - donePomos} pomodoros</strong> on your plate
          </p>
          {/* Inline intention */}
          {editingIntention ? (
            <div style={{ marginTop:8,maxWidth:420 }}>
              <input
                value={intentionText}
                onChange={e => setIntentionText(e.target.value)}
                placeholder="What's your focus today?"
                autoFocus
                onBlur={async () => {
                  setEditingIntention(false);
                  flash("Intention saved!");
                  const userId = await getUserId();
                  if (userId) {
                    const { error } = await supabase.from("profiles").update({ intention_text: intentionText }).eq("id", userId);
                    if (error) logger.error("Failed to save intention:", error);
                  }
                }}
                onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") e.target.blur(); }}
                style={{ ...inputStyle, fontSize:13,fontStyle:"italic",padding:"6px 12px",borderRadius:8 }}
              />
            </div>
          ) : (
            <div
              onClick={() => setEditingIntention(true)}
              style={{ marginTop:6,fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",fontStyle:"italic",cursor:"pointer",opacity:0.7,transition:"opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
            >
              {intentionText ? `"${intentionText}"` : "Set today's intention..."}
            </div>
          )}
        </div>
        <div className="today-date" style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)",textAlign:"right",flexShrink:0 }}>
          <div style={{ fontWeight:700,color:"var(--text)",fontSize:14 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <div style={{ display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end",marginTop:3 }}>
            <span style={{ fontSize:11 }}>Week {Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}</span>
            {level != null && (
              <>
                <span style={{ color:"var(--border)",fontSize:10 }}>·</span>
                <span style={{ fontSize:10,color:"var(--xp-color, var(--primary))",fontWeight:700 }}>LVL {level}</span>
                <div style={{ width:48,height:3,background:"var(--card-border)",borderRadius:3,overflow:"hidden" }}>
                  <div style={{ width:`${(xp/500)*100}%`,height:"100%",borderRadius:3,background:themeName === "halo" ? "linear-gradient(90deg, #FFB000, #4ADE80)" : "linear-gradient(90deg, #A78BFA, #6366F1)",transition:"width 0.8s" }} />
                </div>
                <span style={{ fontSize:9,color:"var(--muted)" }}>{xp}/{500}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Consolidated stats: Tasks + Habits + Streak in one card, Focus CTA separate */}
      <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr auto",gap:14,marginBottom:24 }}>
        <Glass hover style={{ padding:"14px 20px",display:"flex",alignItems:"center",gap:0 }}>
          {/* Tasks */}
          <div onClick={() => setPage("allTasks")} style={{ display:"flex",alignItems:"center",gap:12,cursor:"pointer",flex:1,paddingRight:16 }}>
            <div style={{ position:"relative",width:40,height:40,flexShrink:0 }}>
              <Ring percent={taskPct} size={40} stroke={3.5} color="#22C55E" />
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:10,fontWeight:700,color:"var(--text)" }}>{doneTasks}/{totalTasks}</div>
            </div>
            <div>
              <div style={{ fontFamily:"var(--heading)",fontSize:12,fontWeight:700,color:"var(--text)" }}>Tasks</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>{totalTasks > 0 ? `${taskPct}% done` : "No tasks"}</div>
            </div>
          </div>
          {/* Divider */}
          <div style={{ width:1,height:28,background:"var(--card-border)",flexShrink:0 }} />
          {/* Habits */}
          <div onClick={() => setPage("habits")} style={{ display:"flex",alignItems:"center",gap:12,cursor:"pointer",flex:1,padding:"0 16px" }}>
            <div style={{ position:"relative",width:40,height:40,flexShrink:0 }}>
              <Ring percent={habitsTotal > 0 ? (habitsDone/habitsTotal)*100 : 0} size={40} stroke={3.5} color="#22C55E" />
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:10,fontWeight:700,color:"var(--text)" }}>{habitsDone}/{habitsTotal}</div>
            </div>
            <div>
              <div style={{ fontFamily:"var(--heading)",fontSize:12,fontWeight:700,color:"var(--text)" }}>Habits</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>{habitsTotal - habitsDone > 0 ? `${habitsTotal - habitsDone} left` : habitsTotal > 0 ? "All done!" : "None today"}</div>
            </div>
          </div>
          {/* Divider */}
          <div style={{ width:1,height:28,background:"var(--card-border)",flexShrink:0 }} />
          {/* Streak */}
          <div onClick={() => setPage("habits")} style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",paddingLeft:16 }}>
            <Flame size={22} color="var(--danger)" />
            <div>
              <div style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:800,color:"var(--text)",lineHeight:1 }}>{streak}</div>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>streak</div>
            </div>
          </div>
        </Glass>

        {/* Focus CTA */}
        <div onClick={() => { setTimerTaskId(null); setPage("timer"); }} style={{
          background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",borderRadius:16,padding:"14px 24px",
          display:"flex",alignItems:"center",gap:12,cursor:"pointer",color:themeName === "halo" ? "#0A120E" : "#fff",
          boxShadow:themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)",transition:"all 0.25s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 8px 32px rgba(74,222,128,0.4)" : "0 8px 32px rgba(99,102,241,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)"; }}
        >
          <div style={{ width:40,height:40,borderRadius:12,background:themeName === "halo" ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center" }}><Play fill="currentColor" size={18} /></div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700 }}>Focus</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:11,opacity:0.7 }}>{timerActive ? fmt(timeLeft) : "25:00"}</div>
          </div>
        </div>
      </div>

      {/* Sprint banner */}
      {(() => {
        const activeSprint = (sprints || []).find(s => s.status === "active");
        const sprintTasks = activeSprint ? tasks.filter(t => t.sprint_id === activeSprint.id) : [];
        return <SprintBanner activeSprint={activeSprint} sprintTasks={sprintTasks} />;
      })()}

      {/* Schedule + sidebar */}
      <div className="today-layout" style={{ display:"flex",gap:22 }}>
        <div style={{ flex:1,minWidth:0 }}>
          {/* Overdue Tasks */}
          {(() => {
            const todayStr = new Date().toISOString().split("T")[0];
            const overdue = tasks.filter(t => !t.done && t.dueDate && t.dueDate < todayStr);
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
          {/* Today's Habits - stretches to fill */}
          <Glass style={{ padding:18,marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
              <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:0,fontWeight:700 }}>Today's Habits</h3>
              <span onClick={() => setPage("habits")} style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--primary)",cursor:"pointer",fontWeight:600 }}>View all</span>
            </div>
            {todayHabits.length === 0 ? (
              <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",textAlign:"center",padding:"12px 0" }}>No habits scheduled today</div>
            ) : todayHabits.map(h => {
              const done = h.completions.includes(today);
              return (
                <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 0",cursor:"pointer",borderBottom:"1px solid var(--subtle-bg)" }}>
                  <div style={{ width:18,height:18,borderRadius:6,background:done?h.color:"transparent",border:done?"none":`1.5px solid var(--checkbox-border)`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0 }}>{done && <Check size={10} color="#fff" />}</div>
                  <span style={{ fontFamily:"var(--body)",fontSize:12,color:done?"var(--muted)":"var(--text)",textDecoration:done?"line-through":"none",flex:1 }}>{h.name}</span>
                  <div style={{ display:"flex",alignItems:"center",gap:3 }}><Flame size={10} color={h.color} /><span style={{ fontFamily:"var(--mono)",fontSize:9,color:h.color,fontWeight:700 }}>{h.streak}</span></div>
                </div>
              );
            })}
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

          {/* Reward - only shown when user has set one */}
          {rewardText && (
            <Glass style={{ padding:16,background:"linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.04))",border:"1px solid rgba(251,191,36,0.15)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                <div style={{ position:"relative",width:32,height:32,flexShrink:0 }}>
                  <Ring percent={taskPct} size={32} stroke={3} color="#FBBF24" />
                  <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:8,fontWeight:700,color:"var(--text)" }}>{taskPct}%</div>
                </div>
                <div>
                  <div style={{ fontFamily:"var(--heading)",fontSize:12,color:"var(--text)",fontWeight:700 }}>Today's Reward</div>
                  <div style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--text)" }}>{rewardText}</div>
                </div>
              </div>
              {editingReward ? (
                <div>
                  <input
                    value={rewardText}
                    onChange={e => setRewardText(e.target.value)}
                    placeholder="e.g. Movie night, ice cream, gaming..."
                    style={{ ...inputStyle, fontSize:12 }}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); e.target.blur(); } }}
                    onBlur={async () => { setEditingReward(false); flash("Reward saved!"); const userId = await getUserId(); if (userId) { const { error } = await supabase.from("profiles").update({ reward_text: rewardText }).eq("id", userId); if (error) logger.error("Failed to save reward:", error); } }}
                    autoFocus
                  />
                </div>
              ) : (
                <div onClick={() => setEditingReward(true)} style={{ fontFamily:"var(--body)",fontSize:10,color:"var(--primary)",cursor:"pointer",fontWeight:600 }}>Edit reward</div>
              )}
              <div style={{ marginTop:8,height:4,background:"var(--card-border)",borderRadius:4,overflow:"hidden" }}>
                <div style={{ width:`${taskPct}%`,height:"100%",borderRadius:4,background:"linear-gradient(90deg, #FBBF24, #F59E0B)",transition:"width 0.5s" }} />
              </div>
            </Glass>
          )}
        </div>
      </div>
    </div>
  );
}
