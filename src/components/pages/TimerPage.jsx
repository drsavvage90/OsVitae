import { Play, Pause, RotateCcw, SkipForward, Flame } from "lucide-react";
import { Ring } from "../ui";

export default function TimerPage({
  timerTask, ws, timeLeft, setTimeLeft, timerActive, setTimerActive,
  isBreak, setIsBreak, sessionCount, endTimeRef,
  WORK_DURATION, SHORT_BREAK, LONG_BREAK, CYCLE_LENGTH,
  fmt, goToday, flash, streak, themeName,
}) {
  const w = timerTask ? ws.find(x => x.id === timerTask.wsId) : null;
  const currentBreakDuration = (sessionCount + 1) % CYCLE_LENGTH === 0 ? LONG_BREAK : SHORT_BREAK;
  const pct = isBreak ? ((currentBreakDuration - timeLeft)/currentBreakDuration)*100 : ((WORK_DURATION - timeLeft)/WORK_DURATION)*100;
  const nextSub = timerTask?.subtasks.find(s => !s.done);
  const isLongBreak = isBreak && timeLeft > SHORT_BREAK;
  const sessionInCycle = (sessionCount % CYCLE_LENGTH) + 1;
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center",position:"relative" }}>
      <div onClick={goToday} style={{ position:"absolute",top:0,left:0,fontFamily:"var(--body)",fontSize:13,color:"var(--primary)",cursor:"pointer",fontWeight:600 }}>← Exit Focus</div>

      <div style={{ position:"relative",width:240,height:240,marginBottom:30 }}>
        <Ring percent={pct} size={240} stroke={12} color={isBreak ? "#22C55E" : (w?.color || "#5B8DEF")} />
        <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
          <div style={{ fontFamily:"var(--mono)",fontSize:56,fontWeight:700,color:"var(--text)",letterSpacing:-3 }}>{fmt(timeLeft)}</div>
          <div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)" }}>{isBreak ? (isLongBreak ? "Long Break" : "Short Break") : "Deep Focus"}</div>
        </div>
      </div>

      {timerTask && (
        <div style={{ marginBottom:6 }}>
          <div style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:700,color:"var(--text)" }}>{timerTask.title}</div>
          {nextSub && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginTop:4 }}>Current step: {nextSub.text}</div>}
        </div>
      )}
      {!timerTask && <div style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:700,color:"var(--text)",marginBottom:6 }}>Free Focus Session</div>}

      <div style={{ display:"flex",gap:12,marginTop:20 }}>
        <div onClick={() => { if (timerActive) endTimeRef.current = null; setTimerActive(!timerActive); }} style={{
          width:64,height:64,borderRadius:18,cursor:"pointer",
          background: timerActive ? "rgba(99,102,241,0.12)" : (themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #22C55E)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)"),
          backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
          color: timerActive ? "var(--primary)" : "#fff",
          border: timerActive ? "1px solid rgba(99,102,241,0.2)" : "none",
          boxShadow: timerActive ? "none" : "0 4px 20px rgba(99,102,241,0.3)",
          transition:"all 0.2s",
        }}>{timerActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}</div>
        <div onClick={() => { setTimerActive(false); setIsBreak(false); setTimeLeft(WORK_DURATION); endTimeRef.current = null; flash("Timer reset"); }} style={{
          width:64,height:64,borderRadius:18,background:"rgba(255,255,255,0.5)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.6)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",color:"var(--text)",
          boxShadow:"inset 0 1px 0 rgba(255,255,255,0.6)",
        }}><RotateCcw size={20} /></div>
        <div onClick={() => { setTimerActive(false); endTimeRef.current = null; if(!isBreak){ const nextBreakDuration = (sessionCount + 1) % CYCLE_LENGTH === 0 ? LONG_BREAK : SHORT_BREAK; setIsBreak(true); setTimeLeft(nextBreakDuration); flash("Skipped to break"); } else { setIsBreak(false); setTimeLeft(WORK_DURATION); flash("Break skipped"); } }} style={{
          width:64,height:64,borderRadius:18,background:"rgba(255,255,255,0.5)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.6)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",color:"var(--text)",
          boxShadow:"inset 0 1px 0 rgba(255,255,255,0.6)",
        }}><SkipForward size={20} /></div>
      </div>

      <div style={{ position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>
          {timerTask ? `${timerTask.donePomos}/${timerTask.totalPomos} pomodoros` : "Free session"} · Session {sessionInCycle} of {CYCLE_LENGTH} · +15 XP
        </span>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          <span style={{ display: "flex" }}><Flame size={14} color="#EF4444" /></span>
          <span style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--danger)",fontWeight:700 }}>{streak}</span>
        </div>
      </div>
    </div>
  );
}
