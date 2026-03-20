"use client";

import { motion } from "framer-motion";
import { ExternalLink, RotateCcw, RefreshCw, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Difficulty, Question } from "@/lib/types";

interface QuestionItemProps {
  question: Question;
  onToggleComplete: (id: string) => void;
  onTryAgain: (id: string) => void;
  onDelete: (id: string) => void;
  isBlitzSection?: boolean;
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; className: string }
> = {
  Easy: {
    label: "Easy",
    className: "bg-easy/10 text-easy border-easy/20",
  },
  Medium: {
    label: "Medium",
    className: "bg-medium/10 text-medium border-medium/20",
  },
  Hard: {
    label: "Hard",
    className: "bg-hard/10 text-hard border-hard/20",
  },
};

export function QuestionItem({
  question,
  onToggleComplete,
  onTryAgain,
  onDelete,
  isBlitzSection,
}: QuestionItemProps) {
  const difficulty = difficultyConfig[question.difficulty];
  const isCompleted = question.status === "Completed";
  const isFailed = question.status === "Failed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border hover:bg-card hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
        isCompleted && "opacity-60",
        isFailed && "border-rose-500/40 bg-rose-500/5"
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggleComplete(question.id)}
        className="h-5 w-5"
      />

      {/* Question Info */}
      <div className="flex flex-1 items-center gap-3 overflow-hidden">
        {/* Blitz Icon */}
        {isBlitzSection && (
          <RefreshCw className="h-4 w-4 shrink-0 text-blitz" />
        )}

        {/* Title */}
        <span
          className={cn(
            "flex-1 truncate font-medium text-sm",
            isCompleted && "line-through"
          )}
        >
          {question.title}
        </span>

        {/* Difficulty Badge */}
        <span
          className={cn(
            "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            difficulty.className
          )}
        >
          {difficulty.label}
        </span>

        {/* External Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={question.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent>Open in LeetCode</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Try Again Button */}
        {question.status !== "Completed" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTryAgain(question.id)}
                className="h-7 gap-1.5 border-rose-500/30 bg-rose-500/10 text-[11px] text-rose-400 hover:border-rose-500/60 hover:bg-rose-500/20 active:scale-[0.98]"
              >
                <RotateCcw className="h-3 w-3" />
                Try Again
              </Button>
            </TooltipTrigger>
            <TooltipContent>Schedule for 3 days later</TooltipContent>
          </Tooltip>
        )}

        {/* Delete Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(question.id)}
              className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove Question</TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}
