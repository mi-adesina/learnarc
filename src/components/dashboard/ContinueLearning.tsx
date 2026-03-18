import Link from "next/link";

const items = [
  { icon: "🎬", iconBg: "rgba(96,165,250,0.15)", title: "React Hooks Deep Dive", sub: "Advanced React · 18 min left", progress: 65, href: "/lessons" },
  { icon: "📄", iconBg: "rgba(52,211,153,0.15)", title: "Async/Await Patterns", sub: "JavaScript Pro · 8 min read", progress: 30, href: "/lessons" },
  { icon: "❓", iconBg: "rgba(124,106,247,0.15)", title: "CSS Grid Quiz — 5 questions", sub: "CSS Mastery · ~5 min", progress: null, href: "/quiz" },
];

export default function ContinueLearning() {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Continue learning</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item) => (
          <Link key={item.title} href={item.href} style={{ display: "flex", alignItems: "center", gap: "14px", background: "transparent", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 16px", cursor: "pointer", textDecoration: "none", transition: "all 0.15s" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", marginBottom: "2px" }}>{item.title}</p>
              <p style={{ fontSize: "12px", color: "var(--muted)" }}>{item.sub}</p>
            </div>
            {item.progress !== null ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "60px", background: "var(--bg4)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg,#60a5fa,#a78bfa)", width: `${item.progress}%` }} />
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "monospace" }}>{item.progress}%</span>
              </div>
            ) : (
              <span style={{ fontSize: "11px", background: "rgba(251,191,36,0.15)", color: "var(--amber)", padding: "4px 8px", borderRadius: "6px", whiteSpace: "nowrap" }}>Not started</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
