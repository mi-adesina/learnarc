import { create } from "zustand";
import { quizQuestions } from "@/lib/data";

interface QuizState {
  currentQ: number;
  selected: number;
  score: number;
  answered: boolean;
  finished: boolean;
  selectOption: (i: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  skipQuestion: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQ: 0,
  selected: -1,
  score: 0,
  answered: false,
  finished: false,

  selectOption: (i) => {
    if (!get().answered) set({ selected: i });
  },

  submitAnswer: () => {
    const { selected, currentQ, score, answered } = get();
    if (selected === -1 || answered) return;
    const correct = quizQuestions[currentQ].ans === selected;
    set({ answered: true, score: correct ? score + 1 : score });
  },

  nextQuestion: () => {
    const { currentQ } = get();
    if (currentQ + 1 >= quizQuestions.length) {
      set({ finished: true });
    } else {
      set({ currentQ: currentQ + 1, selected: -1, answered: false });
    }
  },

  skipQuestion: () => {
    const { currentQ } = get();
    if (currentQ + 1 >= quizQuestions.length) {
      set({ finished: true });
    } else {
      set({ currentQ: currentQ + 1, selected: -1, answered: false });
    }
  },

  reset: () => set({ currentQ: 0, selected: -1, score: 0, answered: false, finished: false }),
}));
