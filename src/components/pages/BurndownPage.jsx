import { useState } from "react";
import { Glass, Btn } from "../ui";

// ─── HELPERS ──────────────────────────────────────
function daysBetween(a, b) {
  return Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

function sprintDays(sprint) {
  const start = new Date(sprint.startDate);
  const total = Math.max(1, daysBetween(sprint.startDate, sprint.endDate));
  const days = [];
  for (let i = 0; i <= total; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function formatDay(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ─── BURNDOWN CHART ───────────────────────────────
function BurndownChart({ sprint, sprintTasks }) {
  const days = sprintDays(sprint);
  const totalSP = sprintTasks.reduce((s, t) => s + (t.storyPoints || 1), 0);

  // Build actual burndown: for each day, how many SP remain (tasks not done by that day)
  const actualPoints = days.map(day => {
    const remaining = sprintTasks.reduce((s, t) => {
      const sp = t.storyPoints || 1;
      // Task is "done by this day" if it has an updatedAt <= end of that day and is done
      if (t.done && t.updatedAt && t.updatedAt.split("T")[0] <= day) return s;
      if (t.done && !t.updatedAt) return s; // done but no date — count as done
      return s + sp;
    }, 0);
    return remaining;
  });

  // Ideal burndown: straight line from totalSP to 0
  const idealPoints = days.map((_, i) => Math.round(totalSP * (1 - i / (days.length - 1))));

  // SVG dimensions
  const W = 600, H = 280, PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const maxY = Math.max(totalSP, 1);

  const toX = (i) => PAD_L + (i / (days.length - 1)) * chartW;
  const toY = (v) => PAD_T + (1 - v / maxY) * chartH;

  const idealLine = idealPoints.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const actualLine = actualPoints.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  // Y-axis ticks
  const yTicks = [];
  const step = maxY <= 5 ? 1 : maxY <= 20 ? 5 : 10;
  for (let v = 0; v <= maxY; v += step) yTicks.push(v);
  if (yTicks[yTicks.length - 1] !== maxY) yTicks.push(maxY);

  // X-axis labels (show every N days to avoid crowding)
  const labelEvery = days.length <= 10 ? 1 : days.length <= 20 ? 2 : 3;

  return (
    <Glass style={{ padding: 20, marginBottom: 20 }}>
      <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 16px" }}>Burndown Chart</h3>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {/* Grid lines */}
        {yTicks.map(v => (
          <line key={v} x1={PAD_L} x2={W - PAD_R} y1={toY(v)} y2={toY(v)} stroke="var(--card-border)" strokeWidth={1} />
        ))}

        {/* Y-axis labels */}
        {yTicks.map(v => (
          <text key={v} x={PAD_L - 8} y={toY(v) + 4} textAnchor="end" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }}>{v}</text>
        ))}

        {/* X-axis labels */}
        {days.map((d, i) => i % labelEvery === 0 ? (
          <text key={d} x={toX(i)} y={H - 8} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--muted)" }}>{formatDay(d)}</text>
        ) : null)}

        {/* Ideal line */}
        <polyline points={idealLine} fill="none" stroke="var(--muted)" strokeWidth={2} strokeDasharray="6,4" opacity={0.5} />

        {/* Actual line */}
        <polyline points={actualLine} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots on actual line */}
        {actualPoints.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="var(--primary)" />
        ))}

        {/* Today marker */}
        {(() => {
          const today = new Date().toISOString().split("T")[0];
          const idx = days.indexOf(today);
          if (idx >= 0) {
            return <line x1={toX(idx)} x2={toX(idx)} y1={PAD_T} y2={PAD_T + chartH} stroke="var(--primary)" strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />;
          }
          return null;
        })()}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 8, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 2, background: "var(--muted)", opacity: 0.5 }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>Ideal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 2.5, background: "var(--primary)", borderRadius: 2 }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>Actual</span>
        </div>
      </div>
    </Glass>
  );
}

