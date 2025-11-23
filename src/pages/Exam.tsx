import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courses } from "@/data/coursesData";
import { UserAnswer, BlockScore } from "@/types/exam";
import { BlockHeader } from "@/components/exam/BlockHeader";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { ProgressBar } from "@/components/exam/ProgressBar";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronRight, ChevronLeft, Home, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Exam() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { toast } = useToast();
  
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  
  // Timer states
  const [showTimerDialog, setShowTimerDialog] = useState(true);
  const [timerHours, setTimerHours] = useState("2");
  const [timerMinutes, setTimerMinutes] = useState("0");
  const [examStarted, setExamStarted] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  
  // Cancel dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Find the exam and its course
  const courseData = courses.find(course => 
    course.exams.some(e => e.id === examId)
  );
  
  const exam = courseData?.exams.find(e => e.id === examId);

  if (!exam || !courseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Exam Not Found</h2>
          <Button onClick={() => navigate("/")}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const examBlocks = exam.blocks;
  const currentBlock = examBlocks[currentBlockIndex];
  const isLastBlock = currentBlockIndex === examBlocks.length - 1;

  const handleTimerDialogChange = (open: boolean) => {
    if (!open && !examStarted) {
      // User closed dialog without starting exam - go back to course page
      navigate(`/course/${courseData.id}`);
    }
    setShowTimerDialog(open);
  };

  // Timer countdown effect
  useEffect(() => {
    if (!examStarted || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast({
            title: "Time's up!",
            description: "Your exam time has expired. Submitting your answers now.",
            variant: "destructive",
          });
          setTimeout(() => handleSubmitExam(), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, remainingSeconds]);

  const handleStartExam = () => {
    const hours = parseInt(timerHours) || 0;
    const minutes = parseInt(timerMinutes) || 0;
    
    if (hours === 0 && minutes === 0) {
      toast({
        title: "Invalid time",
        description: "Please set a timer for at least 1 minute.",
        variant: "destructive",
      });
      return;
    }

    const total = hours * 3600 + minutes * 60;
    setTotalSeconds(total);
    setRemainingSeconds(total);
    setShowTimerDialog(false);
    setExamStarted(true);
    
    toast({
      title: "Exam started!",
      description: `Timer set for ${hours > 0 ? `${hours}h ` : ""}${minutes}min. Good luck!`,
    });
  };

  const handleCancelExam = () => {
    setShowCancelDialog(false);
    navigate("/");
  };

  const handleAnswerChange = (questionId: string, selectedOptions: number[]) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: { questionId, selectedOptions },
    });
  };

  const calculateAllBlockScores = (): BlockScore[] => {
    return examBlocks.map((block) => {
      let score = 0;

      block.questions.forEach((question) => {
        const userAnswer = userAnswers[question.id];
        if (!userAnswer || userAnswer.selectedOptions.length === 0) {
          // No answer: 0 points
          return;
        }

        const selectedSet = new Set(userAnswer.selectedOptions);
        const correctSet = new Set(question.correctAnswers);

        // Check if all selected answers are correct and all correct answers are selected
        const allCorrect =
          selectedSet.size === correctSet.size &&
          [...selectedSet].every((opt) => correctSet.has(opt));

        if (allCorrect) {
          score += 1; // Correct: +1
        } else {
          score -= 1; // Incorrect: -1
        }
      });

      // Apply non-negative constraint for all blocks except the last one
      if (!block.canBeNegative && score < 0) {
        score = 0;
      }

      return {
        blockId: block.id,
        score,
        maxScore: 5,
      };
    });
  };

  const handleSubmitExam = () => {
    const blockScores = calculateAllBlockScores();
    const answersArray = Object.values(userAnswers);
    navigate("/results", { 
      state: { 
        blockScores,
        userAnswers: answersArray,
        examBlocks
      } 
    });
  };

  const handleNextBlock = () => {
    setCurrentBlockIndex(currentBlockIndex + 1);
  };

  const handlePreviousBlock = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
    }
  };

  return (
    <>
      {/* Timer Setup Dialog */}
      <Dialog open={showTimerDialog} onOpenChange={handleTimerDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Set Exam Timer
            </DialogTitle>
            <DialogDescription>
              How much time do you want for this exam? You'll be notified when time runs out.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="23"
                value={timerHours}
                onChange={(e) => setTimerHours(e.target.value)}
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(e.target.value)}
                className="text-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleStartExam} className="w-full">
              Start Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this exam? All your progress will be lost and you'll return to the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelExam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exam Content */}
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with Timer and Cancel */}
          <div className="flex items-center justify-between gap-4">
            <ProgressBar current={currentBlockIndex + 1} total={examBlocks.length} />
            {examStarted && (
              <div className="flex items-center gap-3">
                <ExamTimer remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCancelDialog(true)}
                  title="Cancel exam and return home"
                >
                  <Home className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          <BlockHeader
            title={currentBlock.title}
            backgroundInfo={currentBlock.backgroundInfo}
          />

          <div className="space-y-4">
            {currentBlock.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                userAnswer={userAnswers[question.id]}
                onAnswerChange={handleAnswerChange}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePreviousBlock}
              disabled={currentBlockIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous Block
            </Button>

            <div className="flex gap-2">
              {!isLastBlock ? (
                <Button onClick={handleNextBlock}>
                  Next Block
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmitExam}>
                  Submit Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
