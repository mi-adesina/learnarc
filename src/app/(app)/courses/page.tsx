"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function CoursesPage() {
  const [courses, setCourses]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all"|"enrolled"|"completed">("all");
  const [enrolling, setEnrolling] = useState<string|null>(null);
  const [toast, setToast]         = useState("");
  const [uid, setUid]             = useState<string|null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }: any) => {
      if (!data?.session) return;
      const userId = data.session.user.id;
      setUid(userId);
      const [{ data: allCourses }, { data: enrollments }] = await Promise.all([
        supabase.from("courses").select("*").eq("published", true).order("created_at"),
        supabase.from("enrollments").select("*").eq("user_id", userId),
      ]);
      const enrollMap = new Map((enrollments as any[])?.map((e: any) => [e.course_id, e]) ?? []);
      setCourses(((allCourses as any[]) ?? []).map((c: any) => {
        const e = enrollMap.get(c.id) as any;
        return { ...c, enrolled: !!e, progress: e?.progress_pct ?? 0, status: !e ? "new" : e.completed_at ? "done" : "progress" };
      }));
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleEnroll = async (courseId: string, title: string) => {
    if (!uid) return;
    setEnrolling(courseId);
    const supabase = createClient();
    const { error } = await (supabase.from("enrollments") as any).upsert({ user_id: uid, course_id: courseId });
    if (error) { showToast("Failed to enroll: " + error.message); }
    else {
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, enrolled: true, status: "progress", progress: 0 } : c));
      showToast(`Enrolled in "${title}" 🎉`);
    }
    setEnrolling(null);
  };

  const filtered = courses.filter((c) => {
    if (filter === "enrolled")  return c.enrolled && c.status !== "done";
    if (filter === "completed") return c.status === "done";
    return true;
  });

  if (loading) return <Loader />;

  const badgeStyle: Record<string, any> = {
    new:      { bg: "rgba(124,106,247,0.2)", color: "var(--accent3)", label: "New"         },
    progress: { bg: "rgba(251,191,36,0.15)", color: "var(--amber)",   label: "In Progress" },
    done:     { bg: "rgba(52,211,153,0.15)", color: "var(--green)",   label: "Completed"   },
  };

  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "var(--bg2)", border: "1px solid var(--green)", borderLeft: "3px solid var(--green)", borderRadius: "10px", padding: "12px 16px", fontSize: "13.5px", color: "var(--text)", zIndex: 9999 }}>
          {toast}
        </div>
      )}
      <div className="ph" style={{ padding: "28px 32px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>Courses</h1>
          <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "3px" }}>
            {courses.filter(c => c.enrolled).length} enrolled · {courses.filter(c => c.status === "done").length} completed
          </p>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "var(--bg3)", borderRadius: "10px", padding: "3px" }}>
          {(["all","enrolled","completed"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer", border: "none", background: filter===f?"var(--bg2)":"transparent", color: filter===f?"var(--text)":"var(--muted)", fontWeight: filter===f?500:400, transition: "all 0.15s", textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="pv" style={{ padding: "24px 32px 0" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>No courses here</p>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "8px" }}>Try a different filter</p>
          </div>
        ) : (
          <div className="rg-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
            {filtered.map((c) => {
              const badge = badgeStyle[c.status] ?? badgeStyle.new;
              return (
                <div key={c.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: "100px", background: c.thumb_gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", position: "relative", flexShrink: 0 }}>
                    {c.emoji}
                    <span style={{ position: "absolute", top: "10px", right: "10px", fontSize: "10px", padding: "3px 8px", borderRadius: "99px", fontWeight: 600, background: badge.bg, color: badge.color }}>{badge.label}</span>
                  </div>
                  <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>{c.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "10px", lineHeight: 1.5, flex: 1 }}>{c.description}</p>
                    <div style={{ display: "flex", gap: "10px", fontSize: "11.5px", color: "var(--muted)", marginBottom: "12px" }}>
                      <span>⏱ {c.total_hours}h</span>
                      <span>📚 {c.total_lessons} lessons</span>
                      <span style={{ color: c.difficulty==="beginner"?"var(--green)":c.difficulty==="intermediate"?"var(--amber)":"var(--red)" }}>◆ {c.difficulty}</span>
                    </div>
                    {c.enrolled ? (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "5px" }}>
                          <span>Progress</span><span>{c.progress}%</span>
                        </div>
                        <div style={{ background: "var(--bg4)", borderRadius: "99px", height: "6px", overflow: "hidden", marginBottom: "10px" }}>
                          <div style={{ height: "100%", borderRadius: "99px", background: c.bar_color, width: `${c.progress}%` }} />
                        </div>
                        <Link href="/lessons" style={{ display: "block", textAlign: "center", padding: "8px", background: "rgba(124,106,247,0.1)", color: "var(--accent3)", borderRadius: "8px", fontSize: "12.5px", fontWeight: 500, textDecoration: "none" }}>
                          Continue →
                        </Link>
                      </>
                    ) : (
                      <button onClick={() => handleEnroll(c.id, c.title)} disabled={enrolling===c.id} style={{ width: "100%", padding: "9px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", fontWeight: 500, cursor: enrolling===c.id?"wait":"pointer", opacity: enrolling===c.id?0.7:1 }}>
                        {enrolling===c.id ? "Enrolling..." : "Enroll Free"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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