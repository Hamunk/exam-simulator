import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, FileText, Plus, CheckCircle2, Trophy, Download, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { useCourses } from "@/hooks/useCourses";
import { useExamAttemptStatus } from "@/hooks/useExamAttemptStatus";
import { useExamBestScores } from "@/hooks/useExamBestScores";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Exam } from "@/data/coursesData";
import { useUserExams } from "@/hooks/useUserExams";
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
import { useState } from "react";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const { getCourseById, loading } = useCourses();
  const { deleteUserExam } = useUserExams();
  
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const course = getCourseById(courseId || "");
  const { hasAttempted, loading: attemptsLoading } = useExamAttemptStatus(course?.code || "");
  const { getBestScore, loading: scoresLoading } = useExamBestScores(course?.code || "");

  const handleExportExam = (exam: Exam, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const examJson = {
      courseCode: course?.code || "",
      examTitle: exam.title,
      examYear: exam.year,
      examSemester: exam.semester,
      isPublic: exam.isPublic || false,
      blocks: exam.blocks,
    };

    const jsonString = JSON.stringify(examJson, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course?.code}_${exam.title}_${exam.year}_${exam.semester}.json`.replace(/\s+/g, "_");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Exam JSON exported successfully!");
  };

  const handleEditExam = (exam: Exam, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/create-exam", { 
      state: { 
        editExam: {
          id: exam.id,
          course_code: course?.code || "",
          course_name: course?.name || "",
          exam_title: exam.title,
          exam_year: exam.year,
          exam_semester: exam.semester,
          is_public: exam.isPublic || false,
          blocks: exam.blocks,
        }
      } 
    });
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    
    const { error } = await deleteUserExam(examToDelete);
    
    if (error) {
      toast.error("Failed to delete exam");
    } else {
      toast.success("Exam deleted successfully");
    }
    
    setExamToDelete(null);
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading course...</p>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h2>
          <Button onClick={() => navigate("/")}>Back to Courses</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{course.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                {course.code}
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                {course.name}
              </h1>
              <p className="text-muted-foreground">
                Select an exam to start practicing
              </p>
            </div>
            {user && (
              <Button 
                onClick={() => navigate("/create-exam", { 
                  state: { courseCode: course.code, courseName: course.name } 
                })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Exam
              </Button>
            )}
          </div>

          {/* Exams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.exams.map((exam) => {
              const attempted = user ? hasAttempted(exam.id) : false;
              const bestScore = user ? getBestScore(exam.id) : null;
              
              // Determine score color
              const getScoreColor = (score: number) => {
                if (score >= 80) return "text-green-600 dark:text-green-500";
                if (score >= 60) return "text-yellow-600 dark:text-yellow-500";
                return "text-red-600 dark:text-red-500";
              };
              
              return (
                <Card
                  key={exam.id}
                  className="p-6 hover:shadow-elevated transition-all cursor-pointer group relative"
                  onClick={() => navigate(`/exam/${exam.id}`)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{exam.year}</span>
                          </div>
                          {user && exam.userId === user.id && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => handleEditExam(exam, e)}
                                title="Edit exam"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => handleExportExam(exam, e)}
                                title="Export exam JSON"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExamToDelete(exam.id);
                                  setShowDeleteDialog(true);
                                }}
                                title="Delete exam"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        {user && attempted && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Attempted
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {exam.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {exam.blocks.length} blocks · {exam.blocks.reduce((acc, block) => acc + block.questions.length, 0)} questions
                      </p>
                      {typeof bestScore === 'number' && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className={`font-semibold ${getScoreColor(bestScore)}`}>
                            Best: {bestScore}%
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/exam/${exam.id}`);
                      }}
                    >
                      {attempted ? "Redo Exam" : "Start Exam"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {course.exams.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No exams available for this course yet.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setExamToDelete(null);
              setShowDeleteDialog(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseDetail;
