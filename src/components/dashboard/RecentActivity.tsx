import { recentActivity } from "@/lib/data";

export default function RecentActivity() {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Recent activity</p>
      <div>
        {recentActivity.map((item, i) => (
          <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, marginTop: "5px", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "13.5px", color: "var(--text)" }}>{item.text}</p>
              <p style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "2px" }}>{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
