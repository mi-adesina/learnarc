"use client";
import { useQuizStore } from "@/store/quizStore";
import { quizQuestions } from "@/lib/data";

const letters = ["A", "B", "C", "D"];

export default function QuizArena() {
  const { currentQ, selected, score, answered, finished, selectOption, submitAnswer, nextQuestion, skipQuestion, reset } = useQuizStore();

  if (finished) return <QuizResults score={score} total={quizQuestions.length} onReset={reset} />;

  const q = quizQuestions[currentQ];
  const pct = Math.round(((currentQ + 1) / quizQuestions.length) * 100);

  return (
    <div style={{ maxWidth: "640px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <span style={{ fontSize: "13px", color: "var(--muted)" }}>Question {currentQ + 1} of {quizQuestions.length}</span>
        <div style={{ flex: 1, margin: "0 16px", background: "var(--bg4)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg,var(--accent),var(--pink))", width: `${pct}%`, transition: "width 0.4s ease" }} />
        </div>
        <span style={{ fontSize: "13px", fontFamily: "monospace", color: "var(--green)" }}>Score: {score}</span>
      </div>

      {/* Question */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
        <p style={{ fontSize: "16px", fontWeight: 500, color: "var(--text)", lineHeight: 1.6, marginBottom: "24px" }}>{q.q}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.opts.map((opt, i) => {
            let borderColor = "var(--border)";
            let bg = "transparent";
            let color = "var(--muted)";
            if (answered) {
              if (i === q.ans) { borderColor = "var(--green)"; bg = "rgba(52,211,153,0.08)"; color = "var(--green)"; }
              else if (i === selected && i !== q.ans) { borderColor = "var(--red)"; bg = "rgba(248,113,113,0.08)"; color = "var(--red)"; }
            } else if (i === selected) {
              borderColor = "var(--accent)"; bg = "rgba(124,106,247,0.1)"; color = "var(--accent3)";
            }
            return (
              <div key={i} onClick={() => selectOption(i)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", border: `1.5px solid ${borderColor}`, borderRadius: "10px", cursor: answered ? "default" : "pointer", background: bg, color, transition: "all 0.15s", fontSize: "14px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, flexShrink: 0, fontFamily: "monospace" }}>
                  {letters[i]}
                </div>
                {opt}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        {!answered ? (
          <>
            <button onClick={skipQuestion} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", fontWeight: 500, cursor: "pointer", background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)" }}>Skip</button>
            <button onClick={submitAnswer} disabled={selected === -1} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", fontWeight: 500, cursor: selected === -1 ? "not-allowed" : "pointer", background: "var(--accent)", color: "#fff", border: "none", opacity: selected === -1 ? 0.5 : 1 }}>Submit →</button>
          </>
        ) : (
          <button onClick={nextQuestion} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", fontWeight: 500, cursor: "pointer", background: "var(--accent)", color: "#fff", border: "none" }}>Next →</button>
        )}
      </div>
    </div>
  );
}

function QuizResults({ score, total, onReset }: { score: number; total: number; onReset: () => void }) {
  const pct = Math.round((score / total) * 100);
  const color = pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)";
  const msg = pct >= 80 ? "Excellent work!" : pct >= 60 ? "Good effort!" : "Keep practicing!";

  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "16px", padding: "36px", textAlign: "center", maxWidth: "480px" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎯</div>
      <div style={{ fontSize: "64px", fontWeight: 700, letterSpacing: "-2px", color, lineHeight: 1 }}>{pct}%</div>
      <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>{msg} You scored {score} out of {total}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", margin: "24px 0" }}>
        <div style={{ background: "var(--bg3)", borderRadius: "10px", padding: "14px" }}>
          <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--green)" }}>{score}</p>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>Correct</p>
        </div>
        <div style={{ background: "var(--bg3)", borderRadius: "10px", padding: "14px" }}>
          <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--red)" }}>{total - score}</p>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>Wrong</p>
        </div>
        <div style={{ background: "var(--bg3)", borderRadius: "10px", padding: "14px" }}>
          <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent)" }}>{pct}%</p>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>Score</p>
        </div>
      </div>
      <button onClick={onReset} style={{ width: "100%", padding: "12px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", fontWeight: 500, cursor: "pointer" }}>
        Try Again
      </button>
    </div>
  );
}
