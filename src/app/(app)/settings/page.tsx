"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useThemeStore } from "@/store/themeStore";

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <div onClick={onToggle} style={{ width: "44px", height: "24px", background: on?"var(--accent)":"var(--bg4)", borderRadius: "99px", cursor: "pointer", position: "relative", transition: "background 0.2s", border: on?"none":"1px solid var(--border2)", flexShrink: 0 }}>
    <div style={{ width: "20px", height: "20px", background: on?"#fff":"var(--muted)", borderRadius: "50%", position: "absolute", top: "2px", transition: "all 0.2s", ...(on?{right:"2px"}:{left:"2px"}) }} />
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const { isDark, toggle } = useThemeStore();
  const [user, setUser]     = useState<any>(null);
  const [name, setName]     = useState("");
  const [notifs, setNotifs] = useState(true);
  const [streak, setStreak] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logging, setLogging] = useState(false);
  const [toast, setToast]   = useState({ msg: "", type: "success" });

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "success" }), 3000); };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data?.session) return;
      const { data: profile } = await (supabase.from("profiles") as any).select("*").eq("id", data.session.user.id).single();
      if (profile) { setUser(profile); setName(profile.name); }
    });
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await (supabase.from("profiles")as any).update({ name }).eq("id", user.id);
    if (error) showToast(error.message, "error");
    else { setUser((u: any) => ({ ...u, name })); showToast("Profile updated ✓"); }
    setSaving(false);
  };

  const handleLogout = async () => {
    setLogging(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const initials = (user?.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase();

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", padding: "11px 14px", borderRadius: "9px", fontSize: "14px", fontFamily: "inherit", outline: "none" };

  return (
    <div>
      {toast.msg && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "var(--bg2)", border: `1px solid ${toast.type==="error"?"var(--red)":"var(--green)"}`, borderLeft: `3px solid ${toast.type==="error"?"var(--red)":"var(--green)"}`, borderRadius: "10px", padding: "12px 16px", fontSize: "13.5px", color: "var(--text)", zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}

      <div className="ph" style={{ padding: "28px 32px 0" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>Settings</h1>
        <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "3px" }}>Manage your account and preferences</p>
      </div>

      <div className="pv" style={{ padding: "24px 32px 0", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Profile */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "18px" }}>Profile</p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--pink))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 600, color: "#fff", flexShrink: 0 }}>{initials}</div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>{user?.name}</p>
              <p style={{ fontSize: "13px", color: "var(--muted)" }}>{user?.email}</p>
              <p style={{ fontSize: "11px", color: "var(--accent3)", marginTop: "2px", textTransform: "capitalize" }}>{user?.role} · {user?.xp ?? 0} XP</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }} className="rg-2">
            <div>
              <label style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "7px", fontWeight: 500, display: "block" }}>Display name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "7px", fontWeight: 500, display: "block" }}>Email</label>
              <input value={user?.email || ""} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 18px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", fontWeight: 500, cursor: saving?"wait":"pointer", opacity: saving?0.7:1 }}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {/* Preferences */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "18px" }}>Preferences</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {[
              { label: "Dark mode",           sub: "Toggle between dark and light theme",  on: isDark,  fn: toggle            },
              { label: "Email notifications", sub: "Receive daily learning reminders",     on: notifs,  fn: () => setNotifs(!notifs) },
              { label: "Streak reminders",    sub: "Alert me before I break my streak",    on: streak,  fn: () => setStreak(!streak) },
            ].map((p) => (
              <div key={p.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "14px", color: "var(--text)", fontWeight: 500 }}>{p.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>{p.sub}</p>
                </div>
                <Toggle on={p.on} onToggle={p.fn} />
              </div>
            ))}
          </div>
        </div>

        {/* Danger */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "14px" }}>Account</p>
          <button onClick={handleLogout} disabled={logging} style={{ padding: "9px 18px", background: "rgba(248,113,113,0.1)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", fontWeight: 500, cursor: logging?"wait":"pointer" }}>
            {logging ? "Signing out..." : "Sign out of LearnArc"}
          </button>
        </div>
      </div>
    </div>
  );
}
