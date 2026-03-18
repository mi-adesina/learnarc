export const courses = [
  { id: "1", title: "Advanced React Development", emoji: "🚀", hours: 12, lessons: 24, progress: 65, status: "progress", color: "linear-gradient(90deg, #60a5fa, #a78bfa)", thumb: "linear-gradient(135deg,#1a1a2e,#16213e)" },
  { id: "2", title: "JavaScript Pro Patterns", emoji: "⚡", hours: 8, lessons: 18, progress: 88, status: "progress", color: "linear-gradient(90deg, #fbbf24, #f472b6)", thumb: "linear-gradient(135deg,#1a2e1e,#0d2112)" },
  { id: "3", title: "CSS Mastery & Design Systems", emoji: "🎨", hours: 6, lessons: 15, progress: 30, status: "new", color: "linear-gradient(90deg, #34d399, #60a5fa)", thumb: "linear-gradient(135deg,#2e1a2e,#1e0d2e)" },
  { id: "4", title: "Node.js & Express APIs", emoji: "🟢", hours: 10, lessons: 20, progress: 100, status: "done", color: "linear-gradient(90deg, #34d399, #7c6af7)", thumb: "linear-gradient(135deg,#1e2a1e,#0d1e0d)" },
  { id: "5", title: "TypeScript Fundamentals", emoji: "🔷", hours: 7, lessons: 16, progress: 0, status: "new", color: "linear-gradient(90deg, #60a5fa, #a78bfa)", thumb: "linear-gradient(135deg,#1a1a2e,#0a1a2e)" },
  { id: "6", title: "MongoDB & Database Design", emoji: "🗄", hours: 5, lessons: 12, progress: 100, status: "done", color: "linear-gradient(90deg, #34d399, #7c6af7)", thumb: "linear-gradient(135deg,#2e1a1a,#1e0d0d)" },
];

export const lessons = [
  { id: "1", title: "useCallback and useMemo Explained", type: "video", duration: "22 min", status: "done" },
  { id: "2", title: "Custom Hooks — Real-world Patterns", type: "article", duration: "12 min read", status: "done" },
  { id: "3", title: "React Hooks Deep Dive", type: "video", duration: "28 min", status: "current" },
  { id: "4", title: "Module 3 Quiz — 8 questions", type: "quiz", duration: "~8 min", status: "locked" },
  { id: "5", title: "Context API vs Zustand", type: "video", duration: "19 min", status: "locked" },
  { id: "6", title: "React Performance Optimization", type: "article", duration: "15 min read", status: "locked" },
];

export const quizQuestions = [
  { id: "1", q: "Which method creates a new array with results of calling a function on every element?", opts: ["forEach()", "filter()", "map()", "reduce()"], ans: 2 },
  { id: "2", q: "What does the 'async' keyword do when placed before a function declaration?", opts: ["Makes the function run faster", "Returns a Promise automatically", "Blocks the event loop", "Creates a new thread"], ans: 1 },
  { id: "3", q: "What is the output of: console.log(typeof null)?", opts: ["null", "undefined", "object", "string"], ans: 2 },
  { id: "4", q: "Which of the following is NOT a JavaScript primitive type?", opts: ["string", "boolean", "array", "symbol"], ans: 2 },
  { id: "5", q: "What does the spread operator (...) do when used in a function call?", opts: ["Copies object references", "Expands an iterable into arguments", "Creates a deep clone", "Merges two functions"], ans: 1 },
];

export const quizResults = [
  { id: "1", title: "JavaScript Arrays", score: 90 },
  { id: "2", title: "React Lifecycle", score: 85 },
  { id: "3", title: "CSS Selectors", score: 72 },
  { id: "4", title: "Node.js Async", score: 88 },
  { id: "5", title: "MongoDB Queries", score: 60 },
];

export const weeklyActivity = [3, 7, 5, 9, 6, 8, 4];

export const skillLevels = [
  { name: "React", level: 72, color: "linear-gradient(90deg,#60a5fa,#a78bfa)" },
  { name: "JavaScript", level: 88, color: "linear-gradient(90deg,#fbbf24,#f472b6)" },
  { name: "CSS / Design", level: 61, color: "linear-gradient(90deg,#34d399,#60a5fa)" },
  { name: "Node.js", level: 45, color: "linear-gradient(90deg,#a78bfa,#f472b6)" },
];

export const recentActivity = [
  { id: "1", text: 'Completed "Flexbox Basics"', time: "2 hours ago", color: "#34d399" },
  { id: "2", text: "Scored 90% on JS quiz", time: "Yesterday at 8:14pm", color: "#7c6af7" },
  { id: "3", text: 'Started "React Hooks" lesson', time: "2 days ago", color: "#60a5fa" },
  { id: "4", text: "Enrolled in Node.js course", time: "3 days ago", color: "#fbbf24" },
];

export const stats = [
  { label: "Courses enrolled", value: "6", change: "↑ 2 this month", trend: "up" },
  { label: "Lessons completed", value: "47", change: "↑ 12 this week", trend: "up" },
  { label: "Quiz average", value: "84%", change: "↑ 6% vs last week", trend: "up" },
  { label: "Learning streak", value: "7 🔥", change: "Personal best: 14", trend: "neutral" },
];
