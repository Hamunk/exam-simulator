import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { UserAnswer, BlockScore } from "@/types/exam";
import { BlockHeader } from "@/components/exam/BlockHeader";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { ProgressBar } from "@/components/exam/ProgressBar";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCourses } from "@/hooks/useCourses";
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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ChevronRight, ChevronLeft, Home, Clock, Save, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useExamAttempts } from "@/hooks/useExamAttempts";
import { Link } from "react-router-dom";

export default function Exam() {
  const navigate = useNavigate();
  const location = useLocation();
  const { examId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createAttempt, updateAttempt } = useExamAttempts();
  const { getExamById, loading: coursesLoading } = useCourses();
  
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [existingAttempt, setExistingAttempt] = useState<any>(null);
  const [additionalMinutes, setAdditionalMinutes] = useState("0");
  
  // Block time tracking
  const [blockStartTime, setBlockStartTime] = useState<number>(Date.now());
  const [blockTimeSpent, setBlockTimeSpent] = useState<Record<string, number>>({});
  
  // Timer states
  const [showTimerDialog, setShowTimerDialog] = useState(true);
  const [timerHours, setTimerHours] = useState("2");
  const [timerMinutes, setTimerMinutes] = useState("0");
  const [examStarted, setExamStarted] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  
  // Cancel dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelDestination, setCancelDestination] = useState<string>("/");
  const [isSaving, setIsSaving] = useState(false);
  
  // Auto-save reference
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Find the exam and its course
  const examData = getExamById(examId || "");
  const exam = examData?.exam;
  const courseData = examData?.course;

  // Check if we're resuming from history (only show resume dialog if coming from history)
  useEffect(() => {
    const resumeAttempt = location.state?.resumeAttempt;
    
    if (resumeAttempt && user) {
      console.log("Resuming attempt from history:", resumeAttempt);
      setExistingAttempt(resumeAttempt);
      setShowResumeDialog(true);
      setShowTimerDialog(false);
    }
  }, [location.state, user]);

  // Auto-save progress every 30 seconds
  const saveProgress = useCallback(async () => {
    if (!currentAttemptId || !examStarted || isSaving) return;

    setIsSaving(true);
    try {
      await updateAttempt(currentAttemptId, {
        user_answers: userAnswers,
        current_block_index: currentBlockIndex,
        remaining_seconds: remainingSeconds,
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentAttemptId, userAnswers, currentBlockIndex, remainingSeconds, examStarted, isSaving]);

  useEffect(() => {
    if (!examStarted || !currentAttemptId) return;

    // Save immediately when answers or block changes
    saveProgress();

    // Set up auto-save timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(() => {
      saveProgress();
    }, 30000); // Auto-save every 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [examStarted, currentAttemptId, saveProgress]);

  // Define these before early returns to keep hooks order consistent
  const examBlocks = exam?.blocks || [];
  const currentBlock = examBlocks[currentBlockIndex];
  const isLastBlock = currentBlockIndex === examBlocks.length - 1;

  // Early return after all hooks have been called
  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Loading exam...</h2>
        </div>
      </div>
    );
  }

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

  const handleResumeExam = async () => {
    if (!existingAttempt) return;

    const additionalTime = parseInt(additionalMinutes) || 0;
    const newRemainingSeconds = existingAttempt.remaining_seconds + (additionalTime * 60);

    setCurrentAttemptId(existingAttempt.id);
    setUserAnswers(existingAttempt.user_answers);
    setCurrentBlockIndex(existingAttempt.current_block_index);
    setTotalSeconds(existingAttempt.total_seconds + (additionalTime * 60));
    setRemainingSeconds(newRemainingSeconds);
    setExamStarted(true);
    setShowResumeDialog(false);
    
    // Restore block time tracking if it exists
    if (existingAttempt.block_scores) {
      const timeTracking: Record<string, number> = {};
      existingAttempt.block_scores.forEach((bs: any) => {
        if (bs.timeSpentSeconds) {
          timeTracking[bs.blockId] = bs.timeSpentSeconds;
        }
      });
      setBlockTimeSpent(timeTracking);
    }
    
    // Reset start time for current block
    setBlockStartTime(Date.now());
    
    // Update the attempt with new remaining time if added
    if (additionalTime > 0) {
      await updateAttempt(existingAttempt.id, {
        remaining_seconds: newRemainingSeconds,
      });
    }

    toast({
      title: "Exam resumed",
      description: additionalTime > 0 
        ? `Continuing with ${additionalTime} extra minutes added.`
        : "Continuing from where you left off.",
    });
  };

  const handleStartFreshExam = async () => {
    // If there's an existing attempt, mark it as abandoned before starting fresh
    if (existingAttempt) {
      await updateAttempt(existingAttempt.id, {
        status: "abandoned",
      });
    }
    
    setExistingAttempt(null);
    setShowResumeDialog(false);
    setShowTimerDialog(true);
  };

  const handleTimerDialogChange = (open: boolean) => {
    if (!open && !examStarted && courseData) {
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

  const handleStartExam = async () => {
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

    // Create exam attempt if user is logged in
    if (user && exam && courseData) {
      const { data, error } = await createAttempt({
        exam_id: examId!,
        course_code: courseData.code,
        course_name: courseData.name,
        exam_title: exam.title,
        exam_data: examBlocks,
        total_seconds: total,
        remaining_seconds: total,
      });

      if (data) {
        setCurrentAttemptId(data.id);
      } else if (error) {
        console.error("Failed to create exam attempt:", error);
      }
    }
    
    toast({
      title: "Exam started!",
      description: `Timer set for ${hours > 0 ? `${hours}h ` : ""}${minutes}min. Good luck!`,
    });
  };

  const handleCancelExam = async () => {
    // Save progress before canceling
    if (currentAttemptId && user) {
      await updateAttempt(currentAttemptId, {
        user_answers: userAnswers,
        current_block_index: currentBlockIndex,
        remaining_seconds: remainingSeconds,
        status: "abandoned",
      });

      toast({
        title: "Progress saved",
        description: "Your exam progress has been saved. You can resume later from your history.",
      });
    }

    setShowCancelDialog(false);
    navigate(cancelDestination);
  };

  const handleBreadcrumbClick = (e: React.MouseEvent, destination: string) => {
    if (examStarted) {
      e.preventDefault();
      setCancelDestination(destination);
      setShowCancelDialog(true);
    }
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
        timeSpentSeconds: blockTimeSpent[block.id] || 0,
      };
    });
  };

  const handleSubmitExam = async () => {
    // Record time spent on final block
    const currentBlockId = examBlocks[currentBlockIndex].id;
    const timeSpent = Math.floor((Date.now() - blockStartTime) / 1000);
    const finalBlockTimeSpent = {
      ...blockTimeSpent,
      [currentBlockId]: (blockTimeSpent[currentBlockId] || 0) + timeSpent,
    };
    setBlockTimeSpent(finalBlockTimeSpent);
    
    const blockScores = calculateAllBlockScores();
    
    // Update block scores with final time tracking
    const blockScoresWithTime = blockScores.map(bs => ({
      ...bs,
      timeSpentSeconds: finalBlockTimeSpent[bs.blockId] || 0,
    }));
    
    const answersArray = Object.values(userAnswers);
    
    // Save completed exam attempt if user is logged in
    if (currentAttemptId && user) {
      const totalScore = blockScoresWithTime.reduce((sum, bs) => sum + bs.score, 0);
      const maxScore = blockScoresWithTime.length * 5;
      const percentage = (totalScore / maxScore) * 100;

      await updateAttempt(currentAttemptId, {
        user_answers: userAnswers,
        current_block_index: currentBlockIndex,
        remaining_seconds: remainingSeconds,
        status: "completed",
        block_scores: blockScoresWithTime,
        total_score: totalScore,
        max_score: maxScore,
        percentage: Number(percentage.toFixed(2)),
        completed_at: new Date().toISOString(),
      });
    }

    navigate("/results", { 
      state: { 
        blockScores: blockScoresWithTime,
        userAnswers: answersArray,
        examBlocks,
        attemptId: currentAttemptId,
        courseId: courseData.id,
        courseName: courseData.name,
      } 
    });
  };

  const handleNextBlock = () => {
    // Record time spent on current block
    const currentBlockId = examBlocks[currentBlockIndex].id;
    const timeSpent = Math.floor((Date.now() - blockStartTime) / 1000);
    setBlockTimeSpent(prev => ({
      ...prev,
      [currentBlockId]: (prev[currentBlockId] || 0) + timeSpent,
    }));
    
    // Move to next block and reset timer
    setCurrentBlockIndex(currentBlockIndex + 1);
    setBlockStartTime(Date.now());
  };

  const handlePreviousBlock = () => {
    if (currentBlockIndex > 0) {
      // Record time spent on current block
      const currentBlockId = examBlocks[currentBlockIndex].id;
      const timeSpent = Math.floor((Date.now() - blockStartTime) / 1000);
      setBlockTimeSpent(prev => ({
        ...prev,
        [currentBlockId]: (prev[currentBlockId] || 0) + timeSpent,
      }));
      
      // Move to previous block and reset timer
      setCurrentBlockIndex(currentBlockIndex - 1);
      setBlockStartTime(Date.now());
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

      {/* Resume Exam Dialog */}
      {exam && courseData && (
        <Dialog open={showResumeDialog} onOpenChange={(open) => {
          if (!open && existingAttempt) {
            // If closing without action, go back
            navigate(`/course/${courseData.id}`);
          }
          setShowResumeDialog(open);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Resume Exam
              </DialogTitle>
              <DialogDescription>
                You have an unfinished exam attempt with time remaining.
              </DialogDescription>
            </DialogHeader>
            
            {existingAttempt && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress:</span>
                    <span className="font-semibold">
                      Block {existingAttempt.current_block_index + 1} of {exam.blocks.length}
                    </span>
                  </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Questions answered:</span>
                  <span className="font-semibold">
                    {Object.keys(existingAttempt.user_answers).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time remaining:</span>
                  <span className="font-semibold text-primary">
                    {Math.floor(existingAttempt.remaining_seconds / 3600)}h{" "}
                    {Math.floor((existingAttempt.remaining_seconds % 3600) / 60)}m
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-time">Add extra time (minutes, optional)</Label>
                <Input
                  id="additional-time"
                  type="number"
                  min="0"
                  max="180"
                  value={additionalMinutes}
                  onChange={(e) => setAdditionalMinutes(e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Add more time if needed, or leave at 0 to continue with current time.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleStartFreshExam} className="w-full sm:w-auto">
              Start Fresh
            </Button>
            <Button onClick={handleResumeExam} className="w-full sm:w-auto">
              <PlayCircle className="w-4 h-4 mr-2" />
              Resume Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save and exit this exam? {user ? "Your progress will be saved and you can resume later from your history." : "All your progress will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelExam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {user ? "Save & Exit" : "Cancel Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exam Content */}
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          {examStarted && (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" onClick={(e) => handleBreadcrumbClick(e, "/")}>Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/course/${courseData.id}`} onClick={(e) => handleBreadcrumbClick(e, `/course/${courseData.id}`)}>
                      {courseData.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{exam.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}

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
