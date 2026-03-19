"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const typeIcon: Record<string, { emoji: string; bg: string }> = {
  video:   { emoji: "🎬", bg: "rgba(96,165,250,0.15)"  },
  article: { emoji: "📄", bg: "rgba(52,211,153,0.15)"  },
  quiz:    { emoji: "❓", bg: "rgba(124,106,247,0.15)" },
};

export default function LessonsPage() {
  const [uid, setUid]                   = useState<string|null>(null);
  const [enrolledCourses, setEnrolled]  = useState<any[]>([]);
  const [selected, setSelected]         = useState<any>(null);
  const [lessons, setLessons]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [completing, setCompleting]     = useState<string|null>(null);
  const [toast, setToast]               = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data?.session) return;
      const userId = data.session.user.id;
      setUid(userId);

      const [{ data: enrollments }, { data: allCourses }] = await Promise.all([
        supabase.from("enrollments").select("*, courses(*)").eq("user_id", userId),
        supabase.from("courses").select("*").eq("published", true),
      ]);

      const enrollMap = new Map(enrollments?.map((e: any) => [e.course_id, e]) ?? []);
      const enrolled = (allCourses ?? [])
        .filter((c: any) => enrollMap.has(c.id))
        .map((c: any) => { const e = enrollMap.get(c.id) as any; return { ...c, progress: e?.progress_pct ?? 0, status: e?.completed_at ? "done" : "progress" }; });

      setEnrolled(enrolled);
      if (enrolled.length > 0) {
        const pick = enrolled.find((c: any) => c.status === "progress") ?? enrolled[0];
        setSelected(pick);
        await loadLessons(userId, pick.id);
      }
      setLoading(false);
    });
  }, []);

  const loadLessons = async (userId: string, courseId: string) => {
    const supabase = createClient();
    const [{ data: ls }, { data: progress }] = await Promise.all([
      supabase.from("lessons").select("*").eq("course_id", courseId).eq("published", true).order("order_index"),
      supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", userId).eq("course_id", courseId),
    ]);
    const progressMap = new Map(progress?.map((p: any) => [p.lesson_id, p.completed]) ?? []);
    let foundCurrent = false;
    setLessons((ls ?? []).map((l: any) => {
      if (progressMap.get(l.id) === true) return { ...l, status: "done" };
      if (!foundCurrent) { foundCurrent = true; return { ...l, status: "current" }; }
      return { ...l, status: "locked" };
    }));
  };

  const switchCourse = async (course: any) => {
    if (!uid) return;
    setSelected(course);
    setLoading(true);
    await loadLessons(uid, course.id);
    setLoading(false);
  };

  const handleComplete = async (lesson: any) => {
    if (lesson.status !== "current" || completing || !uid) return;
    setCompleting(lesson.id);
    const supabase = createClient();
    await (supabase.from("lesson_progress") as any).upsert({ user_id: uid, lesson_id: lesson.id, course_id: selected.id, completed: true, completed_at: new Date().toISOString() });
    await supabase.from("activity").insert({ user_id: uid, type: "lesson_complete", title: `Completed "${lesson.title}"`, color: "#34d399" });
    setLessons((prev) => {
      let unlocked = false;
      return prev.map((l: any) => {
        if (l.id === lesson.id) return { ...l, status: "done" };
        if (!unlocked && l.status === "locked") { unlocked = true; return { ...l, status: "current" }; }
        return l;
      });
    });
    showToast("Lesson complete! +10 XP 🎉");
    setCompleting(null);
  };

  if (loading) return <Loader />;

  const completed   = lessons.filter((l) => l.status === "done").length;
  const progressPct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <div>
      {toast && <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "var(--bg2)", border: "1px solid var(--green)", borderLeft: "3px solid var(--green)", borderRadius: "10px", padding: "12px 16px", fontSize: "13.5px", color: "var(--text)", zIndex: 9999 }}>{toast}</div>}

      <div className="ph" style={{ padding: "28px 32px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>{selected?.title ?? "Lessons"}</h1>
          <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "3px" }}>{completed} of {lessons.length} lessons complete</p>
        </div>
        <Link href="/courses" style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", fontWeight: 500, background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", textDecoration: "none" }}>← All courses</Link>
      </div>

      <div className="pv" style={{ padding: "24px 32px 0" }}>
        {enrolledCourses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>No courses enrolled</p>
            <Link href="/courses" style={{ display: "inline-block", marginTop: "12px", padding: "9px 18px", background: "var(--accent)", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "13px" }}>Browse courses</Link>
          </div>
        ) : (
          <div className="rg-2" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "24px" }}>
            <div>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ background: "var(--bg4)", borderRadius: "99px", height: "8px", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg,var(--accent),var(--pink))", width: `${progressPct}%`, transition: "width 0.5s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--muted)", marginTop: "6px" }}>
                  <span>{completed} completed</span><span>{progressPct}%</span>
                </div>
              </div>
              {lessons.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "32px 0" }}>No lessons published yet</p>
              ) : lessons.map((lesson: any) => {
                const icon = typeIcon[lesson.type] ?? typeIcon.article;
                const st = { done: { s:"✓", bg:"rgba(52,211,153,0.15)", c:"var(--green)" }, current: { s:"→", bg:"rgba(124,106,247,0.2)", c:"var(--accent3)" }, locked: { s:"🔒", bg:"var(--bg4)", c:"var(--muted)" } }[lesson.status as string] ?? { s:"🔒", bg:"var(--bg4)", c:"var(--muted)" };
                return (
                  <div key={lesson.id} onClick={() => handleComplete(lesson)} style={{ display: "flex", alignItems: "center", gap: "14px", background: "var(--bg2)", border: `1px solid ${lesson.status==="current"?"var(--accent)":"var(--border)"}`, borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", cursor: lesson.status==="locked"?"not-allowed":lesson.status==="current"?"pointer":"default", opacity: lesson.status==="locked"?0.6:1, transition: "all 0.15s" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: icon.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                      {lesson.status === "current" ? "▶" : icon.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>{lesson.title}</p>
                      <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                        {lesson.type} · {lesson.duration_minutes} min
                        {lesson.status === "current" && <span style={{ color: "var(--amber)", marginLeft: "6px" }}>· Click to complete</span>}
                      </p>
                    </div>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: st.bg, color: st.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0 }}>
                      {completing === lesson.id ? "…" : st.s}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>Your courses</p>
              {enrolledCourses.map((c: any) => (
                <div key={c.id} onClick={() => switchCourse(c)} style={{ padding: "12px 14px", borderRadius: "10px", border: `1px solid ${selected?.id===c.id?"var(--accent)":"var(--border)"}`, background: selected?.id===c.id?"rgba(124,106,247,0.08)":"var(--bg2)", cursor: "pointer", marginBottom: "8px", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "18px" }}>{c.emoji}</span>
                    <p style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text)", lineHeight: 1.3 }}>{c.title}</p>
                  </div>
                  <div style={{ background: "var(--bg4)", borderRadius: "99px", height: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: "99px", background: c.bar_color, width: `${c.progress}%` }} />
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>{c.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "28px", height: "28px", border: "2px solid var(--border2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
