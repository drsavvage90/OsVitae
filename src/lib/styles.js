// ═══════════════════════════════════════
//  SHARED STYLE CONSTANTS
// ═══════════════════════════════════════

/** Base card container — mirrors Glass without hover/click logic */
export const cardStyle = {
  background: "var(--card-bg)",
  borderRadius: 10,
  border: "1px solid var(--card-border)",
  padding: "12px 14px",
  transition: "all 0.2s ease",
  boxShadow: "var(--card-shadow-sm)",
};

/** Colored pill badge */
export const badgeStyle = (color) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
  background: `${color}14`,
  padding: "2px 8px",
  borderRadius: 6,
  fontFamily: "var(--mono)",
  fontSize: 9,
  color,
  fontWeight: 600,
});

/** Muted uppercase monospace label */
export const monoLabel = {
  fontFamily: "var(--mono)",
  fontSize: 9,
  color: "var(--muted)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 1,
};

/** Small circle priority/status indicator */
export const priorityDot = (color, size = 6) => ({
  width: size,
  height: size,
  borderRadius: "50%",
  background: color,
  flexShrink: 0,
});

/** Section heading (h3-level) */
export const sectionHeader = {
  fontFamily: "var(--heading)",
  fontSize: 15,
  fontWeight: 700,
  color: "var(--text)",
};
