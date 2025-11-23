import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CourseSubscription {
  id: string;
  user_id: string;
  course_code: string;
  created_at: string;
  updated_at: string;
}

interface CourseStats {
  uniqueExamsAttempted: number;
  averageBestScore: number;
}

export function useCourseSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<CourseSubscription[]>([]);
  const [stats, setStats] = useState<Record<string, CourseStats>>({});
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscriptions([]);
        setStats({});
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_course_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
      
      // Fetch stats for subscribed courses
      if (data && data.length > 0) {
        await fetchCourseStats(data.map(s => s.course_code));
      }
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscribed courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStats = async (courseCodes: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const statsPromises = courseCodes.map(async (courseCode) => {
        const { data, error } = await supabase
          .from("exam_attempts")
          .select("exam_id, percentage")
          .eq("user_id", user.id)
          .eq("course_code", courseCode)
          .eq("status", "completed")
          .not("percentage", "is", null);

        if (error) throw error;

        // Group by exam_id and get best score for each
        const examBestScores = new Map<string, number>();
        data?.forEach((attempt) => {
          const currentBest = examBestScores.get(attempt.exam_id);
          if (currentBest === undefined || attempt.percentage > currentBest) {
            examBestScores.set(attempt.exam_id, attempt.percentage);
          }
        });

        const uniqueExamsAttempted = examBestScores.size;
        const averageBestScore = uniqueExamsAttempted > 0
          ? Array.from(examBestScores.values()).reduce((a, b) => a + b, 0) / uniqueExamsAttempted
          : 0;

        return {
          courseCode,
          stats: {
            uniqueExamsAttempted,
            averageBestScore: Math.round(averageBestScore),
          },
        };
      });

      const results = await Promise.all(statsPromises);
      const newStats: Record<string, CourseStats> = {};
      results.forEach(({ courseCode, stats }) => {
        newStats[courseCode] = stats;
      });
      setStats(newStats);
    } catch (error: any) {
      console.error("Error fetching course stats:", error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const subscribeToCourse = async (courseCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to subscribe to courses");
        return;
      }

      const { error } = await supabase
        .from("user_course_subscriptions")
        .insert([{ user_id: user.id, course_code: courseCode }]);

      if (error) {
        if (error.message.includes("duplicate")) {
          toast.error("Already subscribed to this course");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Subscribed to course!");
      await fetchSubscriptions();
    } catch (error: any) {
      console.error("Error subscribing to course:", error);
      toast.error("Failed to subscribe to course");
    }
  };

  const unsubscribeFromCourse = async (courseCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_course_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("course_code", courseCode);

      if (error) throw error;

      toast.success("Unsubscribed from course");
      await fetchSubscriptions();
    } catch (error: any) {
      console.error("Error unsubscribing from course:", error);
      toast.error("Failed to unsubscribe from course");
    }
  };

  const isSubscribed = (courseCode: string): boolean => {
    return subscriptions.some(
      (s) => s.course_code.toLowerCase() === courseCode.toLowerCase()
    );
  };

  const getCourseStats = (courseCode: string): CourseStats => {
    return stats[courseCode] || { uniqueExamsAttempted: 0, averageBestScore: 0 };
  };

  return {
    subscriptions,
    stats,
    loading,
    subscribeToCourse,
    unsubscribeFromCourse,
    isSubscribed,
    getCourseStats,
    refresh: fetchSubscriptions,
  };
}
