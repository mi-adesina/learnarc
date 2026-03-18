"use client";
import { useEffect, useState } from "react";
import { adminGetStats, adminGetAllUsers, getCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { PageLoader, Button, Badge, Modal, FormField, inputStyle, Spinner } from "@/components/ui";
import { useToast } from "@/components/ui";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const [tab, setTab]         = useState<"overview"|"courses"|"users">("overview");
  const [stats, setStats]     = useState<any>(null);
  const [users, setUsers]     = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") router.replace("/dashboard");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    Promise.all([adminGetStats(), adminGetAllUsers(), getCourses()])
      .then(([s, u, c]) => { setStats(s); setUsers(u); setCourses(c); })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSaveCourse = async (data: any) => {
    try {
      if (editCourse?.id) {
        const updated = await adminUpdateCourse(editCourse.id, data);
        setCourses((prev) => prev.map((c) => c.id === editCourse.id ? { ...c, ...updated } : c));
        show("Course updated ✓", "success");
      } else {
        const created = await adminCreateCourse({ ...data, published: true });
        setCourses((prev) => [...prev, created]);
        show("Course created ✓", "success");
      }
      setShowModal(false); setEditCourse(null);
    } catch (err: any) { show(err.message, "error"); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminDeleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      show("Course deleted", "success");
    } catch (err: any) { show(err.message, "error"); }
  };

  if (authLoading || loading) return <PageLoader />;
  if (user?.role !== "admin") return null;

  return (
    <div>
      <div className="ph" style={{ padding: "28px 32px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>🛡 Admin Panel</h1>
          <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "3px" }}>Manage courses, users, and platform data</p>
        </div>
        {tab === "courses" && (
          <Button onClick={() => { setEditCourse(null); setShowModal(true); }}>+ New course</Button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ padding: "20px 32px 0", display: "flex", gap: "2px", borderBottom: "1px solid var(--border)" }}>
        {(["overview","courses","users"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 18px", fontSize: "13.5px", fontFamily: "inherit", cursor: "pointer", border: "none", background: "transparent", color: tab===t ? "var(--text)" : "var(--muted)", fontWeight: tab===t ? 600 : 400, borderBottom: `2px solid ${tab===t ? "var(--accent)" : "transparent"}`, transition: "all 0.15s", textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      <div className="pv" style={{ padding: "24px 32px 0" }}>
        {/* Overview */}
        {tab === "overview" && (
          <div>
            <div className="rg-admin" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" }}>
              {[
                { label: "Total users",      value: stats?.users       ?? 0, color: "var(--accent)", icon: "👤" },
                { label: "Published courses", value: stats?.courses     ?? 0, color: "var(--blue)",   icon: "📚" },
                { label: "Total enrollments", value: stats?.enrollments ?? 0, color: "var(--green)",  icon: "✅" },
                { label: "Quiz attempts",     value: stats?.attempts    ?? 0, color: "var(--amber)",  icon: "❓" },
              ].map((s) => (
                <div key={s.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
                  <p style={{ fontSize: "28px", fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</p>
                  <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "14px" }}>Recent users</p>
              {users.slice(0,5).map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--pink))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                    {(u.name||"U").split(" ").map((n: string)=>n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13.5px", color: "var(--text)", fontWeight: 500 }}>{u.name || "—"}</p>
                    <p style={{ fontSize: "11px", color: "var(--muted)" }}>{u.email}</p>
                  </div>
                  <Badge variant={u.role} label={u.role} />
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses */}
        {tab === "courses" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {courses.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: c.thumb_gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{c.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>{c.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--muted)" }}>{c.total_lessons} lessons · {c.difficulty}</p>
                </div>
                <Badge variant={c.published ? "published" : "draft"} label={c.published ? "Live" : "Draft"} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button size="sm" variant="ghost" onClick={() => { setEditCourse(c); setShowModal(true); }}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(c.id, c.title)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["User","Email","Role","XP","Joined"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < users.length-1 ? "1px solid var(--border)" : "none" }}>
                      <td style={{ padding: "12px 16px", color: "var(--text)", fontWeight: 500 }}>{u.name || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px" }}><Badge variant={u.role} label={u.role} /></td>
                      <td style={{ padding: "12px 16px", color: "var(--accent3)", fontFamily: "monospace" }}>{u.xp ?? 0}</td>
                      <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Course modal */}
      <CourseModal open={showModal} onClose={() => { setShowModal(false); setEditCourse(null); }} course={editCourse} onSave={handleSaveCourse} />
    </div>
  );
}

function CourseModal({ open, onClose, course, onSave }: { open: boolean; onClose: () => void; course: any; onSave: (data: any) => Promise<void> }) {
  const [form, setForm]     = useState({ title: "", description: "", emoji: "📚", difficulty: "beginner", total_hours: 0, total_lessons: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (course) setForm({ title: course.title, description: course.description, emoji: course.emoji, difficulty: course.difficulty, total_hours: course.total_hours, total_lessons: course.total_lessons });
    else setForm({ title: "", description: "", emoji: "📚", difficulty: "beginner", total_hours: 0, total_lessons: 0 });
  }, [course, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title={course ? "Edit course" : "New course"}>
      <form onSubmit={handleSubmit}>
        <FormField label="Title"><input value={form.title} onChange={(e) => set("title", e.target.value)} required style={inputStyle} /></FormField>
        <FormField label="Description"><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <FormField label="Emoji"><input value={form.emoji} onChange={(e) => set("emoji", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Total hours"><input type="number" value={form.total_hours} onChange={(e) => set("total_hours", +e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Lessons"><input type="number" value={form.total_lessons} onChange={(e) => set("total_lessons", +e.target.value)} style={inputStyle} /></FormField>
        </div>
        <FormField label="Difficulty">
          <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} style={{ ...inputStyle }}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </FormField>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{course ? "Save changes" : "Create course"}</Button>
        </div>
      </form>
    </Modal>
  );
}
