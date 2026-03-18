const days = ["M", "T", "W", "T", "F", "S", "S"];
const done = [true, true, true, true, true, true, true];

export default function StreakWidget() {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>7-day streak</p>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--amber)" }}>7</span>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>Day streak</p>
          <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>Don't break it today!</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {days.map((d, i) => (
          <div key={i} style={{ height: "24px", borderRadius: "4px", background: done[i] ? (i === 6 ? "var(--accent)" : "rgba(124,106,247,0.3)") : "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: done[i] ? (i === 6 ? "#fff" : "var(--accent3)") : "var(--muted)", fontFamily: "monospace" }}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
