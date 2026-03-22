import { useState } from "react";

const Glass = ({ children, style = {}, hover = false, onClick, className }) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--card-bg)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderRadius: 14, border: "1px solid var(--card-border)",
        boxShadow: h && hover ? "var(--card-hover-shadow)" : "var(--card-shadow)",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        transform: h && hover ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default", ...style,
      }}>{children}</div>
  );
};

export default Glass;
