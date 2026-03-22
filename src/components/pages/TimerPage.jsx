import { Play, Pause, RotateCcw, SkipForward, Flame, Target, Sparkles, Coffee } from "lucide-react";
import { Ring, Glass } from "../ui";

export default function TimerPage({
  timerTask, ws, timeLeft, setTimeLeft, timerActive, setTimerActive,
  isBreak, setIsBreak, sessionCount, endTimeRef,
  WORK_DURATION, SHORT_BREAK, LONG_BREAK, CYCLE_LENGTH,
  fmt, goToday, flash, streak, themeName,
}) {
  const w = timerTask ? ws.find(x => x.id === timerTask.wsId) : null;
  const currentBreakDuration = (sessionCount + 1) % CYCLE_LENGTH === 0 ? LONG_BREAK : SHORT_BREAK;
  const pct = isBreak
    ? ((currentBreakDuration - timeLeft) / currentBreakDuration) * 100
    : ((WORK_DURATION - timeLeft) / WORK_DURATION) * 100;
  const nextSub = timerTask?.subtasks.find(s => !s.done);
  const isLongBreak = isBreak && timeLeft > SHORT_BREAK;
  const sessionInCycle = (sessionCount % CYCLE_LENGTH) + 1;

  const ringColor = isBreak ? "var(--success)" : (w?.color || "var(--primary)");
  const modeLabel = isBreak ? (isLongBreak ? "Long Break" : "Short Break") : "Deep Focus";
  const ModeIcon = isBreak ? Coffee : Target;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", textAlign: "center", position: "relative", padding: "24px 0",
    }}>
      {/* Exit link */}
      <div
        onClick={goToday}
        style={{
          position: "absolute", top: 0, left: 0,
          fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)",
          cursor: "pointer", fontWeight: 500,
          transition: "color 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
      >
        ← Exit Focus
      </div>

      {/* Mode badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 14px", borderRadius: 20,
        background: isBreak ? "var(--success-bg)" : "var(--primary-bg)",
        border: `1px solid ${isBreak ? "var(--success-bg)" : "var(--primary-bg)"}`,
        marginBottom: 28,
      }}>
        <ModeIcon size={13} color={isBreak ? "var(--success)" : "var(--primary)"} />
        <span style={{
          fontFamily: "var(--body)", fontSize: 12, fontWeight: 600,
          color: isBreak ? "var(--success)" : "var(--primary)",
          letterSpacing: 0.5, textTransform: "uppercase",
        }}>{modeLabel}</span>
      </div>

      {/* Timer ring */}
      <div style={{
        position: "relative", width: 260, height: 260, marginBottom: 32,
      }}>
        {/* Ambient glow behind ring when active */}
        {timerActive && (
          <div style={{
            position: "absolute", inset: 20,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${isBreak ? "var(--success-bg)" : "var(--primary-bg)"} 0%, transparent 70%)`,
            animation: "timer-pulse 3s ease-in-out infinite",
          }} />
        )}
        <Ring percent={pct} size={260} stroke={10} color={ringColor} glow={timerActive} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 54, fontWeight: 700,
            color: "var(--text)", letterSpacing: -2, lineHeight: 1,
          }}>
            {fmt(timeLeft)}
          </div>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)",
            marginTop: 6, letterSpacing: 0.5,
          }}>
            {isBreak ? "until next session" : "remaining"}
          </div>
        </div>
      </div>

      {/* Task info card */}
      {timerTask ? (
        <Glass style={{
          padding: "12px 24px", marginBottom: 24, maxWidth: 320, width: "100%",
        }}>
          <div style={{
            fontFamily: "var(--heading)", fontSize: 16, fontWeight: 700,
            color: "var(--text)", lineHeight: 1.3,
          }}>
            {timerTask.title}
          </div>
          {nextSub && (
            <div style={{
              fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)",
              marginTop: 6, display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ color: "var(--primary)", fontSize: 10 }}>▸</span>
              {nextSub.text}
            </div>
          )}
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)",
            marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            {timerTask.donePomos}/{timerTask.totalPomos} pomodoros
          </div>
        </Glass>
      ) : (
        <div style={{
          fontFamily: "var(--heading)", fontSize: 16, fontWeight: 600,
          color: "var(--muted)", marginBottom: 24,
        }}>
          Free Focus Session
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        {/* Play / Pause */}
        <button
          onClick={() => { if (timerActive) endTimeRef.current = null; setTimerActive(!timerActive); }}
          style={{
            width: 72, height: 72, borderRadius: 22, cursor: "pointer",
            background: timerActive
              ? "var(--primary-bg)"
              : "var(--accent-gradient)",
            border: timerActive ? "1px solid var(--primary-bg)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: timerActive ? "var(--primary)" : "#fff",
            boxShadow: timerActive ? "none" : "var(--hover-shadow)",
            transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
            transform: "scale(1)",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {timerActive ? <Pause fill="currentColor" size={26} /> : <Play fill="currentColor" size={26} />}
        </button>

        {/* Reset */}
        <ControlButton
          icon={<RotateCcw size={18} />}
          label="Reset"
          onClick={() => {
            setTimerActive(false); setIsBreak(false);
            setTimeLeft(WORK_DURATION); endTimeRef.current = null;
            flash("Timer reset");
          }}
        />

        {/* Skip */}
        <ControlButton
          icon={<SkipForward size={18} />}
          label="Skip"
          onClick={() => {
            setTimerActive(false); endTimeRef.current = null;
            if (!isBreak) {
              const nextBreakDuration = (sessionCount + 1) % CYCLE_LENGTH === 0 ? LONG_BREAK : SHORT_BREAK;
              setIsBreak(true); setTimeLeft(nextBreakDuration);
              flash("Skipped to break");
            } else {
              setIsBreak(false); setTimeLeft(WORK_DURATION);
              flash("Break skipped");
            }
          }}
        />
      </div>

      {/* Session progress + stats */}
      <div style={{
        display: "flex", alignItems: "center", gap: 24,
        position: "absolute", bottom: 0, left: 0, right: 0,
        justifyContent: "center",
      }}>
        {/* Session dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", marginRight: 4 }}>Sessions</span>
          {Array.from({ length: CYCLE_LENGTH }).map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: "50%",
              background: i < sessionInCycle - (isBreak ? 0 : 1)
                ? "var(--primary)"
                : "var(--card-border)",
              border: i === sessionInCycle - 1 && !isBreak
                ? "2px solid var(--primary)"
                : "2px solid transparent",
              transition: "all 0.3s",
              boxShadow: i < sessionInCycle - (isBreak ? 0 : 1)
                ? "var(--focus-shadow)"
                : "none",
            }} />
          ))}
        </div>

        <div style={{ width: 1, height: 16, background: "var(--card-border)" }} />

        {/* Streak */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Flame size={14} color="var(--danger)" />
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--danger)", fontWeight: 700 }}>{streak}</span>
        </div>

        <div style={{ width: 1, height: 16, background: "var(--card-border)" }} />

        {/* XP reward */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Sparkles size={13} color="var(--xp-color)" />
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--xp-color)", fontWeight: 600 }}>+15 XP</span>
        </div>
      </div>

      {/* Keyframe for pulse animation */}
      <style>{`
        @keyframes timer-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}

function ControlButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 56, height: 56, borderRadius: 18, cursor: "pointer",
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 2, color: "var(--text)",
        boxShadow: "var(--card-shadow-sm)",
        transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--hover-shadow)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--card-shadow-sm)";
      }}
    >
      {icon}
      <span style={{ fontFamily: "var(--body)", fontSize: 9, fontWeight: 600, color: "var(--muted)" }}>{label}</span>
    </button>
  );
}
