import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Brain, Search, BookOpen } from "lucide-react";
import { courses } from "@/data/coursesData";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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

          {/* Courses Grid */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Available Courses
            </h2>
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
