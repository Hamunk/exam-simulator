import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { courses } from "@/data/coursesData";
import { Header } from "@/components/Header";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const course = courses.find((c) => c.id === courseId);

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
          {/* Header */}
          <div>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
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
          </div>

          {/* Exams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.exams.map((exam) => (
              <Card
                key={exam.id}
                className="p-6 hover:shadow-elevated transition-all cursor-pointer group"
                onClick={() => navigate(`/exam/${exam.id}`)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{exam.year}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {exam.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {exam.blocks.length} blocks · {exam.blocks.reduce((acc, block) => acc + block.questions.length, 0)} questions
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/exam/${exam.id}`);
                    }}
                  >
                    Start Exam
                  </Button>
                </div>
              </Card>
            ))}
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
