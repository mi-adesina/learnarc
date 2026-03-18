export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: "student" | "admin";
  created_at: string;
  onboarding_complete: boolean;
  streak: number;
  xp: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  emoji: string;
  thumb_gradient: string;
  bar_color: string;
  total_hours: number;
  total_lessons: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  // joined from enrollments
  progress?: number;
  enrolled?: boolean;
  status?: "new" | "progress" | "done";
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  type: "video" | "article" | "quiz";
  duration_minutes: number;
  order_index: number;
  content_url?: string;
  content_body?: string;
  published: boolean;
  created_at: string;
  // joined from progress
  status?: "done" | "current" | "locked";
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress_pct: number;
  completed_at?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at?: string;
}

export interface QuizQuestion {
  id: string;
  course_id: string;
  question: string;
  options: string[];
  correct_index: number;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  course_id: string;
  score: number;
  total: number;
  pct: number;
  answers: number[];
  completed_at: string;
}

export interface ActivityItem {
  id: string;
  user_id: string;
  type: "lesson_complete" | "quiz_complete" | "course_enroll" | "streak";
  title: string;
  meta?: string;
  color: string;
  created_at: string;
}

export interface OnboardingData {
  name: string;
  goals: string[];
  experience: string;
  hours_per_week: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
