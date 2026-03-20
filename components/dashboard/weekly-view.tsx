"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DayView } from "./day-view";
import { Question } from "@/lib/types";
import { format, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface WeeklyViewProps {
  weekDays: Date[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  getQuestionsForDate: (
    date: Date
  ) => { blitzQuestions: Question[]; newQuestions: Question[] };
  onToggleComplete: (id: string) => void;
  onTryAgain: (id: string) => void;
}

export function WeeklyView({
  weekDays,
  selectedDate,
  onDateChange,
  getQuestionsForDate,
  onToggleComplete,
  onTryAgain,
}: WeeklyViewProps) {
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  return (
    <Tabs
      value={selectedDateStr}
      onValueChange={(value) => {
        const date = weekDays.find(
          (d) => format(d, "yyyy-MM-dd") === value
        );
        if (date) onDateChange(date);
      }}
      className="flex-1"
    >
      <TabsList className="mx-6 mt-4 flex w-auto justify-start gap-1 bg-transparent p-0">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const { blitzQuestions, newQuestions } = getQuestionsForDate(day);
          const completedCount = [
            ...blitzQuestions,
            ...newQuestions,
          ].filter((q) => q.status === "Completed").length;
          const totalCount = blitzQuestions.length + newQuestions.length;
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <TabsTrigger
              key={dateStr}
              value={dateStr}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-lg border border-transparent px-4 py-2 data-[state=active]:border-border/50 data-[state=active]:bg-card/50 data-[state=active]:shadow-none",
                isTodayDate && "border-chart-4/30"
              )}
            >
              <span className="text-[10px] font-medium uppercase text-muted-foreground">
                {format(day, "EEE")}
              </span>
              <span className="font-mono text-lg font-bold">
                {format(day, "d")}
              </span>

              {/* Progress Indicator */}
              {totalCount > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(totalCount, 5) }).map(
                    (_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1 w-1 rounded-full",
                          i < completedCount ? "bg-chart-1" : "bg-muted"
                        )}
                      />
                    )
                  )}
                </div>
              )}

              {/* Today Badge */}
              {isTodayDate && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-chart-4" />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <AnimatePresence mode="wait">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const { blitzQuestions, newQuestions } = getQuestionsForDate(day);

          return (
            <TabsContent
              key={dateStr}
              value={dateStr}
              className="mt-0 focus-visible:ring-0"
            >
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DayView
                  date={day}
                  blitzQuestions={blitzQuestions}
                  newQuestions={newQuestions}
                  onToggleComplete={onToggleComplete}
                  onTryAgain={onTryAgain}
                />
              </motion.div>
            </TabsContent>
          );
        })}
      </AnimatePresence>
    </Tabs>
  );
}
