"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onAddQuestion: () => void;
  statistics: {
    totalSolved: number;
    streak: number;
    activityMap: Record<string, number>;
  };
}

export function Sidebar({
  isCollapsed,
  onToggle,
  onAddQuestion,
  statistics,
}: SidebarProps) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex h-screen flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl"
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border bg-card hover:bg-accent"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-chart-4 to-chart-5">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold tracking-tight">LeetTracker</span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-chart-4 to-chart-5"
            >
              <BarChart3 className="h-4 w-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Question Button */}
      <div className="px-3 py-2">
        <Button
          onClick={onAddQuestion}
          className={cn(
            "w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>Add Question</span>}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="flex-1 space-y-3 overflow-hidden px-3 py-4">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Total Solved */}
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4 text-chart-1" />}
                label="Total Sol3ved"
                value={statistics.totalSolved}
              />

              {/* Blitz Streak */}
              <StatCard
                icon={<Flame className="h-4 w-4 text-blitz" />}
                label="Current Streak"
                value={statistics.streak}
                suffix="days"
              />

              {/* Mini Heatmap */}
              <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Activity
                </p>
                <MiniHeatmap activityMap={statistics.activityMap} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Stats */}
        {isCollapsed && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-background/50">
              <span className="font-mono text-sm font-bold text-chart-1">
                {statistics.totalSolved}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-background/50">
              <Flame className="h-4 w-4 text-blitz" />
            </div>
          </div>
        )}
      </div>

      {/* User Section & Logout */}
      <div className="mt-auto border-t border-border/50 p-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </motion.aside>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/50 p-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-bold">{value}</span>
        {suffix && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function MiniHeatmap({ activityMap }: { activityMap: Record<string, number> }) {
  const days = Array.from({ length: 30 }, (_, i) =>
    format(subDays(new Date(), 29 - i), "yyyy-MM-dd")
  );

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count === 1) return "bg-chart-1/30";
    if (count === 2) return "bg-chart-1/50";
    if (count >= 3) return "bg-chart-1/80";
    return "bg-muted/30";
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((date) => (
        <div
          key={date}
          className={cn(
            "aspect-square rounded-sm transition-colors",
            getIntensity(activityMap[date] || 0)
          )}
          title={`${date}: ${activityMap[date] || 0} completed`}
        />
      ))}
    </div>
  );
}
