interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Block {current} of {total}:
        </span>
        <span>{Math.round(percentage)}% Complete</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
