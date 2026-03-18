"use client";
import Link from "next/link";

interface Course {
  id: string; title: string; emoji: string; hours: number;
  lessons: number; progress: number; status: string;
  color: string; thumb: string;
}

const badgeStyles: Record<string, { bg: string; color: string; label: string }> = {
  new: { bg: "rgba(124,106,247,0.2)", color: "var(--accent3)", label: "New" },
  progress: { bg: "rgba(251,191,36,0.15)", color: "var(--amber)", label: "In Progress" },
  done: { bg: "rgba(52,211,153,0.15)", color: "var(--green)", label: "Completed" },
};

export default function CourseCard({ course }: { course: Course }) {
  const badge = badgeStyles[course.status];
  const barColor = course.progress === 100 ? "linear-gradient(90deg,#34d399,#7c6af7)" : course.color;

  return (
    <Link href="/lessons" style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", cursor: "pointer", textDecoration: "none", display: "block", transition: "all 0.2s" }}>
      <div style={{ height: "100px", background: course.thumb, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", position: "relative" }}>
        {course.emoji}
        <span style={{ position: "absolute", top: "10px", right: "10px", fontSize: "10px", padding: "3px 8px", borderRadius: "99px", fontWeight: 600, background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>{course.title}</p>
        <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
          <span>⏱ {course.hours}h total</span>
          <span>📚 {course.lessons} lessons</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "5px" }}>
          <span>Progress</span><span>{course.progress}%</span>
        </div>
        <div style={{ background: "var(--bg4)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: "99px", background: barColor, width: `${course.progress}%`, transition: "width 0.5s ease" }} />
        </div>
      </div>
    </Link>
  );
}
