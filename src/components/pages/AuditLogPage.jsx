import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Glass, Btn } from "../ui";

const PAGE_SIZE = 50;

// Color-coding by action
const ACTION_COLORS = {
  delete: { color: "#EF4444", bg: "rgba(239,68,68,0.10)" },
  create: { color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
  update: { color: "var(--muted)", bg: "var(--subtle-bg)" },
  security: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
};

const SECURITY_ACTIONS = ["credential_accessed", "export_data", "login", "logout", "password_changed", "mfa_enabled"];

function getActionStyle(action) {
  const a = (action || "").toLowerCase();
  if (SECURITY_ACTIONS.some(s => a.includes(s))) return ACTION_COLORS.security;
  if (a.includes("delete") || a.includes("remove")) return ACTION_COLORS.delete;
  if (a.includes("create") || a.includes("insert") || a.includes("add")) return ACTION_COLORS.create;
  return ACTION_COLORS.update;
}

function truncateId(id) {
  if (!id) return "—";
  const s = String(id);
  return s.length > 12 ? s.slice(0, 8) + "..." : s;
}

function formatDetails(entry) {
  if (!entry.old_value && !entry.new_value) return "—";
  const parts = [];
  if (entry.old_value) parts.push(typeof entry.old_value === "object" ? JSON.stringify(entry.old_value) : String(entry.old_value));
  if (entry.new_value) parts.push(typeof entry.new_value === "object" ? JSON.stringify(entry.new_value) : String(entry.new_value));
  if (parts.length === 2) return `${parts[0]} → ${parts[1]}`;
  return parts[0] || "—";
}

export default function AuditLogPage({ auditLog, loading }) {
  const [searchText, setSearchText] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageNum, setPageNum] = useState(0);

  // Derive unique resource types for filter dropdown
  const resourceTypes = useMemo(() => {
    const types = new Set();
    (auditLog || []).forEach(e => { if (e.resource_type) types.add(e.resource_type); });
    return Array.from(types).sort();
  }, [auditLog]);

  // Filter entries
  const filtered = useMemo(() => {
    let entries = auditLog || [];
    if (searchText) {
      const q = searchText.toLowerCase();
      entries = entries.filter(e =>
        (e.action || "").toLowerCase().includes(q) ||
        (e.resource_type || "").toLowerCase().includes(q) ||
        (e.resource_id || "").toLowerCase().includes(q)
      );
    }
    if (resourceFilter !== "all") {
      entries = entries.filter(e => e.resource_type === resourceFilter);
    }
    if (dateFrom) {
      entries = entries.filter(e => e.created_at && e.created_at.slice(0, 10) >= dateFrom);
    }
    if (dateTo) {
      entries = entries.filter(e => e.created_at && e.created_at.slice(0, 10) <= dateTo);
    }
    return entries;
  }, [auditLog, searchText, resourceFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(pageNum, totalPages - 1);
  const pageEntries = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // Reset page when filters change
  const setSearchAndReset = (v) => { setSearchText(v); setPageNum(0); };
  const setResourceAndReset = (v) => { setResourceFilter(v); setPageNum(0); };
  const setDateFromAndReset = (v) => { setDateFrom(v); setPageNum(0); };
  const setDateToAndReset = (v) => { setDateTo(v); setPageNum(0); };

  const inputStyle = {
    fontFamily: "var(--body)", fontSize: 12, padding: "7px 12px", borderRadius: 10,
    border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text)",
    outline: "none", width: "100%",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, color: "var(--text)", margin: 0, fontWeight: 800 }}>Audit Log</h1>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Filter controls */}
      <Glass style={{ padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              value={searchText} onChange={e => setSearchAndReset(e.target.value)}
              placeholder="Search actions..."
              style={{ ...inputStyle, paddingLeft: 30 }}
            />
          </div>
          {/* Resource type */}
          <div style={{ flex: "0 1 180px", minWidth: 140 }}>
            <select value={resourceFilter} onChange={e => setResourceAndReset(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="all">All resource types</option>
              {resourceTypes.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
          </div>
          {/* Date from */}
          <div style={{ flex: "0 1 150px", minWidth: 130 }}>
            <input type="date" value={dateFrom} onChange={e => setDateFromAndReset(e.target.value)} style={inputStyle} placeholder="From" />
          </div>
          {/* Date to */}
          <div style={{ flex: "0 1 150px", minWidth: 130 }}>
            <input type="date" value={dateTo} onChange={e => setDateToAndReset(e.target.value)} style={inputStyle} placeholder="To" />
          </div>
        </div>
      </Glass>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--body)", fontSize: 14, color: "var(--muted)" }}>Loading audit log...</div>
      ) : pageEntries.length > 0 ? (
        <div style={{ borderRadius: 14, border: "1px solid var(--card-border)", overflow: "hidden", background: "var(--card-bg)", backdropFilter: "blur(20px)" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "170px 1fr 120px 110px 1fr", gap: 12,
            padding: "10px 16px", background: "var(--subtle-bg)", borderBottom: "1px solid var(--border-light)",
          }}>
            {["Timestamp", "Action", "Resource Type", "Resource ID", "Details"].map(h => (
              <span key={h} style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
            ))}
          </div>
          {/* Rows */}
          {pageEntries.map((entry, i) => {
            const style = getActionStyle(entry.action);
            return (
              <div key={entry.id || i} style={{
                display: "grid", gridTemplateColumns: "170px 1fr 120px 110px 1fr", gap: 12,
                padding: "10px 16px", borderBottom: i < pageEntries.length - 1 ? "1px solid var(--border-light)" : "none",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Timestamp */}
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                  {entry.created_at ? new Date(entry.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                </span>
                {/* Action */}
                <span style={{
                  fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: style.color,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{
                    display: "inline-block", padding: "1px 8px", borderRadius: 6,
                    background: style.bg, fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                  }}>{entry.action || "—"}</span>
                </span>
                {/* Resource Type */}
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600, color: "var(--muted)",
                  background: "var(--subtle-bg)", padding: "2px 8px", borderRadius: 6,
                  alignSelf: "center", justifySelf: "start",
                }}>{entry.resource_type || "—"}</span>
                {/* Resource ID */}
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", alignSelf: "center" }} title={entry.resource_id}>
                  {truncateId(entry.resource_id)}
                </span>
                {/* Details */}
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", alignSelf: "center",
                }} title={formatDetails(entry)}>
                  {formatDetails(entry)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{"\uD83D\uDCDC"}</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No log entries</div>
          <div style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)" }}>
            {searchText || resourceFilter !== "all" || dateFrom || dateTo ? "Try adjusting your filters." : "Audit log entries will appear here as actions are performed."}
          </div>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 16 }}>
          <Btn small disabled={safePage === 0} onClick={() => setPageNum(safePage - 1)}>
            <ChevronLeft size={14} /> Prev
          </Btn>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
            Page {safePage + 1} of {totalPages}
          </span>
          <Btn small disabled={safePage >= totalPages - 1} onClick={() => setPageNum(safePage + 1)}>
            Next <ChevronRight size={14} />
          </Btn>
        </div>
      )}
    </div>
  );
}
