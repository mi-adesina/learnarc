import { createClient } from "@/lib/supabase/client";
import type { Course, Lesson, QuizAttempt, OnboardingData, User } from "@/types";

// ── Auth ──────────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name }, emailRedirectTo: `${location.origin}/auth/callback` },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${location.origin}/auth/callback` },
  });
  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function getProfile(): Promise<User | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
  return data as User | null;
}

export async function updateProfile(updates: Partial<User>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single();
  if (error) throw error;
  return data as User;
}

// ── Onboarding ────────────────────────────────────────────────

export async function completeOnboarding(payload: OnboardingData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase.from("profiles").update({
    name: payload.name,
    goals: payload.goals,
    experience: payload.experience,
    hours_per_week: payload.hours_per_week,
    onboarding_complete: true,
  }).eq("id", user.id);
  if (error) throw error;
}

// ── Courses ───────────────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: courses, error } = await supabase
    .from("courses").select("*").eq("published", true).order("created_at");
  if (error) throw error;

  if (user) {
    const { data: enrollments } = await supabase
      .from("enrollments").select("course_id, progress_pct, completed_at").eq("user_id", user.id);
    const enrollMap = new Map(enrollments?.map((e) => [e.course_id, e]) ?? []);

    return (courses ?? []).map((c) => {
      const enroll = enrollMap.get(c.id);
      const progress = enroll?.progress_pct ?? 0;
      return {
        ...c,
        enrolled: !!enroll,
        progress,
        status: !enroll ? "new" : enroll.completed_at ? "done" : "progress",
      };
    });
  }

  return (courses ?? []).map((c) => ({ ...c, enrolled: false, progress: 0, status: "new" as const }));
}

export async function enrollInCourse(courseId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase.from("enrollments").upsert({ user_id: user.id, course_id: courseId });
  if (error) throw error;
  // Log activity
  await supabase.from("activity").insert({ user_id: user.id, type: "course_enroll", title: "Enrolled in a new course", color: "#fbbf24" });
}

// ── Lessons ───────────────────────────────────────────────────

export async function getLessons(courseId: string): Promise<Lesson[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: lessons, error } = await supabase
    .from("lessons").select("*").eq("course_id", courseId).eq("published", true).order("order_index");
  if (error) throw error;

  if (user) {
    const { data: progress } = await supabase
      .from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id).eq("course_id", courseId);
    const progressMap = new Map(progress?.map((p) => [p.lesson_id, p.completed]) ?? []);

    let foundCurrent = false;
    return (lessons ?? []).map((l) => {
      const done = progressMap.get(l.id) === true;
      if (done) return { ...l, status: "done" as const };
      if (!foundCurrent) { foundCurrent = true; return { ...l, status: "current" as const }; }
      return { ...l, status: "locked" as const };
    });
  }

  return (lessons ?? []).map((l, i) => ({ ...l, status: i === 0 ? "current" as const : "locked" as const }));
}

export async function completeLesson(lessonId: string, courseId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("lesson_progress").upsert({ user_id: user.id, lesson_id: lessonId, course_id: courseId, completed: true, completed_at: new Date().toISOString() });
  await supabase.from("activity").insert({ user_id: user.id, type: "lesson_complete", title: "Completed a lesson", color: "#34d399" });
}

// ── Quiz ──────────────────────────────────────────────────────

export async function getQuizQuestions(courseId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quiz_questions").select("*").eq("course_id", courseId).order("order_index");
  if (error) throw error;
  return data ?? [];
}

export async function saveQuizAttempt(courseId: string, score: number, total: number, answers: number[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const pct = Math.round((score / total) * 100);
  const { data, error } = await supabase.from("quiz_attempts").insert({ user_id: user.id, course_id: courseId, score, total, pct, answers }).select().single();
  if (error) throw error;
  await supabase.from("activity").insert({ user_id: user.id, type: "quiz_complete", title: `Scored ${pct}% on quiz`, color: "#7c6af7" });
  return data as QuizAttempt;
}

export async function getQuizHistory(courseId?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let query = supabase.from("quiz_attempts").select("*, courses(title)").eq("user_id", user.id).order("completed_at", { ascending: false });
  if (courseId) query = query.eq("course_id", courseId);
  const { data } = await query;
  return data ?? [];
}

// ── Activity & Stats ──────────────────────────────────────────

export async function getActivity(limit = 10) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("activity").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

export async function getDashboardStats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ count: enrolled }, { count: completed }, { data: profile }, { data: attempts }] = await Promise.all([
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true),
    supabase.from("profiles").select("streak, xp").eq("id", user.id).single(),
    supabase.from("quiz_attempts").select("pct").eq("user_id", user.id),
  ]);

  const avgQuiz = attempts?.length ? Math.round(attempts.reduce((s, a) => s + a.pct, 0) / attempts.length) : 0;

  return {
    enrolled: enrolled ?? 0,
    lessonsCompleted: completed ?? 0,
    quizAverage: avgQuiz,
    streak: profile?.streak ?? 0,
    xp: profile?.xp ?? 0,
  };
}

// ── Admin ─────────────────────────────────────────────────────

export async function adminGetAllUsers() {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminCreateCourse(course: Partial<Course>) {
  const supabase = createClient();
  const { data, error } = await supabase.from("courses").insert(course).select().single();
  if (error) throw error;
  return data;
}

export async function adminUpdateCourse(id: string, updates: Partial<Course>) {
  const supabase = createClient();
  const { data, error } = await supabase.from("courses").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeleteCourse(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function adminCreateLesson(lesson: Partial<Lesson>) {
  const supabase = createClient();
  const { data, error } = await supabase.from("lessons").insert(lesson).select().single();
  if (error) throw error;
  // Update lesson count on course
  await supabase.rpc("increment_course_lessons", { course_id_param: lesson.course_id });
  return data;
}

export async function adminGetStats() {
  const supabase = createClient();
  const [{ count: users }, { count: courses }, { count: enrollments }, { count: attempts }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("quiz_attempts").select("*", { count: "exact", head: true }),
  ]);
  return { users: users ?? 0, courses: courses ?? 0, enrollments: enrollments ?? 0, attempts: attempts ?? 0 };
}