"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionItem } from "./question-item";
import { Question } from "@/lib/types";
import { isToday } from "date-fns";

interface DayViewProps {
  date: Date;
  blitzQuestions: Question[];
  newQuestions: Question[];
  onToggleComplete: (id: string) => void;
  onTryAgain: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DayView({
  date,
  blitzQuestions,
  newQuestions,
  onToggleComplete,
  onTryAgain,
  onDelete,
}: DayViewProps) {
  const isEmpty = blitzQuestions.length === 0 && newQuestions.length === 0;
  const emptyMessage = isToday(date)
    ? "No questions scheduled for today"
    : "No questions scheduled for this day";

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-6"
      >
        {isEmpty ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Section
              title="Blitz Questions"
              subtitle="Spaced repetition review"
              icon={<RefreshCw className="h-4 w-4 text-blitz" />}
              variant="blitz"
            >
              <AnimatePresence mode="popLayout">
                {blitzQuestions.length > 0 ? (
                  blitzQuestions.map((question) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      onToggleComplete={onToggleComplete}
                      onTryAgain={onTryAgain}
                      onDelete={onDelete}
                      isBlitzSection
                    />
                  ))
                ) : (
                  <EmptyState message="No blitz questions scheduled for this day" />
                )}
              </AnimatePresence>
            </Section>

            <Section
              title="New Challenges"
              subtitle="First-time practice"
              icon={<Sparkles className="h-4 w-4 text-chart-4" />}
              variant="new"
            >
              <AnimatePresence mode="popLayout">
                {newQuestions.length > 0 ? (
                  newQuestions.map((question) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      onToggleComplete={onToggleComplete}
                      onTryAgain={onTryAgain}
                      onDelete={onDelete}
                    />
                  ))
                ) : (
                  <EmptyState message="No new questions scheduled for this day" />
                )}
              </AnimatePresence>
            </Section>
          </div>
        )}
      </motion.div>
    </ScrollArea>
  );
}

function Section({
  title,
  subtitle,
  icon,
  variant,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  variant: "blitz" | "new";
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            variant === "blitz" ? "bg-blitz/10" : "bg-chart-4/10"
          }`}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2 pl-11">{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-dashed border-border/50 bg-card/30 px-4 py-10 text-center"
    >
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-background/30">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-muted-foreground"
        >
          <path
            d="M12 6v6l4 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </motion.div>
  );
}
