import { skillLevels } from "@/lib/data";

export default function SkillLevels() {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Skill levels</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {skillLevels.map((skill) => (
          <div key={skill.name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
              <span style={{ color: "var(--text)" }}>{skill.name}</span>
              <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>{skill.level}%</span>
            </div>
            <div style={{ background: "var(--bg4)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "99px", background: skill.color, width: `${skill.level}%`, transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
