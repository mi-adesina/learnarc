"use client";
import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ── ProgressBar ───────────────────────────────────────────────
export function ProgressBar({ value, color, height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div style={{ background: "var(--bg4)", borderRadius: "99px", height, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: "99px", background: color || "linear-gradient(90deg,var(--accent),var(--pink))", width: `${Math.min(100, value)}%`, transition: "width 0.5s ease" }} />
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 20, color = "var(--accent)" }: { size?: number; color?: string }) {
  return (
    <div style={{ width: size, height: size, border: `2px solid var(--border2)`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
  );
}

// ── Button ────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  size?: "sm" | "md";
}
export function Button({ variant = "primary", loading, size = "md", children, disabled, style, ...props }: BtnProps) {
  const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", borderRadius: "8px", fontFamily: "inherit", fontWeight: 500, cursor: disabled || loading ? "not-allowed" : "pointer", border: "none", transition: "all 0.15s", opacity: disabled || loading ? 0.6 : 1, padding: size === "sm" ? "6px 12px" : "9px 18px", fontSize: size === "sm" ? "12px" : "13px" };
  const variants = {
    primary: { background: "var(--accent)", color: "#fff" },
    ghost: { background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)" },
    danger: { background: "rgba(248,113,113,0.1)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.2)" },
  };
  return (
    <button disabled={disabled || loading} style={{ ...base, ...variants[variant], ...style }} {...props}>
      {loading && <Spinner size={14} color={variant === "primary" ? "#fff" : "var(--accent)"} />}
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────
const badgeVariants: Record<string, { bg: string; color: string }> = {
  new: { bg: "rgba(124,106,247,0.2)", color: "var(--accent3)" },
  progress: { bg: "rgba(251,191,36,0.15)", color: "var(--amber)" },
  done: { bg: "rgba(52,211,153,0.15)", color: "var(--green)" },
  beginner: { bg: "rgba(52,211,153,0.15)", color: "var(--green)" },
  intermediate: { bg: "rgba(251,191,36,0.15)", color: "var(--amber)" },
  advanced: { bg: "rgba(248,113,113,0.15)", color: "var(--red)" },
  admin: { bg: "rgba(124,106,247,0.2)", color: "var(--accent3)" },
  published: { bg: "rgba(52,211,153,0.15)", color: "var(--green)" },
  draft: { bg: "rgba(136,136,153,0.2)", color: "var(--muted)" },
};
export function Badge({ variant, label }: { variant: string; label?: string }) {
  const style = badgeVariants[variant] ?? { bg: "var(--bg3)", color: "var(--muted)" };
  return (
    <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "99px", fontWeight: 600, background: style.bg, color: style.color, whiteSpace: "nowrap" }}>
      {label ?? variant}
    </span>
  );
}

// ── EmptyState ────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <div style={{ fontSize: "40px" }}>{icon}</div>
      <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>{title}</p>
      <p style={{ fontSize: "13.5px", color: "var(--muted)", maxWidth: "320px", lineHeight: 1.6 }}>{description}</p>
      {action}
    </div>
  );
}

// ── PageLoader ────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner size={32} />
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
interface Toast { id: string; message: string; type: "success" | "error" | "info" }
const ToastCtx = createContext<{ show: (msg: string, type?: Toast["type"]) => void }>({ show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  const colors = { success: "var(--green)", error: "var(--red)", info: "var(--accent)" };
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: "var(--bg2)", border: `1px solid ${colors[t.type]}`, borderLeft: `3px solid ${colors[t.type]}`, borderRadius: "10px", padding: "12px 16px", fontSize: "13.5px", color: "var(--text)", maxWidth: "320px", boxShadow: "0 4px 24px rgba(0,0,0,0.3)", animation: "slideIn 0.2s ease" }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast() { return useContext(ToastCtx); }

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "16px", width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────
export function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "7px", fontWeight: 500, display: "block" }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: "11.5px", color: "var(--red)", marginTop: "5px" }}>{error}</p>}
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
  color: "var(--text)", padding: "11px 14px", borderRadius: "9px",
  fontSize: "14px", fontFamily: "inherit", outline: "none",
};

// Global keyframes injected once
if (typeof document !== "undefined") {
  const s = document.getElementById("la-global-styles");
  if (!s) {
    const style = document.createElement("style");
    style.id = "la-global-styles";
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
      @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    `;
    document.head.appendChild(style);
  }
}
