"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  format,
  addDays,
  subDays,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { useMemo, useRef, useEffect } from "react";
import { getIsraelToday, formatIsraelDay } from "@/lib/utils";

interface CalendarHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  activityMap: Record<string, number>;
}

export function CalendarHeader({
  selectedDate,
  onDateChange,
  activityMap,
}: CalendarHeaderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate visible days - current month plus some buffer
  const visibleDays = useMemo(() => {
    const start = subDays(startOfMonth(selectedDate), 7);
    const end = addDays(endOfMonth(selectedDate), 7);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  // Scroll to selected date on mount and when date changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.querySelector(
        '[data-selected="true"]'
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedDate]);

  const goToPrevWeek = () => onDateChange(subDays(selectedDate, 7));
  const goToNextWeek = () => onDateChange(addDays(selectedDate, 7));
  const goToToday = () => onDateChange(getIsraelToday());

  return (
    <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Month/Year Display */}
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {format(selectedDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-7 gap-1.5 text-xs"
          >
            <Calendar className="h-3 w-3" />
            Today
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={goToPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Date Scroller */}
      <div
        ref={scrollContainerRef}
        className="flex gap-1 overflow-x-auto px-6 pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {visibleDays.map((day) => {
          const dateStr = formatIsraelDay(day);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isSameDay(day, getIsraelToday());
          const hasActivity = (activityMap[dateStr] || 0) > 0;

          return (
            <motion.button
              key={dateStr}
              data-selected={isSelected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateChange(day)}
              className={cn(
                "relative flex min-w-[52px] flex-col items-center rounded-lg border px-3 py-2 transition-all",
                isSelected
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-transparent bg-transparent hover:bg-accent/50",
                isTodayDate && !isSelected && "border-chart-4/50"
              )}
            >
              <span className="text-[10px] font-medium uppercase text-muted-foreground">
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "font-mono text-lg font-bold",
                  isSelected && "text-primary"
                )}
              >
                {format(day, "d")}
              </span>

              {/* Activity Indicator */}
              {hasActivity && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-chart-1" />
              )}

              {/* Today Indicator */}
              {isTodayDate && (
                <span className="absolute -top-0.5 right-1 h-1.5 w-1.5 rounded-full bg-chart-4" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
