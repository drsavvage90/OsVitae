import { useRef, useState, useCallback, useEffect } from "react";
import { Flame, Check, Play, ChevronRight, Inbox as InboxIcon, GripVertical, X, Pencil } from "lucide-react";
import { Glass, Ring, Btn } from "../ui";
import { supabase } from "../../lib/supabase";
import { getUserId } from "../../lib/getUserId";
import { logger } from "../../lib/logger";

const HOUR_HEIGHT = 52;
const FIRST_HOUR = 6;
const LAST_HOUR = 22;
const SNAP = 0.25; // 15-minute snap increments

function snapHour(h) { return Math.round(h / SNAP) * SNAP; }
function clampHour(h, min = FIRST_HOUR, max = LAST_HOUR) { return Math.max(min, Math.min(max, h)); }
function formatTime(h) {
  const hr = Math.floor(h);
  const minVal = Math.round((h % 1) * 60);
  const min = minVal.toString().padStart(2, "0");
  if (hr === 0 || hr === 24) return `12:${min}`;
  if (hr > 12) return `${hr - 12}:${min}`;
  return `${hr}:${min}`;
}

function TodayCalendar({ timeBlocks, tasks, ws, projects, updateTimeBlock, setShowNewBlock, deleteTimeBlock, setEditingBlock, goTask, createTimeBlockFromTask }) {
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => i + FIRST_HOUR);
  const gridRef = useRef(null);

  // Auto-scroll to current hour on mount
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date().getHours();
      const scrollTo = Math.max(0, (now - FIRST_HOUR - 1) * HOUR_HEIGHT);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, []);

  // Current time indicator
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const showNowLine = currentHour >= FIRST_HOUR && currentHour <= LAST_HOUR;

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
        <h2 style={{ fontFamily:"var(--heading)",fontSize:19,color:"var(--text)",margin:0,fontWeight:700 }}>Today's Calendar</h2>
        <Btn small primary onClick={() => setShowNewBlock(true)}>+ Block</Btn>
      </div>
      <Glass style={{ padding:0,overflow:"hidden" }}>
        <div
          ref={(el) => { gridRef.current = el; scrollRef.current = el; }}
          style={{
            position:"relative",
            height: 480,
            overflowY:"auto",
          }}
          onDragOver={(e) => { e.preventDefault(); }}
        >
          <div style={{ position:"relative", height: hours.length * HOUR_HEIGHT }}>
            {hours.map((h, i) => (
              <div key={h} style={{ position:"absolute",top:i*HOUR_HEIGHT,left:0,right:0,height:HOUR_HEIGHT,borderBottom:"1px solid var(--subtle-bg)",display:"flex",alignItems:"flex-start" }}>
                <div style={{ width:44,padding:"6px 6px 0 0",textAlign:"right",fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",fontWeight:600,flexShrink:0 }}>
                  {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h-12} PM`}
                </div>
              </div>
            ))}

            {/* Current time indicator */}
            {showNowLine && (
              <div style={{
                position:"absolute",
                top: (currentHour - FIRST_HOUR) * HOUR_HEIGHT,
                left: 40,
                right: 0,
                height: 2,
                background: "#EF4444",
                zIndex: 40,
                pointerEvents: "none",
              }}>
                <div style={{ position:"absolute",left:-4,top:-3,width:8,height:8,borderRadius:"50%",background:"#EF4444" }} />
              </div>
            )}

            {timeBlocks.filter(b => b.date === new Date().toISOString().split("T")[0]).map(block => {
              const startHour = block.startHour;
              const endHour = block.endHour;
              const logicalHeight = (endHour - startHour) * HOUR_HEIGHT;
              const height = Math.max(logicalHeight, 38);
              const top = (startHour - FIRST_HOUR) * HOUR_HEIGHT;
              
              const task = block.taskId ? tasks?.find(t => t.id === block.taskId) : null;
              const w = task && ws ? ws.find(x => x.id === task.wsId) : null;
              const proj = task && projects ? projects.find(p => p.id === task.projectId) : null;
              const subtitle = [w?.name, proj?.name].filter(Boolean).join(" • ");

              return (
                <div
                  key={block.id}
                  style={{
                    position:"absolute",top:top+1,left:50,right:6,height:height-2,
                    background:`${block.color}14`,
                    border:`1px solid ${block.color}33`,
                    borderLeft:`3px solid ${block.color}`,
                    borderRadius:6,padding:"4px 8px",
                    overflow:"hidden",
                    zIndex: 1,
                  }}
                >
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <div style={{ display:"flex",flexDirection:"column",flex:1,minWidth:0 }}>
                      <div style={{ fontFamily:"var(--heading)",fontSize:11,fontWeight:700,color:block.color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                        {block.title}
                      </div>
                      {subtitle && (
                        <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--text)",opacity:0.8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2 }}>
                          {subtitle}
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex",gap:2,flexShrink:0,marginLeft:4 }}>
                      <div data-action="edit" role="button" onClick={(e) => { e.stopPropagation(); setEditingBlock(block); }} style={{ width:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",opacity:0.6,transition:"all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.color="var(--primary)"; e.currentTarget.style.opacity=1; e.currentTarget.style.background="var(--subtle-bg)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.opacity=0.6; e.currentTarget.style.background="transparent"; }}
                      ><Pencil size={12}/></div>
                      <div data-action="delete" role="button" onClick={(e) => { e.stopPropagation(); deleteTimeBlock(block.id); }} style={{ width:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",opacity:0.6,transition:"all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.opacity=1; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.opacity=0.6; e.currentTarget.style.background="transparent"; }}
                      ><X size={12}/></div>
                    </div>
                  </div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",marginTop:2 }}>
                    {formatTime(startHour)} – {formatTime(endHour)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Glass>
    </div>
  );
}

export default function TodayPage({
  greeting, totalTasks, doneTasks, totalPomos, donePomos, habits, toggleHabit, streak, themeName,
  timerActive, timeLeft, fmt, setTimerTaskId, setPage, tasks, ws, projects, goTask, TaskRow, inbox,
  intentionText, setIntentionText, editingIntention, setEditingIntention,
  setNewTaskWs, setShowNewTask, flash, inputStyle,
  timeBlocks, updateTimeBlock, setShowNewBlock, deleteTimeBlock, setEditingBlock,
  rewardText, setRewardText, editingReward, setEditingReward,
  createTimeBlockFromTask,
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
          background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",borderRadius:16,padding:20,
          display:"flex",alignItems:"center",justifyContent:"center",gap:14,cursor:"pointer",color:themeName === "halo" ? "#0A120E" : "#fff",
          boxShadow:themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)",transition:"all 0.25s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 8px 32px rgba(74,222,128,0.4)" : "0 8px 32px rgba(99,102,241,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=themeName === "halo" ? "0 4px 24px rgba(74,222,128,0.3)" : "0 4px 24px rgba(99,102,241,0.35)"; }}
        >
          <div style={{ width:44,height:44,borderRadius:14,background:themeName === "halo" ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}><Play fill="currentColor" size={20} /></div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:themeName === "halo" ? "#0A120E" : "#fff" }}>Start Focus</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:11,color:themeName === "halo" ? "rgba(10,18,14,0.6)" : "rgba(255,255,255,0.7)" }}>{timerActive ? fmt(timeLeft) : "25:00"}</div>
          </div>
        </div>
      </div>

      {/* Calendar + sidebar */}
      <div className="today-layout" style={{ display:"flex",gap:22 }}>
        <div style={{ flex:1,minWidth:0 }}>
          <TodayCalendar
            timeBlocks={timeBlocks}
            tasks={tasks}
            ws={ws}
            projects={projects}
            updateTimeBlock={updateTimeBlock}
            setShowNewBlock={setShowNewBlock}
            deleteTimeBlock={deleteTimeBlock}
            setEditingBlock={setEditingBlock}
            goTask={goTask}
            createTimeBlockFromTask={createTimeBlockFromTask}
          />
        </div>

        {/* Sidebar */}
        <div className="today-sidebar" style={{ width:280,flexShrink:0 }}>
          {/* Today's Tasks */}
          <Glass style={{ padding:"18px 18px 14px 18px",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
              <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:0,fontWeight:700 }}>Today's Tasks</h3>
              <Btn small primary onClick={() => { setNewTaskWs(null); setShowNewTask(true); }}>+ Add</Btn>
            </div>
            <div style={{ maxHeight: 350, overflowY: "auto", paddingRight: 4, paddingBottom: 4 }}>
              {tasks.filter(t => !t.done).length === 0 && (
                <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",padding:"8px 0",textAlign:"center" }}>All done for today!</div>
              )}
              {tasks.filter(t => !t.done).map((task, i) => (
                <TaskRow key={task.id} task={task} idx={i} />
              ))}
              {tasks.filter(t => t.done).length > 0 && (
                <div style={{ marginTop:10,paddingTop:8,borderTop:"1px solid var(--subtle-bg)" }}>
                  <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",fontWeight:600,marginBottom:6,textTransform:"uppercase" }}>Completed</div>
                  {tasks.filter(t => t.done).map((task, i) => (
                    <TaskRow key={task.id} task={task} idx={i} />
                  ))}
                </div>
              )}
            </div>
          </Glass>

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
            <h3 style={{ fontFamily:"var(--heading)",fontSize:13,color:"var(--text)",margin:"0 0 8px",fontWeight:700 }}>Today's Reward</h3>
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
