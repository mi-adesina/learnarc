"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useThemeStore } from "@/store/themeStore";

const navItems = [
  { href: "/dashboard", icon: "▦", label: "Dashboard" },
  { href: "/courses",   icon: "◈", label: "Courses"   },
  { href: "/lessons",   icon: "▶", label: "Lessons"   },
  { href: "/quiz",      icon: "❓", label: "Quiz Arena" },
  { href: "/progress",  icon: "◎", label: "Progress"  },
  { href: "/settings",  icon: "⚙", label: "Settings"  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isDark, toggle } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data, error }) => {
      console.log("SESSION:", data?.session?.user?.id, "ERROR:", error);

      if (!data?.session) {
        console.log("No session — redirecting to login");
        router.replace("/login");
        setLoading(false);
        return;
      }

      supabase
        .from("profiles")
        .select("*")
        .eq("id", data.session.user.id)
        .single()
        .then(({ data: profile, error: profileError }: any) => {
          console.log("PROFILE:", profile, "ERROR:", profileError);
          if (profile) {
            setUser(profile);
            if (!profile.onboarding_complete) {
              router.replace("/onboarding");
            }
          } else {
            // Profile missing — create it on the fly
            supabase.from("profiles").insert({
              id: data.session!.user.id,
              name: data.session!.user.email?.split("@")[0] || "User",
              role: "student",
              onboarding_complete: false,
              xp: 0,
              streak: 0,
            }).then(() => {
              router.replace("/onboarding");
            });
          }
          setLoading(false);
        });
    });
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "32px", height: "32px", border: "2px solid var(--border2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <p style={{ fontSize: "13px", color: "var(--muted)" }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return null;

  const initials = (user.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const SidebarInner = () => (
    <>
      <div style={{ padding: "24px 20px 20px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: "32px", height: "32px", background: "var(--accent)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
        <div style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.3px", color: "var(--text)" }}>
          Learn<span style={{ color: "var(--accent2)" }}>Arc</span>
        </div>
      </div>
      <nav style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--muted)", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 8px", marginBottom: "6px" }}>Main</p>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", fontSize: "13.5px", color: active ? "var(--accent3)" : "var(--muted)", background: active ? "rgba(124,106,247,0.15)" : "transparent", textDecoration: "none", marginBottom: "2px", transition: "all 0.15s" }}>
              <span style={{ width: "18px", textAlign: "center", fontSize: "15px" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        {user.role === "admin" && (
          <>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--muted)", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 8px", margin: "16px 0 6px" }}>Admin</p>
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", fontSize: "13.5px", color: pathname.startsWith("/admin") ? "var(--accent3)" : "var(--muted)", background: pathname.startsWith("/admin") ? "rgba(124,106,247,0.15)" : "transparent", textDecoration: "none", marginBottom: "2px" }}>
              <span style={{ width: "18px", textAlign: "center" }}>🛡</span> Admin Panel
            </Link>
          </>
        )}
      </nav>
      <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "10px", background: "var(--bg3)" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--pink))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#fff", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>{user.xp ?? 0} XP</span>
          </div>
          <button onClick={toggle} style={{ background: "var(--bg4)", border: "none", color: "var(--muted)", cursor: "pointer", borderRadius: "6px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>
            {isDark ? "☀" : "🌙"}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside id="desktop-sidebar" style={{ width: "240px", flexShrink: 0, background: "var(--bg2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <SidebarInner />
      </aside>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, display: "flex" }}>
          <aside onClick={(e) => e.stopPropagation()} style={{ width: "240px", height: "100%", background: "var(--bg2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
            <SidebarInner />
          </aside>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div id="mobile-topbar" style={{ padding: "14px 20px", background: "var(--bg2)", borderBottom: "1px solid var(--border)", alignItems: "center", justifyContent: "space-between", display: "none" }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", color: "var(--text)", fontSize: "20px", cursor: "pointer", padding: "2px 6px" }}>☰</button>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>Learn<span style={{ color: "var(--accent2)" }}>Arc</span></div>
          <div style={{ width: "32px" }} />
        </div>
        <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)", paddingBottom: "40px" }}>
          {children}
        </main>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          #desktop-sidebar { display: none !important; }
          #mobile-topbar   { display: flex !important; }
        }
        @media (max-width: 640px) {
          .rg-4 { grid-template-columns: repeat(2,1fr) !important; }
          .rg-3 { grid-template-columns: 1fr !important; }
          .rg-2 { grid-template-columns: 1fr !important; }
          .rg-admin { grid-template-columns: repeat(2,1fr) !important; }
          .ph { padding: 20px 16px 0 !important; }
          .pv { padding: 0 16px !important; }
        }
      `}</style>
    </div>
  );
}