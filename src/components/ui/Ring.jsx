const Ring = ({ percent, size = 56, stroke = 5, color = "#5B8DEF" }) => {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--card-border)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (percent/100)*c} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
};

export default Ring;