// ─── VELOCITY CHART ───────────────────────────────
function VelocityChart({ sprints, tasks }) {
  const closed = sprints
    .filter(s => s.status === "closed")
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
    .slice(-6);

  if (closed.length === 0) {
    return (
      <Glass style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>Velocity Chart</h3>
        <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)", textAlign: "center", padding: 20 }}>No closed sprints yet. Complete a sprint to see velocity trends.</div>
      </Glass>
    );
  }

  const velocities = closed.map(s => {
    const sprintTasks = tasks.filter(t => t.sprint_id === s.id && (t.done || t.status === "done"));
    return { name: s.name, sp: sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0) };
  });

  const maxV = Math.max(...velocities.map(v => v.sp), 1);
  const avgV = velocities.reduce((s, v) => s + v.sp, 0) / velocities.length;

  const W = 600, H = 220, PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 50;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const barW = Math.min(60, chartW / velocities.length - 12);

  return (
    <Glass style={{ padding: 20, marginBottom: 20 }}>
      <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 16px" }}>Velocity Chart</h3>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {/* Average line */}
        {(() => {
          const y = PAD_T + (1 - avgV / maxV) * chartH;
          return (
            <>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="6,4" />
              <text x={W - PAD_R + 2} y={y + 4} style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "#F59E0B" }}>avg {Math.round(avgV)}</text>
            </>
          );
        })()}

        {/* Bars */}
        {velocities.map((v, i) => {
          const barH = v.sp > 0 ? (v.sp / maxV) * chartH : 0;
          const x = PAD_L + (i + 0.5) * (chartW / velocities.length) - barW / 2;
          const y = PAD_T + chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill="var(--primary)" opacity={0.85} />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--text)", fontWeight: 700 }}>{v.sp}</text>
              <text x={x + barW / 2} y={PAD_T + chartH + 16} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--muted)" }}>{v.name.length > 10 ? v.name.slice(0, 10) + "…" : v.name}</text>
            </g>
          );
        })}

        {/* Baseline */}
        <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + chartH} y2={PAD_T + chartH} stroke="var(--card-border)" strokeWidth={1} />
      </svg>
    </Glass>
  );
}

// ─── CYCLE TIME ───────────────────────────────────
function CycleTimeSection({ sprintTasks }) {
  const doneTasks = sprintTasks.filter(t => t.done && t.createdAt && t.updatedAt);

  if (doneTasks.length === 0) {
    return (
      <Glass style={{ padding: 20 }}>
        <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>Cycle Time</h3>
        <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)", textAlign: "center", padding: 12 }}>No completed tasks with timestamps to measure cycle time.</div>
      </Glass>
    );
  }

  const cycleTimes = doneTasks.map(t => {
    const days = Math.max(1, Math.ceil((new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60 * 24)));
    return days;
  });

  const min = Math.min(...cycleTimes);
  const max = Math.max(...cycleTimes);
  const avg = Math.round(cycleTimes.reduce((s, v) => s + v, 0) / cycleTimes.length * 10) / 10;

  const stats = [
    { label: "Min", value: `${min}d`, color: "#22C55E" },
    { label: "Average", value: `${avg}d`, color: "var(--primary)" },
    { label: "Max", value: `${max}d`, color: "#EF4444" },
    { label: "Tasks Measured", value: doneTasks.length, color: "var(--muted)" },
  ];

  return (
    <Glass style={{ padding: 20 }}>
      <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 16px" }}>Cycle Time</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Glass>
  );
}

// ─── MAIN PAGE ────────────────────────────────────
export default function BurndownPage({ sprints, tasks }) {
  const activeSprints = (sprints || []).filter(s => s.status === "active");
  const allSprints = sprints || [];
  const [selectedSprintId, setSelectedSprintId] = useState(activeSprints[0]?.id || allSprints[0]?.id || null);

  const selectedSprint = allSprints.find(s => s.id === selectedSprintId) || null;

  if (!selectedSprint) {
    return (
      <div>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: "0 0 4px", fontWeight: 800 }}>Burndown & Velocity</h1>
        <Glass style={{ padding: 32, textAlign: "center", marginTop: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No sprints yet</div>
          <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)" }}>Create a sprint to start tracking burndown and velocity.</div>
        </Glass>
      </div>
    );
  }

  const sprintTasks = tasks.filter(t => t.sprint_id === selectedSprintId);

  return (
    <div>
      {/* Header + sprint selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: 0, fontWeight: 800 }}>Burndown & Velocity</h1>
        {allSprints.length > 1 ? (
          <select
            value={selectedSprintId}
            onChange={e => setSelectedSprintId(e.target.value)}
            style={{
              fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: "var(--text)",
              background: "var(--card-bg)", border: "1.5px solid var(--card-border)",
              borderRadius: 8, padding: "6px 12px", cursor: "pointer", outline: "none",
            }}
          >
            {allSprints.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
            ))}
          </select>
        ) : (
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--primary)", fontWeight: 600, background: "var(--primary-bg)", padding: "4px 12px", borderRadius: 8 }}>
            {selectedSprint.name}
          </span>
        )}
      </div>

      <BurndownChart sprint={selectedSprint} sprintTasks={sprintTasks} />
      <VelocityChart sprints={allSprints} tasks={tasks} />
      <CycleTimeSection sprintTasks={sprintTasks} />
    </div>
  );
}
