import { stats } from "@/lib/data";

export default function StatsGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", margin: "24px 0" }}>
      {stats.map((s) => (
        <div key={s.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 500, letterSpacing: "0.3px", marginBottom: "8px" }}>{s.label}</p>
          <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px", lineHeight: 1 }}>{s.value}</p>
          <p style={{ fontSize: "12px", marginTop: "6px", color: s.trend === "up" ? "var(--green)" : "var(--muted)" }}>{s.change}</p>
        </div>
      ))}
    </div>
  );
}
