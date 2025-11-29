import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, FileText, Download, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { useDeletedExams } from "@/hooks/useDeletedExams";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const DeletedExams = () => {
  const navigate = useNavigate();
  const { deletedExams, loading } = useDeletedExams();

  const handleExportExam = (exam: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const examJson = {
      courseCode: exam.course_code,
      courseName: exam.course_name,
      examTitle: exam.exam_title,
      examYear: exam.exam_year,
      examSemester: exam.exam_semester,
      isPublic: exam.is_public,
      blocks: exam.blocks,
    };

    const jsonString = JSON.stringify(examJson, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DELETED_${exam.course_code}_${exam.exam_title}_${exam.exam_year}_${exam.exam_semester}.json`.replace(/\s+/g, "_");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Deleted exam JSON exported successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading deleted exams...</p>
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
              <BreadcrumbPage>Deleted Exams</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trash2 className="w-8 h-8 text-destructive" />
              <h1 className="text-4xl font-bold text-foreground">
                Deleted Exams
              </h1>
            </div>
            <p className="text-muted-foreground">
              View and download backup copies of deleted exams
            </p>
          </div>

          {/* Exams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deletedExams.map((exam) => {
              const deletedTime = formatDistanceToNow(new Date(exam.deleted_at), { addSuffix: true });
              
              return (
                <Card
                  key={exam.id}
                  className="p-6 hover:shadow-elevated transition-all group relative border-destructive/20"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-destructive" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleExportExam(exam, e)}
                        title="Download exam JSON"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <Badge variant="destructive" className="mb-2">
                        Deleted {deletedTime}
                      </Badge>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {exam.exam_title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="font-medium">{exam.course_code}</span>
                        <span>•</span>
                        <span>{exam.course_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{exam.exam_year} - {exam.exam_semester}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {exam.blocks.length} blocks · {exam.blocks.reduce((acc, block) => acc + block.questions.length, 0)} questions
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => handleExportExam(exam, e)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {deletedExams.length === 0 && (
            <Card className="p-12 text-center">
              <Trash2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No deleted exams found
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeletedExams;
