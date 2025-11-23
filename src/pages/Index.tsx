import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, CheckCircle2, Trophy } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              Exam Simulator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice with confidence. Master your exam preparation with our
              comprehensive multiple-choice question simulator.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/exam")}
            >
              Start Exam
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center shadow-card hover:shadow-elevated transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Block-Based Learning
              </h3>
              <p className="text-sm text-muted-foreground">
                Questions organized in themed blocks with background information
                for better context
              </p>
            </Card>

            <Card className="p-6 text-center shadow-card hover:shadow-elevated transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Smart Scoring
              </h3>
              <p className="text-sm text-muted-foreground">
                +1 for correct, -1 for incorrect, 0 for skipped. Fair and
                balanced evaluation
              </p>
            </Card>

            <Card className="p-6 text-center shadow-card hover:shadow-elevated transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg mb-4">
                <Trophy className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Instant Feedback
              </h3>
              <p className="text-sm text-muted-foreground">
                See your scores immediately after each block and get detailed
                results
              </p>
            </Card>
          </div>

          {/* Exam Info Card */}
          <Card className="p-8 bg-card shadow-elevated">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <div className="space-y-4 text-foreground">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  1
                </div>
                <p>
                  The exam consists of <strong>3 blocks</strong>, each containing{" "}
                  <strong>5 multiple-choice questions</strong>
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  2
                </div>
                <p>
                  Each block starts with <strong>background information</strong>{" "}
                  to provide context
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  3
                </div>
                <p>
                  Questions may have <strong>single or multiple correct answers</strong>
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  4
                </div>
                <p>
                  Maximum score per block: <strong>5 points</strong>. Block scores
                  cannot be negative (except the final Python block)
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  5
                </div>
                <p>
                  View your results immediately and see your performance breakdown
                </p>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/exam")}
            >
              Begin Your Practice Exam
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
