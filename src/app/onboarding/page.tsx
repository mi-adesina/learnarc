"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOALS = ["Get a new job", "Build side projects", "Upskill at work", "Learn for fun", "Start freelancing", "Build a startup"];
const EXPERIENCE = [
  { value: "beginner",     label: "Beginner",     desc: "Just starting out, < 1 year"       },
  { value: "intermediate", label: "Intermediate", desc: "1–3 years of experience"            },
  { value: "advanced",     label: "Advanced",     desc: "3+ years, know the fundamentals"   },
];
const HOURS = [2, 5, 10, 20];

export default function OnboardingPage() {
  const router = useRouter();
  const [uid, setUid]           = useState<string | null>(null);
  const [step, setStep]         = useState(0);
  const [name, setName]         = useState("");
  const [goals, setGoals]       = useState<string[]>([]);
  const [experience, setExp]    = useState("intermediate");
  const [hours, setHours]       = useState(5);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) { router.replace("/login"); return; }
      setUid(data.session.user.id);
      // If already onboarded, go to dashboard
      supabase.from("profiles").select("onboarding_complete, name").eq("id", data.session.user.id).single()
        .then(({ data: profile }) => {
          if (profile?.onboarding_complete) router.replace("/dashboard");
          if (profile?.name) setName(profile.name);
        });
    });
  }, []);

  const steps = [
    {
      title: "What should we call you?",
      sub: "This is how you'll appear on LearnArc.",
      content: (
        <div style={{ maxWidth: "360px", margin: "0 auto" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus
            style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", padding: "14px 18px", borderRadius: "12px", fontSize: "16px", fontFamily: "inherit", outline: "none", textAlign: "center" }} />
        </div>
      ),
      valid: name.trim().length > 0,
    },
    {
      title: "What are your learning goals?",
      sub: "Select all that apply — we'll tailor your experience.",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px", maxWidth: "480px", margin: "0 auto" }}>
          {GOALS.map((g) => {
            const sel = goals.includes(g);
            return (
              <button key={g} onClick={() => setGoals(sel ? goals.filter((x) => x !== g) : [...goals, g])}
                style={{ padding: "14px 16px", borderRadius: "12px", border: `1.5px solid ${sel?"var(--accent)":"var(--border)"}`, background: sel?"rgba(124,106,247,0.1)":"var(--bg3)", color: sel?"var(--accent3)":"var(--muted)", fontSize: "13.5px", fontFamily: "inherit", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                {g}
              </button>
            );
          })}
        </div>
      ),
      valid: goals.length > 0,
    },
    {
      title: "What's your experience level?",
      sub: "We'll recommend the right courses for you.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px", margin: "0 auto" }}>
          {EXPERIENCE.map((e) => {
            const sel = experience === e.value;
            return (
              <button key={e.value} onClick={() => setExp(e.value)}
                style={{ padding: "16px 20px", borderRadius: "12px", border: `1.5px solid ${sel?"var(--accent)":"var(--border)"}`, background: sel?"rgba(124,106,247,0.1)":"var(--bg3)", color: "var(--text)", fontSize: "14px", fontFamily: "inherit", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: "3px", transition: "all 0.15s" }}>
                <span style={{ fontWeight: 600, color: sel?"var(--accent3)":"var(--text)" }}>{e.label}</span>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>{e.desc}</span>
              </button>
            );
          })}
        </div>
      ),
      valid: true,
    },
    {
      title: "How many hours per week?",
      sub: "Be realistic — consistency beats intensity.",
      content: (
        <div style={{ display: "flex", gap: "12px", maxWidth: "400px", margin: "0 auto", justifyContent: "center" }}>
          {HOURS.map((h) => {
            const sel = hours === h;
            return (
              <button key={h} onClick={() => setHours(h)}
                style={{ width: "80px", height: "80px", borderRadius: "16px", border: `1.5px solid ${sel?"var(--accent)":"var(--border)"}`, background: sel?"rgba(124,106,247,0.1)":"var(--bg3)", color: sel?"var(--accent3)":"var(--muted)", fontSize: "22px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", transition: "all 0.15s" }}>
                <span>{h}</span>
                <span style={{ fontSize: "10px", fontWeight: 400 }}>hrs/wk</span>
              </button>
            );
          })}
        </div>
      ),
      valid: true,
    },
  ];

  const current = steps[step];
  const isLast  = step === steps.length - 1;

  const handleNext = async () => {
    if (!current.valid || !uid) return;
    if (isLast) {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        const { error: err } = await supabase.from("profiles").update({
          name,
          goals,
          experience,
          hours_per_week: hours,
          onboarding_complete: true,
        }).eq("id", uid);
        if (err) throw err;
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "48px" }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i===step?"24px":"8px", height: "8px", borderRadius: "99px", background: i<=step?"var(--accent)":"var(--bg4)", transition: "all 0.3s" }} />
        ))}
      </div>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "48px" }}>
        <div style={{ width: "28px", height: "28px", background: "var(--accent)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚡</div>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>Learn<span style={{ color: "var(--accent2)" }}>Arc</span></span>
      </div>

      {/* Content */}
      <div style={{ width: "100%", maxWidth: "560px", textAlign: "center" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", marginBottom: "10px" }}>{current.title}</h1>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "36px", lineHeight: 1.6 }}>{current.sub}</p>
        {current.content}
        {error && <p style={{ fontSize: "13px", color: "var(--red)", marginTop: "16px" }}>{error}</p>}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: "12px", marginTop: "48px", alignItems: "center" }}>
        {step > 0 && (
          <button onClick={() => setStep(step-1)} style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>← Back</button>
        )}
        <button onClick={handleNext} disabled={!current.valid || loading}
          style={{ minWidth: "140px", padding: "12px 24px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", fontWeight: 500, cursor: (!current.valid||loading)?"not-allowed":"pointer", opacity: (!current.valid||loading)?0.6:1 }}>
          {loading ? "Saving..." : isLast ? "Start learning →" : "Continue →"}
        </button>
      </div>

      <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "24px" }}>Step {step+1} of {steps.length}</p>
    </div>
  );
}