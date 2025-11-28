import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/Header";
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, BookOpen, HelpCircle, Upload, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { ExamBlock, Question } from "@/types/exam";
import { validateExamJson, ExamJson } from "@/lib/examJsonValidator";
import { ExamJsonGuide } from "@/components/exam/ExamJsonGuide";
import { ExamJsonPreview } from "@/components/exam/ExamJsonPreview";
import { RichTextEditor } from "@/components/exam/RichTextEditor";
import { OptionEditor } from "@/components/exam/OptionEditor";
import { useExamDrafts } from "@/hooks/useExamDrafts";
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
  const { saveDraft } = useExamDrafts();
  const [step, setStep] = useState<"basic" | "structure" | "blocks">("basic");
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [structure, setStructure] = useState<Structure | null>(null);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showJsonUpload, setShowJsonUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExamJson | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-fill course info from navigation state, draft, or editExam
  const state = location.state as { courseCode?: string; courseName?: string; draft?: any; editExam?: any } | null;
  const [isEditMode, setIsEditMode] = useState(false);
  const [editExamId, setEditExamId] = useState<string | null>(null);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (step === "blocks" && basicInfo && structure && blocks.length > 0) {
      autoSaveTimerRef.current = setInterval(() => {
        handleSaveDraft(true); // silent save
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [step, basicInfo, structure, blocks]);

  // Load draft or editExam if passed in state
  useEffect(() => {
    if (state?.draft) {
      const draft = state.draft;
      setDraftId(draft.id);
      setBasicInfo({
        courseCode: draft.course_code,
        examTitle: draft.exam_title,
        examYear: draft.exam_year,
        examSemester: draft.exam_semester,
        isPublic: draft.is_public,
      });

      if (draft.draft_data) {
        const draftData = draft.draft_data;
        if (draftData.structure) {
          setStructure(draftData.structure);
        }
        if (draftData.blocks) {
          setBlocks(draftData.blocks);
        }
        if (draftData.currentStep) {
          setStep(draftData.currentStep);
        }
        if (draftData.currentBlockIndex !== undefined) {
          setCurrentBlockIndex(draftData.currentBlockIndex);
        }
      }
    } else if (state?.editExam) {
      const exam = state.editExam;
      setIsEditMode(true);
      setEditExamId(exam.id);
      setBasicInfo({
        courseCode: exam.course_code,
        examTitle: exam.exam_title,
        examYear: exam.exam_year,
        examSemester: exam.exam_semester,
        isPublic: exam.is_public,
      });

      // Convert exam blocks to BlockData format
      const examBlocks: BlockData[] = exam.blocks.map((block: any) => ({
        title: block.title,
        backgroundInfo: block.backgroundInfo || "",
        canBeNegative: block.canBeNegative || false,
        questions: block.questions.map((q: any) => ({
          text: q.text,
          options: q.options,
          correctAnswers: q.correctAnswers,
          multipleCorrect: q.multipleCorrect || false,
        })),
      }));

      setStructure({
        numBlocks: examBlocks.length,
        questionsPerBlock: examBlocks[0]?.questions.length || 5,
      });
      setBlocks(examBlocks);
      setStep("blocks");
    }
  }, []);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please upload a JSON file");
      return;
    }

    setUploadedFile(file);
  };

  const handleJsonImport = async () => {
    if (!uploadedFile || !user) return;

    setIsSubmitting(true);
    try {
      const text = await uploadedFile.text();
      const json = JSON.parse(text);
      
      const validationResult = validateExamJson(json);
      
      if (validationResult.success === false) {
        toast.error("Invalid JSON format", {
          description: validationResult.errors.join(", "),
          duration: 5000,
        });
        return;
      }

      // Now TypeScript knows it's the success case
      const examData = validationResult.data;

      // Check if course exists
      const courseExists = courses.some(
        (c) => c.code.toLowerCase() === examData.courseCode.toLowerCase()
      );
      
      if (!courseExists) {
        toast.error(
          `Course ${examData.courseCode} not found. Please create the course first.`,
          { duration: 5000 }
        );
        return;
      }

      // Show preview instead of directly submitting
      setPreviewData(examData);
      setShowJsonUpload(false);
    } catch (error: any) {
      console.error("Error validating exam:", error);
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format. Please check your file.");
      } else {
        toast.error(error.message || "Failed to validate exam");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || !user) return;

    setIsSubmitting(true);
    try {
      const course = courses.find(
        (c) => c.code.toLowerCase() === previewData.courseCode.toLowerCase()
      );

      // Insert into database
      const { error } = await supabase.from("user_exams").insert([{
        user_id: user.id,
        course_code: previewData.courseCode,
        course_name: course?.name || previewData.courseCode,
        exam_title: previewData.examTitle,
        exam_year: previewData.examYear,
        exam_semester: previewData.examSemester,
        blocks: previewData.blocks as any,
        is_public: previewData.isPublic,
      }]);

      if (error) throw error;

      toast.success("Exam imported successfully!");
      navigate(`/course/user-${previewData.courseCode.toLowerCase().replace(/\s+/g, "-")}`);
    } catch (error: any) {
      console.error("Error importing exam:", error);
      toast.error(error.message || "Failed to import exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setUploadedFile(null);
    setShowJsonUpload(true);
  };

  const handleSaveDraft = async (silent = false) => {
    if (!user || !basicInfo) return;

    setIsSavingDraft(true);
    try {
      const course = courses.find(
        (c) => c.code.toLowerCase() === basicInfo.courseCode.toLowerCase()
      );

      const draftData = {
        structure,
        blocks,
        currentStep: step,
        currentBlockIndex,
      };

      const result = await saveDraft({
        id: draftId || undefined,
        course_code: basicInfo.courseCode,
        course_name: course?.name || basicInfo.courseCode,
        exam_title: basicInfo.examTitle,
        exam_year: basicInfo.examYear,
        exam_semester: basicInfo.examSemester,
        blocks: blocks.map((block, i) => ({
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
        })),
        draft_data: draftData,
      });

      if (result.error) throw result.error;

      // Capture the draft ID if this was a new draft
      if (result.id && !draftId) {
        setDraftId(result.id);
      }

      if (!silent) {
        toast.success("Draft saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      if (!silent) {
        toast.error(error.message || "Failed to save draft");
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!validateCurrentBlock()) return;
    if (!user || !basicInfo || !structure) return;
    if (isSubmitting) return;

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

      const course = courses.find(
        (c) => c.code.toLowerCase() === basicInfo.courseCode.toLowerCase()
      );
      
      if (isEditMode && editExamId) {
        // Update existing published exam
        const { error } = await supabase
          .from("user_exams")
          .update({
            course_code: basicInfo.courseCode,
            course_name: course?.name || basicInfo.courseCode,
            exam_title: basicInfo.examTitle,
            exam_year: basicInfo.examYear,
            exam_semester: basicInfo.examSemester,
            blocks: examBlocks as any,
            is_public: basicInfo.isPublic,
          })
          .eq("id", editExamId);

        if (error) throw error;
        toast.success("Exam updated successfully!");
      } else if (draftId) {
        // Update existing draft to published
        const { error } = await supabase
          .from("user_exams")
          .update({
            blocks: examBlocks as any,
            is_draft: false,
            draft_data: null,
          })
          .eq("id", draftId);

        if (error) throw error;
        toast.success("Exam created successfully!");
      } else {
        // Create new exam
        const { error } = await supabase.from("user_exams").insert([{
          user_id: user.id,
          course_code: basicInfo.courseCode,
          course_name: course?.name || basicInfo.courseCode,
          exam_title: basicInfo.examTitle,
          exam_year: basicInfo.examYear,
          exam_semester: basicInfo.examSemester,
          blocks: examBlocks as any,
          is_public: basicInfo.isPublic,
          is_draft: false,
        }]);

        if (error) throw error;
        toast.success("Exam created successfully!");
      }

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
          {step === "basic" && !showJsonUpload && (
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{isEditMode ? "Edit Exam" : "Create New Exam"}</h1>
                  <p className="text-muted-foreground">Step 1: Enter basic exam information</p>
                </div>

                <form onSubmit={basicForm.handleSubmit(handleBasicSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="courseCode">Course Code</Label>
                    <Input
                      id="courseCode"
                      placeholder="e.g., TDT4172"
                      {...basicForm.register("courseCode")}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Inherited from selected course
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

                {/* Upload JSON Alternative */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowJsonUpload(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload exam JSON instead
                </Button>
              </div>
            </Card>
          )}

          {/* JSON Upload Interface */}
          {showJsonUpload && (
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Import Exam from JSON</h1>
                    <p className="text-muted-foreground">Upload a JSON file or use AI to format your exam</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowJsonUpload(false);
                      setUploadedFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <ExamJsonGuide />
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {!uploadedFile ? (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-semibold mb-1">Upload JSON File</p>
                        <p className="text-sm text-muted-foreground">
                          Click to browse or drag and drop your exam JSON file
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Check className="w-12 h-12 mx-auto text-success" />
                      <div>
                        <p className="text-lg font-semibold mb-1">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setUploadedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                        >
                          Remove
                        </Button>
                         <Button
                           type="button"
                           onClick={handleJsonImport}
                           disabled={isSubmitting}
                         >
                           {isSubmitting ? "Validating..." : "Validate & Preview"}
                         </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* JSON Preview Step */}
          {previewData && (
            <Card className="p-8">
              <ExamJsonPreview
                examData={previewData}
                onConfirm={handleConfirmImport}
                onCancel={handleCancelPreview}
              />
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

                  <RichTextEditor
                    label="Background Information (Optional)"
                    value={currentBlock.backgroundInfo}
                    onChange={(value) =>
                      updateBlock(currentBlockIndex, { backgroundInfo: value })
                    }
                    placeholder="Context, code, or formulas that apply to all questions in this block..."
                  />

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
                      <RichTextEditor
                        label="Question Text *"
                        value={question.text}
                        onChange={(value) =>
                          updateQuestion(currentBlockIndex, qIndex, { text: value })
                        }
                        placeholder="Enter your question. Use $ for inline math or $$ for display math. Use ```python for code blocks."
                      />

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
                              <div className="flex-1">
                                <OptionEditor
                                  value={option}
                                  onChange={(value) => {
                                    const newOptions = [...question.options];
                                    newOptions[optIndex] = value;
                                    updateQuestion(currentBlockIndex, qIndex, {
                                      options: newOptions,
                                    });
                                  }}
                                  placeholder={`Option ${optIndex + 1}`}
                                />
                              </div>
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousBlock}
                    disabled={currentBlockIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous Block
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSaveDraft(false)}
                    disabled={isSavingDraft || !basicInfo}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSavingDraft ? "Saving..." : "Save as Draft"}
                  </Button>
                </div>
                <Button onClick={handleNextBlock} disabled={isSubmitting}>
                  {currentBlockIndex === blocks.length - 1 ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {isSubmitting 
                        ? (isEditMode ? "Updating..." : "Creating...") 
                        : (isEditMode ? "Update Exam" : "Create Exam")}
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
