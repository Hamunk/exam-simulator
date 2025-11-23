import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
}

export const ExamTimer = ({ remainingSeconds, totalSeconds }: ExamTimerProps) => {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const percentageRemaining = (remainingSeconds / totalSeconds) * 100;
  const isLowTime = percentageRemaining < 20;
  const isCriticalTime = percentageRemaining < 10;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors",
        isCriticalTime
          ? "bg-destructive/10 border-destructive text-destructive"
          : isLowTime
          ? "bg-warning/10 border-warning text-warning"
          : "bg-card border-border text-foreground"
      )}
    >
      {isCriticalTime ? (
        <AlertCircle className="w-5 h-5 animate-pulse" />
      ) : (
        <Clock className="w-5 h-5" />
      )}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums">
          {hours > 0 && `${hours}:`}
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        <span className="text-sm font-medium opacity-70">remaining</span>
      </div>
    </div>
  );
};
