"use client";
import { weeklyActivity } from "@/lib/data";

const days = ["M", "T", "W", "T", "F", "S", "S"];
const max = Math.max(...weeklyActivity);
const colors = ["#7c6af7", "#a78bfa", "#7c6af7", "#c4b5fd", "#a78bfa", "#7c6af7", "#8b7cf7"];

export default function WeeklyActivity() {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Weekly activity</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px" }}>
        {weeklyActivity.map((val, i) => (
          <div key={i} title={`${val} lessons`} style={{ flex: 1, height: `${Math.round((val / max) * 100)}%`, background: colors[i], borderRadius: "4px 4px 0 0", opacity: i === 6 ? 1 : 0.6, transition: "all 0.3s", cursor: "pointer" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "10px", color: "var(--muted)", fontFamily: "monospace" }}>{d}</div>
        ))}
      </div>
    </div>
  );
}
