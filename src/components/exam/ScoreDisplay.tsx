import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  blockTitle: string;
}

export function ScoreDisplay({ score, maxScore, blockTitle }: ScoreDisplayProps) {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = () => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-accent";
    if (percentage >= 40) return "text-primary";
    return "text-destructive";
  };

  const getIcon = () => {
    if (percentage >= 80) return <CheckCircle2 className="w-8 h-8 text-success" />;
    if (percentage >= 40) return <MinusCircle className="w-8 h-8 text-primary" />;
    return <XCircle className="w-8 h-8 text-destructive" />;
  };

  return (
    <Card className="p-6 shadow-elevated">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{blockTitle}</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getScoreColor()}`}>
              {score}
            </span>
            <span className="text-muted-foreground">/ {maxScore} points</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor()}`}>
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
    </Card>
  );
}
