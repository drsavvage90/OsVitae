import { useState } from "react";
import { Glass, Btn } from "../ui";
import { getWsIcon } from "../../lib/constants";
import { ChevronDown, ChevronRight } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "retrospective", label: "Retrospective" },
  { id: "security", label: "Security Posture" },
];

const MOODS = ["😫", "😕", "😐", "🙂", "🤩"];

// ─── TAB 1: OVERVIEW ─────────────────────────────
function OverviewTab({ tasks, inbox, habits, toggleHabit, goTask, pColors, activeSprint }) {
  const incompleteTasks = tasks.filter(t => !t.done);
  const upcomingDeadlines = tasks.filter(t => t.dueDate && !t.done);
  const untriagedInbox = inbox.filter(i => !i.triaged);
  const today = new Date().toISOString().split("T")[0];
  const habitsNotDone = habits.filter(h => !h.completions.includes(today));

  const sprintTasks = activeSprint ? tasks.filter(t => t.sprint_id === activeSprint.id) : [];
  const sprintDone = sprintTasks.filter(t => t.done || t.status === "done");
  const sprintVelocity = sprintDone.reduce((s, t) => s + (t.storyPoints || 0), 0);

  const now = new Date();
  const end = activeSprint ? new Date(activeSprint.endDate) : now;
  const daysRemaining = activeSprint ? Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24))) : 0;

  const securityOpen = tasks.filter(t => t.taskType === "security" && !t.done).length;

  const stats = [
    { label: "Open Tasks", value: incompleteTasks.length, color: "var(--primary)" },
    { label: "Deadlines", value: upcomingDeadlines.length, color: "#F59E0B" },
    { label: "Inbox Items", value: untriagedInbox.length, color: "var(--danger)" },
    { label: "Sprint Velocity", value: `${sprintVelocity} SP`, color: "#8B5CF6" },
    { label: "Sprint Health", value: activeSprint ? `${daysRemaining}d left` : "—", color: "#22C55E" },
    { label: "Security Issues", value: securityOpen, color: securityOpen > 0 ? "#EF4444" : "#22C55E" },
  ];

  return (
    <div>
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <Glass key={i} style={{ padding: 18, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
          </Glass>
        ))}
      </div>

      {upcomingDeadlines.length > 0 && (
        <Glass style={{ padding: 20, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, color: "var(--text)", margin: "0 0 12px", fontWeight: 700 }}>Upcoming Deadlines</h3>
          {upcomingDeadlines.map(t => (
            <div key={t.id} onClick={() => goTask(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", borderBottom: "1px solid var(--subtle-bg)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: pColors[t.priority] }} />
              <span style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", flex: 1, fontWeight: 600 }}>{t.title}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: t.priority === "high" ? "#EF4444" : "var(--muted)", fontWeight: 600 }}>{t.dueDate}</span>
            </div>
          ))}
        </Glass>
      )}

      {habitsNotDone.length > 0 && (
        <Glass style={{ padding: 20, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, color: "var(--text)", margin: "0 0 12px", fontWeight: 700 }}>Habits Still Pending Today</h3>
          {habitsNotDone.map(h => (
            <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", borderBottom: "1px solid var(--subtle-bg)" }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: `${h.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: h.color }}>{getWsIcon(h.icon, 12)}</div>
              <span style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", flex: 1 }}>{h.name}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{h.streak} streak</span>
            </div>
          ))}
        </Glass>
      )}

      {incompleteTasks.length === 0 && upcomingDeadlines.length === 0 && untriagedInbox.length === 0 && habitsNotDone.length === 0 && (
        <Glass style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>&#x2728;</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>All clear</div>
          <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)" }}>Tasks done, habits complete, inbox empty. You've earned a break.</div>
        </Glass>
      )}
    </div>
  );
}

