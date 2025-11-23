import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, FileText, Plus, CheckCircle2, Trophy } from "lucide-react";
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

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const { getCourseById, loading } = useCourses();
  
  const course = getCourseById(courseId || "");
  const { hasAttempted, loading: attemptsLoading } = useExamAttemptStatus(course?.code || "");
  const { getBestScore, loading: scoresLoading } = useExamBestScores(course?.code || "");

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
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{exam.year}</span>
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
    </div>
  );
};

export default CourseDetail;
