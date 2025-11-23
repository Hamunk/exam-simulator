import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { examBlocks } from "@/data/examData";
import { UserAnswer, BlockScore } from "@/types/exam";
import { BlockHeader } from "@/components/exam/BlockHeader";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { ProgressBar } from "@/components/exam/ProgressBar";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Exam() {
  const navigate = useNavigate();
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});

  const currentBlock = examBlocks[currentBlockIndex];
  const isLastBlock = currentBlockIndex === examBlocks.length - 1;

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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <ProgressBar current={currentBlockIndex + 1} total={examBlocks.length} />
        
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
  );
}
