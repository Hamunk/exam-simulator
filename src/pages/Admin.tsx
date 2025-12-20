import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Home, RefreshCw, Users, FileText, ClipboardList, Shield } from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { users, examAttempts, userExams, loading, isAdmin, refresh } = useAdminData();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth", { state: { from: { pathname: "/admin" } } });
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Exam Attempts</p>
                <p className="text-2xl font-bold">{examAttempts.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Created Exams</p>
                <p className="text-2xl font-bold">{userExams.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="attempts" className="gap-2">
                <ClipboardList className="w-4 h-4" />
                Exam Attempts
              </TabsTrigger>
              <TabsTrigger value="exams" className="gap-2">
                <FileText className="w-4 h-4" />
                Created Exams
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.email}</TableCell>
                          <TableCell>{u.display_name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(u.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="attempts">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examAttempts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No exam attempts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      examAttempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="font-medium">{attempt.user_email}</TableCell>
                          <TableCell>{attempt.exam_title}</TableCell>
                          <TableCell>{attempt.course_code}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                attempt.status === "completed"
                                  ? "default"
                                  : attempt.status === "in_progress"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {attempt.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {attempt.percentage !== null
                              ? `${attempt.percentage.toFixed(1)}%`
                              : "-"}
                          </TableCell>
                          <TableCell>{formatDate(attempt.started_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="exams">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Creator</TableHead>
                      <TableHead>Exam Title</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Public</TableHead>
                      <TableHead>Draft</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userExams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No exams found
                        </TableCell>
                      </TableRow>
                    ) : (
                      userExams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">{exam.user_email}</TableCell>
                          <TableCell>{exam.exam_title}</TableCell>
                          <TableCell>{exam.course_code}</TableCell>
                          <TableCell>
                            <Badge variant={exam.is_public ? "default" : "outline"}>
                              {exam.is_public ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={exam.is_draft ? "secondary" : "outline"}>
                              {exam.is_draft ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(exam.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
