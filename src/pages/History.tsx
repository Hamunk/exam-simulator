import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useExamAttempts } from "@/hooks/useExamAttempts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Home, Clock, CheckCircle, XCircle, PlayCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function History() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { attempts, loading: attemptsLoading, getCompletedAttempts } = useExamAttempts();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { from: { pathname: "/history" } } });
    }
  }, [user, authLoading, navigate]);

  const completedAttempts = getCompletedAttempts();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary">
            <PlayCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case "abandoned":
        return (
          <Badge variant="outline">
            <XCircle className="w-3 h-3 mr-1" />
            Abandoned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getTimeToComplete = (attempt: any) => {
    if (attempt.status !== "completed" || !attempt.started_at || !attempt.completed_at) {
      return "N/A";
    }

    const started = new Date(attempt.started_at);
    const completed = new Date(attempt.completed_at);
    const durationSeconds = Math.floor((completed.getTime() - started.getTime()) / 1000);

    return formatDuration(durationSeconds);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 80) return "text-primary";
    if (percentage >= 70) return "text-warning";
    return "text-destructive";
  };

  if (authLoading || attemptsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Exam History</h1>
            <p className="text-muted-foreground mt-2">
              View all your exam attempts and track your progress
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold text-foreground">{attempts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {completedAttempts.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {completedAttempts.length > 0
                    ? `${(
                        completedAttempts.reduce(
                          (sum, a) => sum + (a.percentage || 0),
                          0
                        ) / completedAttempts.length
                      ).toFixed(1)}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Attempts Table */}
        <Card>
          <Table>
            <TableCaption>
              {attempts.length === 0
                ? "No exam attempts yet. Start an exam to see your history here."
                : "A list of all your exam attempts"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Time to Complete</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{attempt.course_code}</div>
                      <div className="text-sm text-muted-foreground">
                        {attempt.course_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{attempt.exam_title}</TableCell>
                  <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                  <TableCell>
                    {attempt.status === "completed" && attempt.percentage !== null ? (
                      <div className="space-y-1">
                        <div
                          className={`text-lg font-bold ${getScoreColor(
                            attempt.percentage
                          )}`}
                        >
                          {attempt.percentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {attempt.total_score} / {attempt.max_score}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {getTimeToComplete(attempt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(attempt.started_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {attempts.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't taken any exams yet.
            </p>
            <Button onClick={() => navigate("/")}>Browse Courses</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
