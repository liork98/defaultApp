"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { CalendarHeader } from "./calendar-header";
import { DayView } from "./day-view";
import { AddQuestionModal } from "./add-question-modal";
import { useQuestionStore } from "@/lib/store";

export function LeetCodeDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addModalOpen, setAddModalOpen] = useState(false);

  const {
    addQuestion,
    setCompleted,
    tryAgainScheduleForTomorrow,
    getQuestionsForDate,
    getStatistics,
  } = useQuestionStore();

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
          onToggleComplete={setCompleted}
          onTryAgain={tryAgainScheduleForTomorrow}
        />
      </motion.main>

      {/* Add Question Modal */}
      <AddQuestionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddQuestion={addQuestion}
        selectedDate={selectedDate}
      />
    </div>
  );
}
