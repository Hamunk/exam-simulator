import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, Search, BookOpen, User, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { useCourses } from "@/hooks/useCourses";
import { useUserCourses } from "@/hooks/useUserCourses";
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
  const { courses, loading } = useCourses();
  const { createUserCourse } = useUserCourses();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");

  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = async () => {
    if (!newCourseCode.trim() || !newCourseName.trim()) {
      toast.error("Please fill in both course code and name");
      return;
    }
    
    console.log('Creating course:', { code: newCourseCode, name: newCourseName });
    
    try {
      await createUserCourse({
        course_code: newCourseCode.toUpperCase(),
        course_name: newCourseName,
      });
      
      console.log('Course created successfully, current courses count:', courses.length);
      
      toast.success("Course created successfully!");
      setIsAddCourseOpen(false);
      setNewCourseCode("");
      setNewCourseName("");
    } catch (error: any) {
      console.error('Error creating course:', error);
      if (error.message?.includes("duplicate")) {
        toast.error("This course already exists");
      } else {
        toast.error("Failed to create course");
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

          {/* User Welcome Card */}
          {user && (
            <Card className="max-w-2xl mx-auto p-6 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Welcome back!
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    You're signed in and can now create your own custom exams. Start practicing with existing courses or create your own.
                  </p>
                  <Button onClick={() => navigate("/create-exam")} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Exam
                  </Button>
                </div>
              </div>
            </Card>
          )}

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

          {/* Courses Grid */}
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
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="p-6 hover:shadow-elevated transition-all cursor-pointer group"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
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

            {filteredCourses.length === 0 && (
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
