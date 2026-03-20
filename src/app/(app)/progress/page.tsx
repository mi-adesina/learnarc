"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProgressPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }: any) => {
      if (!data?.session) return;
      const uid = data.session.user.id;

      const [{ data: profile }, { data: enrollments }, { data: allCourses }, { data: attempts }, { data: lessonsDone }] = await Promise.all([
        supabase.from("profiles").select("xp, streak").eq("id", uid).single(),
        supabase.from("enrollments").select("course_id, progress_pct, completed_at").eq("user_id", uid),
        supabase.from("courses").select("*").eq("published", true),
        supabase.from("quiz_attempts").select("*, courses(title)").eq("user_id", uid).order("completed_at", { ascending: false }).limit(8),
        supabase.from("lesson_progress").select("id").eq("user_id", uid).eq("completed", true),
      ]) as any;

      const enrollMap = new Map(enrollments?.map((e: any) => [e.course_id, e]) ?? []);
      const enrolled = (allCourses ?? [])
        .filter((c: any) => enrollMap.has(c.id))
        .map((c: any) => { const e = enrollMap.get(c.id) as any; return { ...c, progress: e?.progress_pct ?? 0 }; });

      setCourses(enrolled);
      setQuizzes(attempts ?? []);
      const avgQuiz = attempts?.length ? Math.round(attempts.reduce((s: number, a: any) => s + a.pct, 0) / attempts.length) : 0;
      setStats({ xp: profile?.xp ?? 0, streak: profile?.streak ?? 0, enrolled: enrollments?.length ?? 0, lessonsCompleted: lessonsDone?.length ?? 0, quizzesTaken: attempts?.length ?? 0, avgQuiz });
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  const xpMilestones = [{ label:"Beginner",xp:0 },{ label:"Explorer",xp:100 },{ label:"Practitioner",xp:300 },{ label:"Expert",xp:700 },{ label:"Master",xp:1500 }];
  const xp = stats?.xp ?? 0;
  const nextLevel  = xpMilestones.find((m) => m.xp > xp) ?? xpMilestones[xpMilestones.length-1];
  const prevLevel  = [...xpMilestones].reverse().find((m) => m.xp <= xp) ?? xpMilestones[0];
  const xpPct      = nextLevel.xp > prevLevel.xp ? Math.round(((xp - prevLevel.xp) / (nextLevel.xp - prevLevel.xp)) * 100) : 100;

  return (
    <div>
      <div className="ph" style={{ padding: "28px 32px 0" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>Progress</h1>
        <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "3px" }}>Your learning journey at a glance</p>
      </div>

      <div className="pv" style={{ padding: "24px 32px 0" }}>
        {/* XP card */}
        <div style={{ background: "linear-gradient(135deg,rgba(124,106,247,0.15),rgba(244,114,182,0.1))", border: "1px solid rgba(124,106,247,0.3)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "4px" }}>Current level</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent3)" }}>{prevLevel.label}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "4px" }}>Total XP</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)" }}>{xp} <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 400 }}>XP</span></p>
            </div>
          </div>
          <div style={{ background: "var(--bg4)", borderRadius: "99px", height: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg,var(--accent),var(--pink))", width: `${xpPct}%`, transition: "width 0.5s" }} />
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>{xp} / {nextLevel.xp} XP → {nextLevel.label}</p>
        </div>

        <div className="rg-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Course completion */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Course completion</p>
            {courses.length === 0 ? <p style={{ fontSize: "13px", color: "var(--muted)" }}>No courses enrolled yet</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {courses.map((c: any) => (
                  <div key={c.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}><span>{c.emoji}</span>{c.title}</span>
                      <span style={{ color: c.progress===100?"var(--green)":"var(--muted)", flexShrink: 0, marginLeft: "8px" }}>{c.progress}%{c.progress===100?" ✓":""}</span>
                    </div>
                    <div style={{ background: "var(--bg4)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "99px", background: c.progress===100?"var(--green)":c.bar_color, width: `${c.progress}%`, transition: "width 0.5s" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quiz history */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Quiz history</p>
            {quizzes.length === 0 ? <p style={{ fontSize: "13px", color: "var(--muted)" }}>No quizzes taken yet</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {quizzes.map((q: any) => (
                  <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--bg3)", borderRadius: "8px" }}>
                    <div>
                      <p style={{ fontSize: "13px", color: "var(--text)" }}>{q.courses?.title ?? "Quiz"}</p>
                      <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>{new Date(q.completed_at).toLocaleDateString()}</p>
                    </div>
                    <span style={{ fontSize: "13px", fontFamily: "monospace", color: q.pct>=80?"var(--green)":q.pct>=60?"var(--amber)":"var(--red)", fontWeight: 600 }}>{q.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }} className="rg-admin">
            {[
              { label: "Enrolled",        value: stats?.enrolled,         color: "var(--accent)" },
              { label: "Lessons done",    value: stats?.lessonsCompleted, color: "var(--green)"  },
              { label: "Quizzes taken",   value: stats?.quizzesTaken,     color: "var(--amber)"  },
              { label: "Day streak",      value: `${stats?.streak ?? 0}🔥`, color: "var(--pink)" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px", textAlign: "center" }}>
                <p style={{ fontSize: "24px", fontWeight: 700, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
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