// ─── TAB 2: RETROSPECTIVE ─────────────────────────
function RetrospectiveTab({ activeSprint, retrospectives, onSaveRetro }) {
  const [wentWell, setWentWell] = useState("");
  const [improvements, setImprovements] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [mood, setMood] = useState(3);
  const [expandedRetro, setExpandedRetro] = useState(null);

  if (!activeSprint) {
    return (
      <Glass style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🏃</div>
        <div style={{ fontFamily: "var(--heading)", fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No active sprint</div>
        <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)" }}>Start a sprint to run retrospectives.</div>
      </Glass>
    );
  }

  const textareaStyle = {
    width: "100%", minHeight: 80, padding: "10px 12px", borderRadius: 10,
    border: "1.5px solid var(--card-border)", background: "var(--card-bg)",
    fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", resize: "vertical",
    outline: "none", boxSizing: "border-box",
  };

  const handleSave = () => {
    onSaveRetro({
      sprint_id: activeSprint.id,
      went_well: wentWell,
      improvements,
      action_items: actionItems.split("\n").map(l => l.trim()).filter(Boolean),
      mood,
    });
    setWentWell("");
    setImprovements("");
    setActionItems("");
    setMood(3);
  };

  const sorted = [...(retrospectives || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div>
      <Glass style={{ padding: 20, marginBottom: 18 }}>
        <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, color: "var(--text)", margin: "0 0 16px", fontWeight: 700 }}>
          Sprint Retrospective — {activeSprint.name}
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>What went well</label>
          <textarea value={wentWell} onChange={e => setWentWell(e.target.value)} placeholder="Things that worked..." style={textareaStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>What could be improved</label>
          <textarea value={improvements} onChange={e => setImprovements(e.target.value)} placeholder="Areas for growth..." style={textareaStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Action items (one per line)</label>
          <textarea value={actionItems} onChange={e => setActionItems(e.target.value)} placeholder="- Improve test coverage&#10;- Set up CI alerts" style={textareaStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 8 }}>Sprint mood</label>
          <div style={{ display: "flex", gap: 8 }}>
            {MOODS.map((emoji, i) => (
              <div
                key={i}
                onClick={() => setMood(i + 1)}
                style={{
                  width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, cursor: "pointer", transition: "all 0.15s",
                  background: mood === i + 1 ? "var(--primary-bg)" : "var(--card-bg)",
                  border: mood === i + 1 ? "2px solid var(--primary)" : "1.5px solid var(--card-border)",
                  transform: mood === i + 1 ? "scale(1.15)" : "none",
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>

        <Btn primary onClick={handleSave} disabled={!wentWell.trim() && !improvements.trim()}>Save Retrospective</Btn>
      </Glass>

      {sorted.length > 0 && (
        <div>
          <h3 style={{ fontFamily: "var(--heading)", fontSize: 14, color: "var(--text)", margin: "0 0 12px", fontWeight: 700 }}>Previous Retrospectives</h3>
          {sorted.map(r => {
            const expanded = expandedRetro === r.id;
            return (
              <Glass key={r.id} style={{ padding: "14px 18px", marginBottom: 10, cursor: "pointer" }} onClick={() => setExpandedRetro(expanded ? null : r.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {expanded ? <ChevronDown size={14} color="var(--muted)" /> : <ChevronRight size={14} color="var(--muted)" />}
                  <span style={{ fontFamily: "var(--heading)", fontSize: 13, fontWeight: 600, color: "var(--text)", flex: 1 }}>
                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span style={{ fontSize: 16 }}>{MOODS[(r.mood || 3) - 1]}</span>
                </div>
                {expanded && (
                  <div style={{ marginTop: 12, paddingLeft: 24 }}>
                    {r.went_well && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#22C55E", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Went well</div>
                        <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", whiteSpace: "pre-wrap" }}>{r.went_well}</div>
                      </div>
                    )}
                    {r.improvements && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#F59E0B", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Could improve</div>
                        <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", whiteSpace: "pre-wrap" }}>{r.improvements}</div>
                      </div>
                    )}
                    {r.action_items && r.action_items.length > 0 && (
                      <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#8B5CF6", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Action items</div>
                        {r.action_items.map((item, j) => (
                          <div key={j} style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", padding: "2px 0" }}>• {item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Glass>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TAB 3: SECURITY POSTURE ──────────────────────
function SecurityPostureTab({ tasks, auditLog }) {
  const today = new Date().toISOString().split("T")[0];
  const secTasks = tasks.filter(t => t.taskType === "security" && !t.done);
  const byPriority = { high: 0, medium: 0, low: 0 };
  secTasks.forEach(t => { byPriority[t.priority] = (byPriority[t.priority] || 0) + 1; });

  const overdue = secTasks.filter(t => t.dueDate && t.dueDate < today);
  const recentLogs = (auditLog || []).slice(0, 5);

  const prioCards = [
    { label: "High", value: byPriority.high, color: "#EF4444" },
    { label: "Medium", value: byPriority.medium, color: "#F59E0B" },
    { label: "Low", value: byPriority.low, color: "#22C55E" },
  ];

  return (
    <div>
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {prioCards.map((s, i) => (
          <Glass key={i} style={{ padding: 18, textAlign: "center", border: s.value > 0 ? `1.5px solid ${s.color}30` : undefined }}>
            <div style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{s.label} Priority</div>
          </Glass>
        ))}
      </div>

      {recentLogs.length > 0 && (
        <Glass style={{ padding: 20, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, color: "var(--text)", margin: "0 0 12px", fontWeight: 700 }}>Recent Audit Log</h3>
          {recentLogs.map((entry, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--subtle-bg)" }}>
              <span style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", flex: 1, fontWeight: 600 }}>{entry.action}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{entry.resource_type}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{new Date(entry.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </Glass>
      )}

      {overdue.length > 0 && (
        <Glass style={{ padding: 20, marginBottom: 14, background: "rgba(239,68,68,0.04)", border: "1.5px solid rgba(239,68,68,0.2)" }}>
          <h3 style={{ fontFamily: "var(--heading)", fontSize: 15, color: "#EF4444", margin: "0 0 12px", fontWeight: 700 }}>Overdue Security Tasks</h3>
          {overdue.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--subtle-bg)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
              <span style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", flex: 1, fontWeight: 600 }}>{t.title}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#EF4444", fontWeight: 600 }}>{t.dueDate}</span>
            </div>
          ))}
        </Glass>
      )}

      {secTasks.length === 0 && recentLogs.length === 0 && (
        <Glass style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>All secure</div>
          <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)" }}>No open security issues.</div>
        </Glass>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────
export default function SprintHubPage({ tasks, inbox, habits, toggleHabit, goTask, pColors, sprints, retrospectives, onSaveRetro, auditLog }) {
  const [tab, setTab] = useState("overview");
  const activeSprint = (sprints || []).find(s => s.status === "active") || null;

  return (
    <div>
      <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: "0 0 4px", fontWeight: 800 }}>Sprint Hub</h1>
      <p style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--muted)", margin: "0 0 20px" }}>
        {activeSprint ? activeSprint.name : "No active sprint"} — take stock and plan your next moves.
      </p>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {TABS.map(t => (
          <div
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 16px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
              fontFamily: "var(--heading)", fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? "var(--primary)" : "var(--muted)",
              background: tab === t.id ? "var(--primary-bg)" : "transparent",
            }}
            onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = "var(--hover-bg)"; }}
            onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = tab === t.id ? "var(--primary-bg)" : "transparent"; }}
          >
            {t.label}
          </div>
        ))}
      </div>

      {tab === "overview" && <OverviewTab tasks={tasks} inbox={inbox} habits={habits} toggleHabit={toggleHabit} goTask={goTask} pColors={pColors} activeSprint={activeSprint} />}
      {tab === "retrospective" && <RetrospectiveTab activeSprint={activeSprint} retrospectives={retrospectives} onSaveRetro={onSaveRetro} />}
      {tab === "security" && <SecurityPostureTab tasks={tasks} auditLog={auditLog} />}
    </div>
  );
}
