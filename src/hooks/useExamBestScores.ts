import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useExamBestScores(courseCode: string) {
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestScores = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setBestScores({});
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("exam_attempts")
          .select("exam_id, percentage")
          .eq("user_id", user.id)
          .eq("course_code", courseCode)
          .eq("status", "completed")
          .not("percentage", "is", null);

        if (error) throw error;

        // Group by exam_id and get best score for each
        const scores: Record<string, number> = {};
        data?.forEach((attempt) => {
          const currentBest = scores[attempt.exam_id] || 0;
          if (attempt.percentage > currentBest) {
            scores[attempt.exam_id] = Math.round(attempt.percentage);
          }
        });

        setBestScores(scores);
      } catch (error: any) {
        console.error("Error fetching best scores:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseCode) {
      fetchBestScores();
    }
  }, [courseCode]);

  const getBestScore = (examId: string): number | null => {
    return bestScores[examId] || null;
  };

  return {
    bestScores,
    getBestScore,
    loading,
  };
}
