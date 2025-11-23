import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useExamAttemptStatus(courseCode: string) {
  const [attemptedExamIds, setAttemptedExamIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttemptedExams = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setAttemptedExamIds(new Set());
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("exam_attempts")
          .select("exam_id")
          .eq("user_id", user.id)
          .eq("course_code", courseCode);

        if (error) throw error;

        const examIds = new Set(data?.map(attempt => attempt.exam_id) || []);
        setAttemptedExamIds(examIds);
      } catch (error: any) {
        console.error("Error fetching attempted exams:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseCode) {
      fetchAttemptedExams();
    }
  }, [courseCode]);

  const hasAttempted = (examId: string): boolean => {
    return attemptedExamIds.has(examId);
  };

  return {
    hasAttempted,
    loading,
  };
}
