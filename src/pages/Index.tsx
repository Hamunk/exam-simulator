import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, Search, BookOpen, Plus, Bookmark, Award, Target, FileText, Trash2, Edit, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { useCourses } from "@/hooks/useCourses";
import { useCourseSubscriptions } from "@/hooks/useCourseSubscriptions";
import { useExamDrafts } from "@/hooks/useExamDrafts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, loading, createUserCourse } = useCourses();
  const { isSubscribed, subscribeToCourse, unsubscribeFromCourse, getCourseStats } = useCourseSubscriptions();
  const { drafts, loading: draftsLoading, deleteDraft } = useExamDrafts();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");

  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myCourses = user ? filteredCourses.filter(course => isSubscribed(course.code)) : [];
  const availableCourses = filteredCourses.filter(course => !isSubscribed(course.code));

  const handleAddCourse = async () => {
    if (!newCourseCode.trim() || !newCourseName.trim()) {
      toast.error("Please fill in both course code and name");
      return;
    }
    
    try {
      await createUserCourse({
        course_code: newCourseCode.toUpperCase(),
        course_name: newCourseName,
      });
      
      toast.success("Course created successfully!");
      setIsAddCourseOpen(false);
      setNewCourseCode("");
      setNewCourseName("");
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.error("This course already exists");
      } else {
        toast.error("Failed to create course");
      }
    }
  };

  const handleResumeDraft = (draft: any) => {
    navigate("/create-exam", {
      state: {
        courseCode: draft.course_code,
        courseName: draft.course_name,
        draft,
      },
    });
  };

  const handleDeleteDraft = async (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this draft?")) {
      const result = await deleteDraft(draftId);
      if (result.error) {
        toast.error("Failed to delete draft");
      } else {
        toast.success("Draft deleted successfully");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              Exam Simulator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a course and practice with confidence. Master your exam
              preparation with comprehensive practice exams.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for course code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>

          {/* My Courses Section */}
          {user && myCourses.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                My Courses
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {myCourses.map((course) => {
                  const stats = getCourseStats(course.code);
                  return (
                    <Card
                      key={course.id}
                      className="p-6 hover:shadow-elevated transition-all cursor-pointer group relative"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 opacity-60 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          unsubscribeFromCourse(course.code);
                        }}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </Button>
                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="inline-block px-2 py-1 bg-accent/10 text-accent rounded text-xs font-semibold mb-2">
                            {course.code}
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {course.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {course.exams.length} exam{course.exams.length !== 1 ? "s" : ""} available
                          </p>
                          <div className="flex items-center gap-4 pt-3 border-t border-border">
                            <div className="flex items-center gap-1.5">
                              <Target className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {stats.uniqueExamsAttempted} attempted
                              </span>
                            </div>
                            {stats.averageBestScore > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {stats.averageBestScore}% avg
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Drafts Section */}
          {user && !draftsLoading && drafts.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                My Drafts
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {drafts.map((draft) => (
                  <Card
                    key={draft.id}
                    className="p-6 hover:shadow-elevated transition-all cursor-pointer group relative"
                    onClick={() => handleResumeDraft(draft)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 opacity-60 hover:opacity-100"
                      onClick={(e) => handleDeleteDraft(e, draft.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center group-hover:bg-muted transition-colors">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="inline-block px-2 py-1 bg-warning/10 text-warning rounded text-xs font-semibold mb-2">
                          DRAFT
                        </div>
                        <div className="inline-block px-2 py-1 bg-accent/10 text-accent rounded text-xs font-semibold mb-2 ml-2">
                          {draft.course_code}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {draft.exam_title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {draft.exam_year} {draft.exam_semester}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last edited: {new Date(draft.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Courses Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Available Courses
              </h2>
              {user && (
                <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Course</DialogTitle>
                      <DialogDescription>
                        Create a new course. You can add exams to it later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="course-code">Course Code</Label>
                        <Input
                          id="course-code"
                          placeholder="e.g., TDT4100"
                          value={newCourseCode}
                          onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="course-name">Course Name</Label>
                        <Input
                          id="course-name"
                          placeholder="e.g., Object-Oriented Programming"
                          value={newCourseName}
                          onChange={(e) => setNewCourseName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCourse}>
                        Create Course
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <Card
                  key={course.id}
                  className="p-6 hover:shadow-elevated transition-all cursor-pointer group relative"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  {user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        subscribeToCourse(course.code);
                      }}
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="inline-block px-2 py-1 bg-accent/10 text-accent rounded text-xs font-semibold mb-2">
                        {course.code}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {course.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.exams.length} exam{course.exams.length !== 1 ? "s" : ""} available
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {availableCourses.length === 0 && myCourses.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No courses found matching "{searchQuery}"
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
