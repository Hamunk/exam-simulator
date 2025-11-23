import { useLocation, useNavigate } from "react-router-dom";
import { BlockScore, ExamBlock, UserAnswer } from "@/types/exam";
import { ScoreDisplay } from "@/components/exam/ScoreDisplay";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { BlockHeader } from "@/components/exam/BlockHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Home } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const blockScores = (location.state?.blockScores || []) as BlockScore[];
  const userAnswers = (location.state?.userAnswers || []) as UserAnswer[];
  const blocks = (location.state?.examBlocks || []) as ExamBlock[];
  const attemptId = location.state?.attemptId;
  const courseId = location.state?.courseId;
  const courseName = location.state?.courseName;
  
  // Auto-expand review if coming from history (has attemptId but no courseId)
  const fromHistory = attemptId && !courseId;
  const [showReview, setShowReview] = useState(fromHistory);

  const totalScore = blockScores.reduce((sum, bs) => sum + bs.score, 0);
  const maxTotalScore = blockScores.length * 5;
  const percentage = (totalScore / maxTotalScore) * 100;

  const getOverallFeedback = () => {
    if (percentage >= 90) return "Outstanding! Excellent work! 🎉";
    if (percentage >= 80) return "Great job! Very solid performance! 👏";
    if (percentage >= 70) return "Good work! Keep it up! 👍";
    if (percentage >= 60) return "Not bad! Room for improvement. 📚";
    return "Keep studying and try again! 💪";
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const totalTimeSpent = blockScores.reduce((sum, bs) => sum + (bs.timeSpentSeconds || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {fromHistory ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/history">History</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Results</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : courseId ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/course/${courseId}`}>{courseName || "Course"}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Results</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>Results</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>

        <Card className="p-8 text-center shadow-elevated">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Exam Complete!
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {getOverallFeedback()}
          </p>
          
          <div className="inline-block">
            <div className="text-6xl font-bold text-primary mb-2">
              {totalScore}
            </div>
            <div className="text-muted-foreground">
              out of {maxTotalScore} points ({Math.round(percentage)}%)
            </div>
          </div>
        </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Block Breakdown
            </h2>
            {blockScores.map((blockScore, index) => {
              const block = blocks.find((b) => b.id === blockScore.blockId);
              return (
                <div key={blockScore.blockId} className="space-y-2">
                  <ScoreDisplay
                    score={blockScore.score}
                    maxScore={blockScore.maxScore}
                    blockTitle={block?.title || `Block ${index + 1}`}
                  />
                  {blockScore.timeSpentSeconds !== undefined && blockScore.timeSpentSeconds > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pl-4">
                      <Clock className="w-4 h-4" />
                      <span>Time spent: {formatTime(blockScore.timeSpentSeconds)}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {totalTimeSpent > 0 && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Total Time</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {formatTime(totalTimeSpent)}
                  </span>
                </div>
              </Card>
            )}
          </div>

        <div className="flex gap-4 justify-center pt-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={() => setShowReview(!showReview)}>
            {showReview ? "Hide Review" : "Review Answers"}
          </Button>
        </div>

        {showReview && (
          <div className="space-y-8 mt-8">
            <h2 className="text-2xl font-bold text-foreground">
              Answer Review
            </h2>
            {blocks.map((block) => (
              <div key={block.id} className="space-y-4">
                <BlockHeader
                  title={block.title}
                  backgroundInfo={block.backgroundInfo}
                />
                <div className="space-y-4">
                  {block.questions.map((question, questionIndex) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      questionNumber={questionIndex + 1}
                      userAnswer={userAnswers.find(
                        (ua) => ua.questionId === question.id
                      )}
                      onAnswerChange={() => {}}
                      showResults={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
