import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/Header";
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, BookOpen, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { ExamBlock, Question } from "@/types/exam";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const basicInfoSchema = z.object({
  courseCode: z.string().min(1, "Course code is required").max(20),
  examTitle: z.string().min(1, "Exam title is required").max(200),
  examYear: z.string().min(4, "Year is required").max(4),
  examSemester: z.string().min(1, "Semester is required").max(20),
  isPublic: z.boolean().default(true),
});

const structureSchema = z.object({
  numBlocks: z.number().min(1, "At least 1 block required").max(20),
  questionsPerBlock: z.number().min(1, "At least 1 question per block").max(50),
});

type BasicInfo = z.infer<typeof basicInfoSchema>;
type Structure = z.infer<typeof structureSchema>;

interface QuestionData {
  text: string;
  options: string[];
  correctAnswers: number[];
  multipleCorrect: boolean;
}

interface BlockData {
  title: string;
  backgroundInfo: string;
  canBeNegative: boolean;
  questions: QuestionData[];
}

const CreateExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { courses } = useCourses();
  const [step, setStep] = useState<"basic" | "structure" | "blocks">("basic");
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [structure, setStructure] = useState<Structure | null>(null);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill course info from navigation state
  const state = location.state as { courseCode?: string; courseName?: string } | null;

  const basicForm = useForm<BasicInfo>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      courseCode: state?.courseCode || "",
      examTitle: "",
      examYear: new Date().getFullYear().toString(),
      examSemester: "Spring",
      isPublic: true,
    },
  });

  const structureForm = useForm<Structure>({
    resolver: zodResolver(structureSchema),
    defaultValues: {
      numBlocks: 1,
      questionsPerBlock: 5,
    },
  });

  const handleBasicSubmit = (data: BasicInfo) => {
    // Validate that course exists
    const courseExists = courses.some(
      (c) => c.code.toLowerCase() === data.courseCode.toLowerCase()
    );
    
    if (!courseExists) {
      toast.error(
        "Course not found. Please create the course first from the home page.",
        { duration: 5000 }
      );
      return;
    }
    
    setBasicInfo(data);
    setStep("structure");
  };

  const handleStructureSubmit = (data: Structure) => {
    setStructure(data);
    // Initialize blocks
    const initialBlocks: BlockData[] = Array.from({ length: data.numBlocks }, (_, i) => ({
      title: `Block ${i + 1}`,
      backgroundInfo: "",
      canBeNegative: false,
      questions: Array.from({ length: data.questionsPerBlock }, () => ({
        text: "",
        options: ["", ""],
        correctAnswers: [],
        multipleCorrect: false,
      })),
    }));
    setBlocks(initialBlocks);
    setCurrentBlockIndex(0);
    setStep("blocks");
  };

  const updateBlock = (index: number, updatedBlock: Partial<BlockData>) => {
    setBlocks((prev) => {
      const newBlocks = [...prev];
      newBlocks[index] = { ...newBlocks[index], ...updatedBlock };
      return newBlocks;
    });
  };

  const updateQuestion = (blockIndex: number, questionIndex: number, updatedQuestion: Partial<QuestionData>) => {
    setBlocks((prev) => {
      const newBlocks = [...prev];
      const newQuestions = [...newBlocks[blockIndex].questions];
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], ...updatedQuestion };
      newBlocks[blockIndex] = { ...newBlocks[blockIndex], questions: newQuestions };
      return newBlocks;
    });
  };

  const addOption = (blockIndex: number, questionIndex: number) => {
    const question = blocks[blockIndex].questions[questionIndex];
    updateQuestion(blockIndex, questionIndex, {
      options: [...question.options, ""],
    });
  };

  const removeOption = (blockIndex: number, questionIndex: number, optionIndex: number) => {
    const question = blocks[blockIndex].questions[questionIndex];
    if (question.options.length <= 2) {
      toast.error("A question must have at least 2 options");
      return;
    }
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    const newCorrectAnswers = question.correctAnswers
      .filter((i) => i !== optionIndex)
      .map((i) => (i > optionIndex ? i - 1 : i));
    updateQuestion(blockIndex, questionIndex, {
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    });
  };

  const toggleCorrectAnswer = (blockIndex: number, questionIndex: number, optionIndex: number) => {
    const question = blocks[blockIndex].questions[questionIndex];
    let newCorrectAnswers: number[];
    
    if (question.multipleCorrect) {
      if (question.correctAnswers.includes(optionIndex)) {
        newCorrectAnswers = question.correctAnswers.filter((i) => i !== optionIndex);
      } else {
        newCorrectAnswers = [...question.correctAnswers, optionIndex];
      }
    } else {
      newCorrectAnswers = [optionIndex];
    }
    
    updateQuestion(blockIndex, questionIndex, { correctAnswers: newCorrectAnswers });
  };

  const validateCurrentBlock = (): boolean => {
    const block = blocks[currentBlockIndex];
    if (!block.title.trim()) {
      toast.error("Block title is required");
      return false;
    }

    for (let i = 0; i < block.questions.length; i++) {
      const q = block.questions[i];
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1}: Question text is required`);
        return false;
      }
      if (q.options.some((opt) => !opt.trim())) {
        toast.error(`Question ${i + 1}: All options must have text`);
        return false;
      }
      if (q.correctAnswers.length === 0) {
        toast.error(`Question ${i + 1}: At least one correct answer must be selected`);
        return false;
      }
    }
    return true;
  };

  const handleNextBlock = () => {
    if (!validateCurrentBlock()) return;
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    } else {
      handleSubmitExam();
    }
  };

  const handlePreviousBlock = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!validateCurrentBlock()) return;
    if (!user || !basicInfo || !structure) return;
    if (isSubmitting) return; // Prevent duplicate submissions

    setIsSubmitting(true);
    try {
      const examBlocks: ExamBlock[] = blocks.map((block, i) => ({
        id: `block-${i + 1}`,
        title: block.title,
        backgroundInfo: block.backgroundInfo,
        canBeNegative: block.canBeNegative,
        questions: block.questions.map((q, j) => ({
          id: `q-${i + 1}-${j + 1}`,
          text: q.text,
          options: q.options,
          correctAnswers: q.correctAnswers,
          multipleCorrect: q.multipleCorrect,
        })),
      }));

      // Get course name from existing courses
      const course = courses.find(
        (c) => c.code.toLowerCase() === basicInfo.courseCode.toLowerCase()
      );
      
      const { error } = await supabase.from("user_exams").insert([{
        user_id: user.id,
        course_code: basicInfo.courseCode,
        course_name: course?.name || basicInfo.courseCode,
        exam_title: basicInfo.examTitle,
        exam_year: basicInfo.examYear,
        exam_semester: basicInfo.examSemester,
        blocks: examBlocks as any,
        is_public: basicInfo.isPublic,
      }]);

      if (error) throw error;

      toast.success("Exam created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error creating exam:", error);
      toast.error(error.message || "Failed to create exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to create exams.
            </p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentBlock = blocks[currentBlockIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Exam</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Help Dialog */}
          <div className="flex justify-end mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Exam Creation Guide</DialogTitle>
                  <DialogDescription>Learn how to create exams with rich content</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 text-sm">
                  <div>
                    <h3 className="font-semibold mb-2">Step 1: Basic Information</h3>
                    <p className="text-muted-foreground">
                      Enter course details, exam title, year, and semester.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Step 2: Structure</h3>
                    <p className="text-muted-foreground">
                      Define how many blocks and questions per block. This determines the overall exam structure.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Step 3: Block Details</h3>
                    <p className="text-muted-foreground mb-2">
                      For each block, provide a title, optional background information, and specify if negative scoring is allowed.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Adding Math Notation (LaTeX)</h3>
                    <p className="text-muted-foreground mb-2">Use LaTeX syntax for mathematical expressions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><code>$x^2$</code> for inline math: <InlineMath math="x^2" /></li>
                      <li><code>{"$$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$"}</code> for display math</li>
                      <li><code>{"$\\alpha, \\beta, \\gamma$"}</code> for Greek letters: <InlineMath math="\alpha, \beta, \gamma" /></li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Adding Code Snippets</h3>
                    <p className="text-muted-foreground mb-2">Use triple backticks with language for code:</p>
                    <pre className="bg-muted p-2 rounded text-xs">
{`\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\``}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Question Types</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Single Answer:</strong> Use radio buttons (only one correct answer)</li>
                      <li><strong>Multiple Answers:</strong> Use checkboxes (multiple correct answers allowed)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Tips</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>You can add or remove answer options as needed</li>
                      <li>At least one correct answer must be marked for each question</li>
                      <li>Background info can include context, code, or formulas</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Step 1: Basic Info */}
          {step === "basic" && (
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Create New Exam</h1>
                  <p className="text-muted-foreground">Step 1: Enter basic exam information</p>
                </div>

                <form onSubmit={basicForm.handleSubmit(handleBasicSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="courseCode">Course Code *</Label>
                    <Input
                      id="courseCode"
                      placeholder="e.g., TDT4172"
                      {...basicForm.register("courseCode")}
                    />
                    {basicForm.formState.errors.courseCode && (
                      <p className="text-sm text-destructive mt-1">
                        {basicForm.formState.errors.courseCode.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Course must exist. Create it from the home page first.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="examTitle">Exam Title *</Label>
                    <Input
                      id="examTitle"
                      placeholder="e.g., Midterm Exam"
                      {...basicForm.register("examTitle")}
                    />
                    {basicForm.formState.errors.examTitle && (
                      <p className="text-sm text-destructive mt-1">
                        {basicForm.formState.errors.examTitle.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="examYear">Year *</Label>
                      <Input
                        id="examYear"
                        placeholder="2024"
                        {...basicForm.register("examYear")}
                      />
                      {basicForm.formState.errors.examYear && (
                        <p className="text-sm text-destructive mt-1">
                          {basicForm.formState.errors.examYear.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="examSemester">Semester *</Label>
                      <Input
                        id="examSemester"
                        placeholder="Spring / Fall"
                        {...basicForm.register("examSemester")}
                      />
                      {basicForm.formState.errors.examSemester && (
                        <p className="text-sm text-destructive mt-1">
                          {basicForm.formState.errors.examSemester.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPublic" className="text-base">Make exam public</Label>
                      <p className="text-sm text-muted-foreground">
                        Public exams can be viewed by all users
                      </p>
                    </div>
                    <Switch
                      id="isPublic"
                      checked={basicForm.watch("isPublic")}
                      onCheckedChange={(checked) => basicForm.setValue("isPublic", checked)}
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/")}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {/* Step 2: Structure */}
          {step === "structure" && (
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Exam Structure</h1>
                  <p className="text-muted-foreground">Step 2: Define the exam structure</p>
                </div>

                <form onSubmit={structureForm.handleSubmit(handleStructureSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="numBlocks">Number of Blocks *</Label>
                    <Input
                      id="numBlocks"
                      type="number"
                      min="1"
                      max="20"
                      {...structureForm.register("numBlocks", { valueAsNumber: true })}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Blocks are sections that group related questions together
                    </p>
                    {structureForm.formState.errors.numBlocks && (
                      <p className="text-sm text-destructive mt-1">
                        {structureForm.formState.errors.numBlocks.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="questionsPerBlock">Questions per Block *</Label>
                    <Input
                      id="questionsPerBlock"
                      type="number"
                      min="1"
                      max="50"
                      {...structureForm.register("questionsPerBlock", { valueAsNumber: true })}
                    />
                    {structureForm.formState.errors.questionsPerBlock && (
                      <p className="text-sm text-destructive mt-1">
                        {structureForm.formState.errors.questionsPerBlock.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep("basic")}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button type="submit">
                      Create Blocks <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {/* Step 3: Block Details */}
          {step === "blocks" && currentBlock && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Block {currentBlockIndex + 1} of {blocks.length}
                    </h2>
                    <p className="text-muted-foreground">Fill in block details and questions</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentBlockIndex + 1} / {blocks.length}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="blockTitle">Block Title *</Label>
                    <Input
                      id="blockTitle"
                      value={currentBlock.title}
                      onChange={(e) =>
                        updateBlock(currentBlockIndex, { title: e.target.value })
                      }
                      placeholder="e.g., Data Structures"
                    />
                  </div>

                  <div>
                    <Label htmlFor="backgroundInfo">Background Information (Optional)</Label>
                    <Textarea
                      id="backgroundInfo"
                      value={currentBlock.backgroundInfo}
                      onChange={(e) =>
                        updateBlock(currentBlockIndex, { backgroundInfo: e.target.value })
                      }
                      placeholder="Context, code, or formulas that apply to all questions in this block..."
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports LaTeX (use $ or $$) and code blocks (use ```)
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canBeNegative"
                      checked={currentBlock.canBeNegative}
                      onCheckedChange={(checked) =>
                        updateBlock(currentBlockIndex, { canBeNegative: checked as boolean })
                      }
                    />
                    <Label htmlFor="canBeNegative" className="cursor-pointer">
                      Allow negative scoring for this block
                    </Label>
                  </div>
                </div>
              </Card>

              {/* Questions */}
              <div className="space-y-6">
                {currentBlock.questions.map((question, qIndex) => (
                  <Card key={qIndex} className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Question {qIndex + 1}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`question-${qIndex}`}>Question Text *</Label>
                        <Textarea
                          id={`question-${qIndex}`}
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(currentBlockIndex, qIndex, { text: e.target.value })
                          }
                          placeholder="Enter your question. Use $ for inline math or $$ for display math. Use ```python for code blocks."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`multiple-${qIndex}`}
                          checked={question.multipleCorrect}
                          onCheckedChange={(checked) => {
                            updateQuestion(currentBlockIndex, qIndex, {
                              multipleCorrect: checked as boolean,
                              correctAnswers: [],
                            });
                          }}
                        />
                        <Label htmlFor={`multiple-${qIndex}`} className="cursor-pointer">
                          Multiple correct answers (checkboxes)
                        </Label>
                      </div>

                      <div>
                        <Label>Answer Options *</Label>
                        <div className="space-y-2 mt-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-start gap-2">
                              {question.multipleCorrect ? (
                                <Checkbox
                                  checked={question.correctAnswers.includes(optIndex)}
                                  onCheckedChange={() =>
                                    toggleCorrectAnswer(currentBlockIndex, qIndex, optIndex)
                                  }
                                  className="mt-3"
                                />
                              ) : (
                                <RadioGroup
                                  value={question.correctAnswers[0]?.toString() || ""}
                                  onValueChange={(value) =>
                                    toggleCorrectAnswer(currentBlockIndex, qIndex, parseInt(value))
                                  }
                                >
                                  <RadioGroupItem
                                    value={optIndex.toString()}
                                    className="mt-3"
                                  />
                                </RadioGroup>
                              )}
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optIndex] = e.target.value;
                                  updateQuestion(currentBlockIndex, qIndex, {
                                    options: newOptions,
                                  });
                                }}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1"
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeOption(currentBlockIndex, qIndex, optIndex)
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(currentBlockIndex, qIndex)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousBlock}
                  disabled={currentBlockIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Block
                </Button>
                <Button onClick={handleNextBlock} disabled={isSubmitting}>
                  {currentBlockIndex === blocks.length - 1 ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Creating..." : "Create Exam"}
                    </>
                  ) : (
                    <>
                      Next Block
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
