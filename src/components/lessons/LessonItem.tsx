"use client";
import Link from "next/link";

interface Lesson {
  id: string; title: string; type: string; duration: string;
  status: "done" | "current" | "locked";
}

const iconMap: Record<string, { emoji: string; bg: string }> = {
  video: { emoji: "🎬", bg: "rgba(96,165,250,0.15)" },
  article: { emoji: "📄", bg: "rgba(52,211,153,0.15)" },
  quiz: { emoji: "❓", bg: "rgba(124,106,247,0.15)" },
};

const statusMap = {
  done: { symbol: "✓", bg: "rgba(52,211,153,0.15)", color: "var(--green)" },
  current: { symbol: "→", bg: "rgba(124,106,247,0.2)", color: "var(--accent3)" },
  locked: { symbol: "🔒", bg: "var(--bg4)", color: "var(--muted)" },
};

export default function LessonItem({ lesson }: { lesson: Lesson }) {
  const icon = iconMap[lesson.type];
  const status = statusMap[lesson.status];
  const href = lesson.type === "quiz" ? "/quiz" : "/lessons";

  return (
    <Link href={lesson.status === "locked" ? "#" : href} style={{
      display: "flex", alignItems: "center", gap: "14px",
      background: "var(--bg2)", border: `1px solid ${lesson.status === "current" ? "var(--accent)" : "var(--border)"}`,
      borderRadius: "10px", padding: "14px 16px", cursor: lesson.status === "locked" ? "not-allowed" : "pointer",
      textDecoration: "none", opacity: lesson.status === "locked" ? 0.6 : 1, transition: "all 0.15s",
    }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: icon.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
        {lesson.status === "current" ? "▶" : icon.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", marginBottom: "2px" }}>{lesson.title}</p>
        <p style={{ fontSize: "12px", color: "var(--muted)" }}>
          {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} · {lesson.duration}
          {lesson.status === "current" && <span style={{ color: "var(--amber)", marginLeft: "4px" }}>· In progress</span>}
        </p>
      </div>
      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: status.bg, color: status.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0 }}>
        {status.symbol}
      </div>
    </Link>
  );
}
