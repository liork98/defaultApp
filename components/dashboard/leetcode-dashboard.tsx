"use client";

import { useState, useOptimistic, useTransition, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { CalendarHeader } from "./calendar-header";
import { DayView } from "./day-view";
import { AddQuestionModal } from "./add-question-modal";
import { addQuestionAction, toggleCompleteAction, tryAgainAction, deleteQuestionAction } from "@/lib/actions";
import { format, addDays, parseISO } from "date-fns";
import type { Question, Difficulty, QuestionType, QuestionStatus } from "@/lib/types";

export function LeetCodeDashboard({ initialQuestions }: { initialQuestions: Question[] }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [optimisticQuestions, addOptimisticQuestion] = useOptimistic(
    initialQuestions,
    (state: Question[], action: { type: string; payload: any }) => {
      switch (action.type) {
        case "ADD":
          return [...state, action.payload];
        case "TOGGLE":
          return state.map((q) =>
            q.id === action.payload.id
              ? { ...q, status: q.status === "Completed" ? "Pending" : "Completed" }
              : q
          );
        case "DELETE":
          return state.filter((q) => q.id !== action.payload.id);
        case "TRY_AGAIN":
          const target = state.find((q) => q.id === action.payload.id);
          if (!target) return state;
          const baseDate = parseISO(target.dateAdded.split("T")[0]);
          baseDate.setHours(12, 0, 0, 0);
          const threeDaysLaterStr = format(addDays(baseDate, 3), "yyyy-MM-dd");
          return state
            .map((q) => (q.id === action.payload.id ? { ...q, status: "Failed" } : q))
            .concat({
              ...target,
              id: Math.random().toString(),
              type: "Blitz",
              status: "Pending",
              dateAdded: threeDaysLaterStr,
              nextReviewDate: threeDaysLaterStr,
            });
        default:
          return state;
      }
    }
  );

  const getQuestionsForDate = (date: Date) => {
    const selectedKey = format(date, "yyyy-MM-dd");
    const blitzQuestions = optimisticQuestions.filter(
      (q) => q.type === "Blitz" && q.nextReviewDate.startsWith(selectedKey)
    );
    const newQuestions = optimisticQuestions.filter(
      (q) => q.type === "New" && q.dateAdded.startsWith(selectedKey)
    );
    return { blitzQuestions, newQuestions };
  };

  const getStatistics = useMemo(() => {
    const totalSolved = optimisticQuestions.filter((q) => q.status === "Completed").length;

    const completedDayKeys = new Set(
      optimisticQuestions
        .filter((q) => q.status === "Completed")
        .map((q) => (q.type === "New" ? q.dateAdded.split("T")[0] : q.nextReviewDate.split("T")[0]))
    );

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
      activityMap[key] = optimisticQuestions.filter((q) => {
        if (q.status !== "Completed") return false;
        const qDate = q.type === "New" ? q.dateAdded.split("T")[0] : q.nextReviewDate.split("T")[0];
        return qDate === key;
      }).length;
    }

    return { totalSolved, streak, activityMap };
  }, [optimisticQuestions]);

  const handleAddQuestion = async (
    title: string,
    difficulty: Difficulty,
    type: QuestionType,
    url: string,
    date: Date
  ) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const tempId = Math.random().toString();
    
    startTransition(async () => {
      addOptimisticQuestion({
        type: "ADD",
        payload: {
          id: tempId,
          title,
          difficulty,
          type,
          url,
          status: "Pending",
          dateAdded: dateStr,
          nextReviewDate: dateStr,
        },
      });
      await addQuestionAction(title, difficulty, type, url, dateStr);
    });
  };

  const handleToggleComplete = async (id: string) => {
    const q = optimisticQuestions.find((q) => q.id === id);
    if (!q) return;

    startTransition(async () => {
      addOptimisticQuestion({ type: "TOGGLE", payload: { id } });
      await toggleCompleteAction(id, q.status);
    });
  };

  const handleTryAgain = async (id: string) => {
    startTransition(async () => {
      addOptimisticQuestion({ type: "TRY_AGAIN", payload: { id } });
      await tryAgainAction(id);
    });
  };

  const handleDeleteQuestion = async (id: string) => {
    startTransition(async () => {
      addOptimisticQuestion({ type: "DELETE", payload: { id } });
      await deleteQuestionAction(id);
    });
  };

  const { blitzQuestions, newQuestions } = getQuestionsForDate(selectedDate);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onAddQuestion={() => setAddModalOpen(true)}
        statistics={getStatistics}
      />

      {/* Main Content */}
      <motion.main
        className="flex flex-1 flex-col overflow-hidden"
        initial={false}
        animate={{
          marginLeft: 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Calendar Header */}
        <CalendarHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          activityMap={getStatistics.activityMap}
        />

        {/* Main View */}
        <DayView
          date={selectedDate}
          blitzQuestions={blitzQuestions}
          newQuestions={newQuestions}
          onToggleComplete={handleToggleComplete}
          onTryAgain={handleTryAgain}
          onDelete={handleDeleteQuestion}
        />
      </motion.main>

      {/* Add Question Modal */}
      <AddQuestionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddQuestion={handleAddQuestion}
        selectedDate={selectedDate}
      />
    </div>
  );
}
