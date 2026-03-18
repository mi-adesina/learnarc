"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser]       = useState<any>(null);
  const [stats, setStats]     = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data?.session) return;
      const uid = data.session.user.id;

      const [{ data: profile }, { data: enrollments }, { data: lessonsDone }, { data: attempts }, { data: act }, { data: allCourses }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("enrollments").select("*, courses(*)").eq("user_id", uid),
        supabase.from("lesson_progress").select("id").eq("user_id", uid).eq("completed", true),
        supabase.from("quiz_attempts").select("pct").eq("user_id", uid),
        supabase.from("activity").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(6),
        supabase.from("courses").select("*").eq("published", true),
      ]);

      setUser(profile);
      setActivity(act ?? []);

      const avgQuiz = attempts?.length ? Math.round(attempts.reduce((s: number, a: any) => s + a.pct, 0) / attempts.length) : 0;
      setStats({
        enrolled: enrollments?.length ?? 0,
        lessonsCompleted: lessonsDone?.length ?? 0,
        quizAverage: avgQuiz,
        streak: profile?.streak ?? 0,
        xp: profile?.xp ?? 0,
      });

      const enrollMap = new Map(enrollments?.map((e: any) => [e.course_id, e]) ?? []);
      setCourses((allCourses ?? []).map((c: any) => {
        const e = enrollMap.get(c.id) as any;
        return { ...c, enrolled: !!e, progress: e?.progress_pct ?? 0, status: !e ? "new" : e.completed_at ? "done" : "progress" };
      }).filter((c: any) => c.enrolled));

      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (user?.name || "there").split(" ")[0];

  const statCards = [
    { label: "Courses enrolled",  value: stats?.enrolled ?? 0,         change: "Active enrollments",  up: true  },
    { label: "Lessons completed", value: stats?.lessonsCompleted ?? 0,  change: "Keep going!",          up: true  },
    { label: "Quiz average",      value: `${stats?.quizAverage ?? 0}%`, change: stats?.quizAverage >= 80 ? "Excellent!" : "Room to improve", up: stats?.quizAverage >= 70 },
    { label: "Current streak",    value: `${stats?.streak ?? 0} 🔥`,   change: `${stats?.xp ?? 0} XP total`, up: true },
  ];

  return (
    <div>
      <div className="ph" style={{ padding: "28px 32px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>{greeting}, {firstName} 👋</h1>
          <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "3px" }}>
            {stats?.streak > 0 ? `You're on a ${stats.streak}-day streak. Keep it going!` : "Welcome back — let's keep learning!"}
          </p>
        </div>
        <Link href="/quiz" style={{ padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", fontWeight: 500, background: "var(--accent)", color: "#fff", textDecoration: "none" }}>
          Start Quiz →
        </Link>
      </div>

      <div className="pv" style={{ padding: "0 32px" }}>
        {/* Stats */}
        <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", margin: "24px 0" }}>
          {statCards.map((s) => (
            <div key={s.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px 20px" }}>
              <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 500, marginBottom: "8px" }}>{s.label}</p>
              <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "12px", marginTop: "6px", color: s.up ? "var(--green)" : "var(--muted)" }}>{s.change}</p>
            </div>
          ))}
        </div>

        <div className="rg-2" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Continue learning */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Continue learning</p>
              {courses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "12px" }}>No courses enrolled yet</p>
                  <Link href="/courses" style={{ padding: "8px 16px", background: "var(--accent)", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "13px" }}>Browse courses</Link>
                </div>
              ) : courses.filter((c: any) => c.status === "progress").slice(0, 3).map((c: any) => (
                <Link key={c.id} href="/lessons" style={{ display: "flex", alignItems: "center", gap: "14px", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", textDecoration: "none" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: c.thumb_gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{c.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--muted)" }}>{c.total_lessons} lessons</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <div style={{ width: "60px", background: "var(--bg4)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "99px", background: c.bar_color, width: `${c.progress}%` }} />
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "monospace" }}>{c.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Weekly chart */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Weekly activity</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px" }}>
                {[3,7,5,9,6,8,4].map((v, i) => (
                  <div key={i} style={{ flex: 1, height: `${Math.round((v/9)*100)}%`, background: "#7c6af7", borderRadius: "4px 4px 0 0", opacity: i===6?1:0.5 }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                {["M","T","W","T","F","S","S"].map((d,i) => <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "10px", color: "var(--muted)", fontFamily: "monospace" }}>{d}</div>)}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Streak */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "14px" }}>Streak</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--amber)" }}>{stats?.streak ?? 0}</span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>Day streak</p>
                  <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>Don't break it today!</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px" }}>
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <div key={i} style={{ height: "24px", borderRadius: "4px", background: i < (stats?.streak ?? 0) % 7 ? "rgba(124,106,247,0.35)" : "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "var(--muted)", fontFamily: "monospace" }}>{d}</div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Recent activity</p>
              {activity.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>No activity yet</p>
              ) : activity.map((item: any, i: number) => (
                <div key={item.id} style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: i < activity.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, marginTop: "5px", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--text)" }}>{item.title}</p>
                    <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
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
