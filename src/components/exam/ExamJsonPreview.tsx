import { ExamJson } from "@/lib/examJsonValidator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExamJsonPreviewProps {
  examData: ExamJson;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExamJsonPreview({ examData, onConfirm, onCancel }: ExamJsonPreviewProps) {
  const totalQuestions = examData.blocks.reduce((sum, block) => sum + block.questions.length, 0);
  
  // Generate warnings and suggestions
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  examData.blocks.forEach((block, blockIdx) => {
    if (!block.backgroundInfo || block.backgroundInfo.trim() === "") {
      suggestions.push(`Block ${blockIdx + 1} ("${block.title}") has no background information`);
    }
    
    block.questions.forEach((question, qIdx) => {
      if (question.options.length === 2) {
        warnings.push(`Block ${blockIdx + 1}, Question ${qIdx + 1}: Only 2 options (consider adding more)`);
      }
      if (question.multipleCorrect && question.correctAnswers.length === 1) {
        warnings.push(`Block ${blockIdx + 1}, Question ${qIdx + 1}: multipleCorrect=true but only 1 correct answer`);
      }
      if (!question.multipleCorrect && question.correctAnswers.length > 1) {
        warnings.push(`Block ${blockIdx + 1}, Question ${qIdx + 1}: multipleCorrect=false but ${question.correctAnswers.length} correct answers`);
      }
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Preview Exam Structure</h2>
        <p className="text-muted-foreground">Review your exam before importing</p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Summary</CardTitle>
          <CardDescription>
            {examData.courseCode} - {examData.examTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Year:</span>
              <span className="ml-2 font-medium">{examData.examYear}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Semester:</span>
              <span className="ml-2 font-medium">{examData.examSemester}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Blocks:</span>
              <span className="ml-2 font-medium">{examData.blocks.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="ml-2 font-medium">{totalQuestions}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Visibility:</span>
              <Badge className="ml-2" variant={examData.isPublic ? "default" : "secondary"}>
                {examData.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Warnings ({warnings.length})</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Suggestions ({suggestions.length})</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Blocks Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Blocks & Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {examData.blocks.map((block, blockIdx) => (
                <div key={block.id} className="border-l-2 border-primary pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">
                        Block {blockIdx + 1}: {block.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {block.questions.length} question{block.questions.length !== 1 ? 's' : ''}
                        {block.canBeNegative && " • Negative scoring enabled"}
                      </p>
                    </div>
                  </div>
                  {block.backgroundInfo && (
                    <div className="text-sm text-muted-foreground mb-3 italic">
                      Background: {block.backgroundInfo.substring(0, 100)}
                      {block.backgroundInfo.length > 100 ? "..." : ""}
                    </div>
                  )}
                  <div className="space-y-3">
                    {block.questions.map((question, qIdx) => (
                      <div key={question.id} className="bg-muted/50 p-3 rounded-md text-sm">
                        <div className="font-medium mb-2">
                          {qIdx + 1}. {question.text.substring(0, 80)}
                          {question.text.length > 80 ? "..." : ""}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Options: {question.options.length}</div>
                          <div className="flex items-center gap-2">
                            <span>
                              Correct: {question.correctAnswers.map(idx => idx + 1).join(", ")}
                            </span>
                            <Badge variant={question.multipleCorrect ? "default" : "secondary"} className="text-xs">
                              {question.multipleCorrect ? "Multiple choice" : "Single choice"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Confirm & Import Exam
        </Button>
      </div>
    </div>
  );
}
