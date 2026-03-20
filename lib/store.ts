"use client";

import { useCallback, useMemo } from "react";
import { addDays, format, parseISO } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type {
  Difficulty,
  Question,
  QuestionStatus,
  QuestionType,
} from "./types";

const STORAGE_KEY = "leettracker.questions.v1";

function toIsoFromLocalDate(d: Date) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0); // Avoid date shifting across timezones
  return x.toISOString();
}

function dayKeyFromIso(iso: string) {
  return format(parseISO(iso), "yyyy-MM-dd");
}

function getCompletionDayKey(q: Question) {
  if (q.type === "New") return dayKeyFromIso(q.dateAdded);
  return dayKeyFromIso(q.nextReviewDate);
}

// Sample data for demonstration
const generateSampleData = (): Question[] => {
  const today = new Date();
  const mk = (offsetDays: number) => toIsoFromLocalDate(addDays(today, offsetDays));

  return [
    {
      id: "1",
      title: "Two Sum",
      difficulty: "Easy",
      type: "Blitz",
      status: "Completed",
      url: "https://leetcode.com/problems/two-sum/",
      dateAdded: mk(0),
      nextReviewDate: mk(0),
    },
    {
      id: "2",
      title: "Valid Parentheses",
      difficulty: "Easy",
      type: "Blitz",
      status: "Pending",
      url: "https://leetcode.com/problems/valid-parentheses/",
      dateAdded: mk(0),
      nextReviewDate: mk(0),
    },
    {
      id: "3",
      title: "Merge K Sorted Lists",
      difficulty: "Hard",
      type: "New",
      status: "Pending",
      url: "https://leetcode.com/problems/merge-k-sorted-lists/",
      dateAdded: mk(0),
      nextReviewDate: mk(0),
    },
    {
      id: "4",
      title: "LRU Cache",
      difficulty: "Medium",
      type: "New",
      status: "Pending",
      url: "https://leetcode.com/problems/lru-cache/",
      dateAdded: mk(0),
      nextReviewDate: mk(0),
    },
    {
      id: "5",
      title: "Reverse Linked List",
      difficulty: "Easy",
      type: "Blitz",
      status: "Completed",
      url: "https://leetcode.com/problems/reverse-linked-list/",
      dateAdded: mk(-1),
      nextReviewDate: mk(-1),
    },
    {
      id: "6",
      title: "Binary Tree Level Order Traversal",
      difficulty: "Medium",
      type: "New",
      status: "Completed",
      url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
      dateAdded: mk(-1),
      nextReviewDate: mk(-1),
    },
    {
      id: "7",
      title: "Maximum Subarray",
      difficulty: "Medium",
      type: "Blitz",
      status: "Completed",
      url: "https://leetcode.com/problems/maximum-subarray/",
      dateAdded: mk(-2),
      nextReviewDate: mk(-2),
    },
    {
      id: "8",
      title: "Climbing Stairs",
      difficulty: "Easy",
      type: "New",
      status: "Completed",
      url: "https://leetcode.com/problems/climbing-stairs/",
      dateAdded: mk(-2),
      nextReviewDate: mk(-2),
    },
    {
      id: "9",
      title: "Word Break",
      difficulty: "Medium",
      type: "New",
      status: "Completed",
      url: "https://leetcode.com/problems/word-break/",
      dateAdded: mk(-3),
      nextReviewDate: mk(-3),
    },
  ];
};

export function useQuestionStore() {
  const { value: questions, setValue: setQuestions } = useLocalStorage<
    Question[]
  >(STORAGE_KEY, generateSampleData());

  const addQuestion = useCallback(
    (
      title: string,
      difficulty: Difficulty,
      type: QuestionType,
      url: string,
      date: Date
    ) => {
      const iso = toIsoFromLocalDate(date);
      const nextReviewIso = type === "Blitz" ? iso : iso;

      const newQuestion: Question = {
        id: crypto.randomUUID(),
        title,
        difficulty,
        type,
        url,
        status: "Pending",
        dateAdded: iso,
        nextReviewDate: nextReviewIso,
      };

      setQuestions((prev) => [...prev, newQuestion]);
    },
    [setQuestions]
  );

  const setCompleted = useCallback(
    (id: string) => {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;
          const nextStatus: QuestionStatus =
            q.status === "Completed" ? "Pending" : "Completed";
          return { ...q, status: nextStatus };
        })
      );
    },
    [setQuestions]
  );

  const tryAgainScheduleForTomorrow = useCallback(
    (id: string) => {
      setQuestions((prev) => {
        const target = prev.find((q) => q.id === id);
        if (!target) return prev;

        const baseDate =
          target.type === "Blitz"
            ? parseISO(target.nextReviewDate)
            : parseISO(target.dateAdded);
        const tomorrow = addDays(baseDate, 1);
        const tomorrowIso = toIsoFromLocalDate(tomorrow);

        const failedOriginal: Question = {
          ...target,
          status: "Failed",
        };

        const duplicated: Question = {
          ...target,
          id: crypto.randomUUID(),
          type: "Blitz",
          status: "Pending",
          nextReviewDate: tomorrowIso,
        };

        return prev.map((q) => (q.id === id ? failedOriginal : q)).concat(duplicated);
      });
    },
    [setQuestions]
  );

  const getQuestionsForDate = useCallback(
    (selectedDate: Date) => {
      const selectedKey = format(selectedDate, "yyyy-MM-dd");

      const blitzQuestions = questions.filter(
        (q) => q.type === "Blitz" && dayKeyFromIso(q.nextReviewDate) === selectedKey
      );
      const newQuestions = questions.filter(
        (q) => q.type === "New" && dayKeyFromIso(q.dateAdded) === selectedKey
      );

      return { blitzQuestions, newQuestions };
    },
    [questions]
  );

  const getStatistics = useMemo(() => {
    const totalSolved = questions.filter((q) => q.status === "Completed").length;

    const completedDayKeys = new Set(
      questions
        .filter((q) => q.status === "Completed")
        .map((q) => getCompletionDayKey(q))
    );

    // Consecutive days with at least one completed question
    let streak = 0;
    let current = new Date();
    while (true) {
      const key = format(current, "yyyy-MM-dd");
      if (!completedDayKeys.has(key)) break;
      streak++;
      current = addDays(current, -1);
    }

    const activityMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = addDays(new Date(), -i);
      const key = format(d, "yyyy-MM-dd");
      activityMap[key] = questions.filter((q) => {
        if (q.status !== "Completed") return false;
        return getCompletionDayKey(q) === key;
      }).length;
    }

    return { totalSolved, streak, activityMap };
  }, [questions]);

  return {
    questions,
    addQuestion,
    setCompleted,
    tryAgainScheduleForTomorrow,
    getQuestionsForDate,
    getStatistics,
  };
}
