"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getBaseUrl } from "@/lib/getBaseUrl";

function LoginForm() {
  const searchParams = useSearchParams();
  const [tab, setTab]           = useState<"login"|"signup">("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
    color: "var(--text)", padding: "11px 14px", borderRadius: "9px",
    fontSize: "14px", fontFamily: "inherit", outline: "none",
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (tab === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      if (tab === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email, password, options: { data: { name } },
        });
        if (err) throw err;
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setTab("login");
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.session) window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${getBaseUrl()}/auth/callback` },
    });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", justifyContent: "center" }}>
          <div style={{ width: "36px", height: "36px", background: "var(--accent)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⚡</div>
          <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px", color: "var(--text)" }}>
            Learn<span style={{ color: "var(--accent2)" }}>Arc</span>
          </div>
        </div>

        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "20px", padding: "32px" }}>
          <div style={{ display: "flex", background: "var(--bg3)", borderRadius: "10px", padding: "3px", marginBottom: "24px" }}>
            {(["login","signup"] as const).map((t) => (
              <button key={t} type="button" onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                style={{ flex: 1, textAlign: "center", padding: "8px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer", borderRadius: "8px", border: "none", background: tab===t?"var(--bg2)":"transparent", color: tab===t?"var(--text)":"var(--muted)", fontWeight: tab===t?500:400, transition: "all 0.15s" }}>
                {t === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "var(--red)" }}>{error}</div>}
          {success && <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "var(--green)" }}>{success}</div>}

          {tab === "signup" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "7px", fontWeight: 500, display: "block" }}>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "7px", fontWeight: 500, display: "block" }}>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "7px", fontWeight: 500, display: "block" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              style={inputStyle} />
          </div>
          {tab === "login" && (
            <div style={{ textAlign: "right", marginBottom: "16px", marginTop: "-8px" }}>
              <span style={{ fontSize: "12px", color: "var(--accent3)", cursor: "pointer" }}>Forgot password?</span>
            </div>
          )}

          <button type="button" onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "12px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", fontWeight: 500, cursor: loading?"not-allowed":"pointer", opacity: loading?0.7:1 }}>
            {loading ? "Please wait..." : tab==="login" ? "Sign in →" : "Create account →"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0", color: "var(--muted)", fontSize: "12px" }}>
            <div style={{ flex: 1, borderTop: "1px solid var(--border)" }} />or continue with<div style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
          </div>

          <button type="button" onClick={handleGoogle}
            style={{ width: "100%", padding: "10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text)", fontSize: "14px", fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            🔵 Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}><LoginForm /></Suspense>;
}