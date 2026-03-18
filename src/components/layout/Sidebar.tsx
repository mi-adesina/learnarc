"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";

const navItems = [
  { href: "/dashboard", icon: "▦", label: "Dashboard" },
  { href: "/courses", icon: "◈", label: "Courses", badge: "3" },
  { href: "/lessons", icon: "▶", label: "Lessons" },
];

const learnItems = [
  { href: "/quiz", icon: "❓", label: "Quiz Arena" },
  { href: "/progress", icon: "◎", label: "Progress" },
];

const accountItems = [
  { href: "/settings", icon: "⚙", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  return (
    <aside style={{ width: "240px", flexShrink: 0, background: "var(--bg2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: "32px", height: "32px", background: "var(--accent)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
        <div style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.3px", color: "var(--text)" }}>
          Learn<span style={{ color: "var(--accent2)" }}>Arc</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <NavSection label="Main" items={navItems} pathname={pathname} />
        <NavSection label="Learn" items={learnItems} pathname={pathname} />
        <NavSection label="Account" items={accountItems} pathname={pathname} />
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "10px", background: "var(--bg3)" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--pink))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, color: "#fff", flexShrink: 0 }}>
            {user?.avatar || "AJ"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Pro learner</span>
          </div>
          <button onClick={toggle} title="Toggle theme" style={{ background: "var(--bg4)", border: "none", color: "var(--muted)", cursor: "pointer", borderRadius: "6px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>
            {isDark ? "☀" : "🌙"}
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavSection({ label, items, pathname }: { label: string; items: typeof navItems; pathname: string }) {
  return (
    <>
      <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--muted)", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 8px", margin: "16px 0 6px" }}>{label}</p>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13.5px", color: active ? "var(--accent3)" : "var(--muted)", background: active ? "rgba(124,106,247,0.15)" : "transparent", textDecoration: "none", marginBottom: "2px", transition: "all 0.15s" }}>
            <span style={{ width: "18px", textAlign: "center", fontSize: "15px" }}>{item.icon}</span>
            {item.label}
            {item.badge && (
              <span style={{ marginLeft: "auto", background: "var(--accent)", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "99px", fontWeight: 600 }}>{item.badge}</span>
            )}
          </Link>
        );
      })}
    </>
  );
}
