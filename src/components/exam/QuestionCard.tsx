import { Question, UserAnswer } from "@/types/exam";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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

  const handleReset = () => {
    onAnswerChange(question.id, []);
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

  const renderMarkdownTable = (tableText: string, key: string) => {
    const lines = tableText.trim().split('\n');
    if (lines.length < 2) return tableText;

    // Parse header row
    const headerCells = lines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    
    // Skip separator row (line 1)
    // Parse data rows
    const dataRows = lines.slice(2).map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    return (
      <div key={key} className="my-4 overflow-x-auto">
        <table className="min-w-full border-collapse border border-border">
          <thead className="bg-muted">
            <tr>
              {headerCells.map((cell, idx) => (
                <th key={idx} className="border border-border px-4 py-2 text-left font-semibold">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="even:bg-muted/30">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="border border-border px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderText = (text: string) => {
    // Check for markdown tables first (|col1|col2|)
    const tableRegex = /(\|.+\|[\r\n]+\|[-:\s|]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = tableRegex.exec(text)) !== null) {
      // Add text before table
      if (match.index > lastIndex) {
        parts.push(renderCodeAndMath(text.slice(lastIndex, match.index)));
      }
      
      // Add table
      parts.push(renderMarkdownTable(match[1], `table-${match.index}`));
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(renderCodeAndMath(text.slice(lastIndex)));
    }

    return parts.length > 0 ? <>{parts}</> : renderCodeAndMath(text);
  };

  const renderCodeAndMath = (text: string) => {
    // Check for code blocks (```language\ncode\n```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(renderMathInText(text.slice(lastIndex, match.index)));
      }
      
      // Add code block
      const language = match[1] || "python";
      const code = match[2].trim();
      parts.push(
        <SyntaxHighlighter
          key={match.index}
          language={language}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: "0.5rem",
            padding: "1rem",
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(renderMathInText(text.slice(lastIndex)));
    }

    return parts.length > 0 ? <>{parts}</> : renderMathInText(text);
  };

  const renderMathInText = (text: string) => {
    // Check for display math ($$...$$)
    const displayMathRegex = /\$\$([\s\S]+?)\$\$/g;
    // Check for inline math ($...$)
    const inlineMathRegex = /\$([^\$]+?)\$/g;
    
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // First handle display math
    let match;
    const displayMatches: { index: number; length: number; math: string }[] = [];
    
    while ((match = displayMathRegex.exec(text)) !== null) {
      displayMatches.push({
        index: match.index,
        length: match[0].length,
        math: match[1],
      });
    }

    // Process text with display math
    let processedText = text;
    displayMatches.reverse().forEach((dm, idx) => {
      const before = processedText.slice(0, dm.index);
      const after = processedText.slice(dm.index + dm.length);
      processedText = before + `__DISPLAY_MATH_${displayMatches.length - 1 - idx}__` + after;
    });

    // Now handle inline math
    let currentIndex = 0;
    while ((match = inlineMathRegex.exec(processedText)) !== null) {
      // Skip if this is part of a display math placeholder
      if (match[0].includes("__DISPLAY_MATH_")) {
        continue;
      }

      if (match.index > currentIndex) {
        const textPart = processedText.slice(currentIndex, match.index);
        parts.push(textPart);
      }

      parts.push(<InlineMath key={`inline-${match.index}`} math={match[1]} />);
      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < processedText.length) {
      parts.push(processedText.slice(currentIndex));
    }

    // Replace display math placeholders
    const finalParts: (string | JSX.Element)[] = [];
    parts.forEach((part, idx) => {
      if (typeof part === "string") {
        displayMatches.forEach((dm, dmIdx) => {
          const placeholder = `__DISPLAY_MATH_${dmIdx}__`;
          if (part.includes(placeholder)) {
            const splitParts = part.split(placeholder);
            splitParts.forEach((sp, spIdx) => {
              if (sp) finalParts.push(sp);
              if (spIdx < splitParts.length - 1) {
                finalParts.push(
                  <div key={`display-${idx}-${dmIdx}`} className="my-2">
                    <BlockMath math={dm.math} />
                  </div>
                );
              }
            });
            return;
          }
        });
        if (!displayMatches.some((dm) => part.includes(`__DISPLAY_MATH_${displayMatches.indexOf(dm)}__`))) {
          finalParts.push(part);
        }
      } else {
        finalParts.push(part);
      }
    });

    return finalParts.length > 0 ? <>{finalParts}</> : text;
  };

  return (
    <Card className="p-6 shadow-card transition-shadow hover:shadow-elevated">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground">
            Question {questionNumber}
          </h3>
          {!showResults && (userAnswer?.selectedOptions?.length ?? 0) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
        <div className="text-foreground">{renderText(question.text)}</div>
        
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
                  <div>{renderText(option)}</div>
                </Label>
              </div>
            ))
          ) : (
            <RadioGroup
              value={userAnswer?.selectedOptions[0] !== undefined ? userAnswer.selectedOptions[0].toString() : ""}
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
                    <div>{renderText(option)}</div>
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
