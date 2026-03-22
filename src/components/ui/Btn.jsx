const Btn = ({ children, primary, color, small, style = {}, onClick }) => (
  <button onClick={onClick} style={{
    background: primary ? (color || "var(--primary)") : "var(--subtle-bg)",
    color: primary ? "var(--btn-text)" : "var(--muted)", border: primary ? "none" : "1px solid var(--border)",
    borderRadius: small ? 8 : 11, padding: small ? "5px 12px" : "8px 18px",
    fontFamily: "var(--body)", fontSize: small ? 11 : 12, fontWeight: 600,
    cursor: "pointer", transition: "all 0.2s", ...style,
  }}
    onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
  >{children}</button>
);

export default Btn;
