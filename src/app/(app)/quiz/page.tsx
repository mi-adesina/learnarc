"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const LETTERS = ["A","B","C","D"];

export default function QuizPage() {
  const [uid, setUid]           = useState<string|null>(null);
  const [courses, setCourses]   = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [step, setStep]         = useState<"pick"|"quiz"|"result">("pick");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers]   = useState<number[]>([]);
  const [chosen, setChosen]     = useState(-1);
  const [answered, setAnswered] = useState(false);
  const [score, setScore]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState("");
  const timerRef                = useRef<any>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data?.session) return;
      setUid(data.session.user.id);
      const [{ data: allCourses }, { data: enrollments }] = await Promise.all([
        supabase.from("courses").select("*").eq("published", true),
        supabase.from("enrollments").select("course_id").eq("user_id", data.session.user.id),
      ]);
      const enrolledIds = new Set(enrollments?.map((e: any) => e.course_id) ?? []);
      setCourses((allCourses ?? []).filter((c: any) => enrolledIds.has(c.id)));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (step !== "quiz") { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); finishQuiz(score, answers); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const startQuiz = async (course: any) => {
    setLoading(true);
    const supabase = createClient();
    const { data: qs } = await supabase.from("quiz_questions").select("*").eq("course_id", course.id).order("order_index");
    if (!qs?.length) { showToast("No questions for this course yet."); setLoading(false); return; }
    setSelected(course);
    setQuestions(qs);
    setCurrentQ(0); setAnswers([]); setChosen(-1); setAnswered(false); setScore(0);
    setTimeLeft(qs.length * 60);
    setStep("quiz");
    setLoading(false);
  };

  const handleSubmit = () => {
    if (chosen === -1 || answered) return;
    const correct = questions[currentQ].correct_index === chosen;
    setAnswers((prev) => [...prev, chosen]);
    setAnswered(true);
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      finishQuiz(score + (answered && chosen === questions[currentQ].correct_index ? 0 : 0), [...answers]);
    } else {
      setCurrentQ((q) => q + 1);
      setChosen(-1);
      setAnswered(false);
    }
  };

  const finishQuiz = async (finalScore: number, finalAnswers: number[]) => {
    clearInterval(timerRef.current);
    setSaving(true);
    const pct = Math.round((finalScore / questions.length) * 100);
    if (uid) {
      const supabase = createClient();
      await (supabase.from("quiz_attempts") as any).insert({ user_id: uid, course_id: selected.id, score: finalScore, total: questions.length, pct, answers: finalAnswers });
      await (supabase.from("activity") as any).insert({ user_id: uid, type: "quiz_complete", title: `Scored ${pct}% on ${selected.title}`, color: "#7c6af7" });
    }
    setScore(finalScore);
    setSaving(false);
    setStep("result");
  };

  const m = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const s = String(timeLeft%60).padStart(2,"0");

  if (loading) return <Loader />;

  if (step === "pick") return (
    <div>
      {toast && <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "var(--bg2)", border: "1px solid var(--accent)", borderLeft: "3px solid var(--accent)", borderRadius: "10px", padding: "12px 16px", fontSize: "13.5px", color: "var(--text)", zIndex: 9999 }}>{toast}</div>}
      <div className="ph" style={{ padding: "28px 32px 0" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>Quiz Arena</h1>
        <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "3px" }}>Pick a course to start</p>
      </div>
      <div className="pv" style={{ padding: "24px 32px 0", maxWidth: "600px" }}>
        {courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>No enrolled courses</p>
            <Link href="/courses" style={{ display: "inline-block", marginTop: "12px", padding: "9px 18px", background: "var(--accent)", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "13px" }}>Browse courses</Link>
          </div>
        ) : courses.map((c: any) => (
          <div key={c.id} onClick={() => startQuiz(c)} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", cursor: "pointer", marginBottom: "12px", transition: "border-color 0.15s" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: c.thumb_gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{c.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{c.title}</p>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>{c.difficulty}</p>
            </div>
            <span style={{ fontSize: "20px", color: "var(--muted)" }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === "result") {
    const pct = Math.round((score/questions.length)*100);
    const color = pct>=80?"var(--green)":pct>=60?"var(--amber)":"var(--red)";
    return (
      <div style={{ padding: "28px 32px", display: "flex", justifyContent: "center" }}>
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "16px", padding: "40px", textAlign: "center", maxWidth: "440px", width: "100%" }}>
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>🎯</div>
          <div style={{ fontSize: "64px", fontWeight: 700, letterSpacing: "-2px", color, lineHeight: 1 }}>{pct}%</div>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>{pct>=80?"Excellent!":pct>=60?"Good effort!":"Keep practicing!"} {score}/{questions.length} correct</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", margin: "24px 0" }}>
            {[{v:score,l:"Correct",c:"var(--green)"},{v:questions.length-score,l:"Wrong",c:"var(--red)"},{v:`${pct}%`,l:"Score",c:"var(--accent)"}].map((x) => (
              <div key={x.l} style={{ background: "var(--bg3)", borderRadius: "10px", padding: "14px" }}>
                <p style={{ fontSize: "22px", fontWeight: 700, color: x.c }}>{x.v}</p>
                <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>{x.l}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={() => startQuiz(selected)} style={{ padding: "9px 18px", background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>Retry</button>
            <button onClick={() => setStep("pick")} style={{ padding: "9px 18px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>Pick another</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const pct = Math.round(((currentQ+1)/questions.length)*100);
  return (
    <div>
      <div className="ph" style={{ padding: "28px 32px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>Quiz Arena</h1>
          <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "3px" }}>{selected?.title}</p>
        </div>
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontFamily: "monospace", color: timeLeft < 60 ? "var(--red)" : "var(--amber)" }}>
          ⏱ {m}:{s}
        </div>
      </div>
      <div className="pv" style={{ padding: "24px 32px 0", maxWidth: "640px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <span style={{ fontSize: "13px", color: "var(--muted)", flexShrink: 0 }}>{currentQ+1}/{questions.length}</span>
          <div style={{ flex: 1, background: "var(--bg4)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg,var(--accent),var(--pink))", width: `${pct}%`, transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: "13px", fontFamily: "monospace", color: "var(--green)", flexShrink: 0 }}>Score: {score}</span>
        </div>
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
          <p style={{ fontSize: "16px", fontWeight: 500, color: "var(--text)", lineHeight: 1.6, marginBottom: "24px" }}>{q.question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {q.options.map((opt: string, i: number) => {
              let bc = "var(--border)", bg = "transparent", color = "var(--muted)";
              if (answered) {
                if (i === q.correct_index) { bc="var(--green)"; bg="rgba(52,211,153,0.08)"; color="var(--green)"; }
                else if (i === chosen && i !== q.correct_index) { bc="var(--red)"; bg="rgba(248,113,113,0.08)"; color="var(--red)"; }
              } else if (i === chosen) { bc="var(--accent)"; bg="rgba(124,106,247,0.1)"; color="var(--accent3)"; }
              return (
                <div key={i} onClick={() => !answered && setChosen(i)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", border: `1.5px solid ${bc}`, borderRadius: "10px", cursor: answered?"default":"pointer", background: bg, color, transition: "all 0.15s", fontSize: "14px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, flexShrink: 0, fontFamily: "monospace" }}>{LETTERS[i]}</div>
                  {opt}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          {!answered ? (
            <>
              <button onClick={handleNext} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>Skip</button>
              <button onClick={handleSubmit} disabled={chosen===-1} style={{ padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", cursor: chosen===-1?"not-allowed":"pointer", opacity: chosen===-1?0.5:1 }}>Submit →</button>
            </>
          ) : (
            <button onClick={handleNext} style={{ padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>
              {currentQ+1 >= questions.length ? "See results →" : "Next →"}
            </button>
          )}
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
