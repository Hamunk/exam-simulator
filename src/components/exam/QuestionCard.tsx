import { Question, UserAnswer } from "@/types/exam";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  userAnswer?: UserAnswer;
  onAnswerChange: (questionId: string, selectedOptions: number[]) => void;
  showResults?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  userAnswer,
  onAnswerChange,
  showResults = false,
}: QuestionCardProps) {
  const handleCheckboxChange = (optionIndex: number, checked: boolean) => {
    const currentSelections = userAnswer?.selectedOptions || [];
    const newSelections = checked
      ? [...currentSelections, optionIndex]
      : currentSelections.filter((i) => i !== optionIndex);
    onAnswerChange(question.id, newSelections);
  };

  const handleRadioChange = (value: string) => {
    onAnswerChange(question.id, [parseInt(value)]);
  };

  const getOptionClassName = (optionIndex: number) => {
    if (!showResults) return "";
    
    const isSelected = userAnswer?.selectedOptions.includes(optionIndex);
    const isCorrect = question.correctAnswers.includes(optionIndex);
    
    if (isSelected && isCorrect) return "bg-success/10 border-success";
    if (isSelected && !isCorrect) return "bg-destructive/10 border-destructive";
    if (!isSelected && isCorrect) return "bg-success/5 border-success/50";
    return "";
  };

  return (
    <Card className="p-6 shadow-card transition-shadow hover:shadow-elevated">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Question {questionNumber}
        </h3>
        <p className="text-foreground whitespace-pre-wrap">{question.text}</p>
        
        {question.multipleCorrect && !showResults && (
          <p className="text-sm text-muted-foreground italic">
            (Multiple correct answers possible)
          </p>
        )}

        <div className="space-y-3">
          {question.multipleCorrect ? (
            question.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${getOptionClassName(
                  index
                )}`}
              >
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={userAnswer?.selectedOptions.includes(index)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(index, checked as boolean)
                  }
                  disabled={showResults}
                />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option}
                </Label>
              </div>
            ))
          ) : (
            <RadioGroup
              value={userAnswer?.selectedOptions[0]?.toString()}
              onValueChange={handleRadioChange}
              disabled={showResults}
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${getOptionClassName(
                    index
                  )}`}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`${question.id}-${index}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${index}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </div>
    </Card>
  );
}
