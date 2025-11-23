import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExamBlock, UserAnswer, BlockScore } from "@/types/exam";
import { Database } from "@/integrations/supabase/types";

type ExamAttemptRow = Database["public"]["Tables"]["exam_attempts"]["Row"];
type ExamAttemptInsert = Database["public"]["Tables"]["exam_attempts"]["Insert"];

export interface ExamAttemptData {
  id: string;
  user_id: string;
  exam_id: string;
  course_code: string;
  course_name: string;
  exam_title: string;
  exam_data: ExamBlock[];
  user_answers: Record<string, UserAnswer>;
  current_block_index: number;
  remaining_seconds: number;
  total_seconds: number;
  started_at: string;
  completed_at: string | null;
  block_scores: BlockScore[] | null;
  total_score: number | null;
  max_score: number | null;
  percentage: number | null;
  status: "in_progress" | "completed" | "abandoned";
  created_at: string;
  updated_at: string;
}

export function useExamAttempts() {
  const [attempts, setAttempts] = useState<ExamAttemptData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAttempts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("exam_attempts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map((attempt) => ({
        ...attempt,
        exam_data: attempt.exam_data as unknown as ExamBlock[],
        user_answers: attempt.user_answers as unknown as Record<string, UserAnswer>,
        block_scores: attempt.block_scores as unknown as BlockScore[] | null,
        status: attempt.status as "in_progress" | "completed" | "abandoned",
      }));
      
      setAttempts(typedData);
    } catch (error) {
      console.error("Error fetching exam attempts:", error);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const getInProgressAttempt = async (examId: string): Promise<ExamAttemptData | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("exam_id", examId)
        .eq("status", "in_progress")
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        exam_data: data.exam_data as unknown as ExamBlock[],
        user_answers: data.user_answers as unknown as Record<string, UserAnswer>,
        block_scores: data.block_scores as unknown as BlockScore[] | null,
        status: data.status as "in_progress" | "completed" | "abandoned",
      };
    } catch (error) {
      console.error("Error getting in-progress attempt:", error);
      return null;
    }
  };

  const createAttempt = async (attemptData: {
    exam_id: string;
    course_code: string;
    course_name: string;
    exam_title: string;
    exam_data: ExamBlock[];
    total_seconds: number;
    remaining_seconds: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User must be logged in to create exam attempts");
      }

      const { data, error } = await supabase
        .from("exam_attempts")
        .insert({
          user_id: user.id,
          exam_id: attemptData.exam_id,
          course_code: attemptData.course_code,
          course_name: attemptData.course_name,
          exam_title: attemptData.exam_title,
          exam_data: attemptData.exam_data as any,
          total_seconds: attemptData.total_seconds,
          remaining_seconds: attemptData.remaining_seconds,
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchAttempts();
      return { data, error: null };
    } catch (error) {
      console.error("Error creating exam attempt:", error);
      return { data: null, error };
    }
  };

  const updateAttempt = async (
    attemptId: string,
    updates: {
      user_answers?: Record<string, UserAnswer>;
      current_block_index?: number;
      remaining_seconds?: number;
      status?: "in_progress" | "completed" | "abandoned";
      block_scores?: BlockScore[];
      total_score?: number;
      max_score?: number;
      percentage?: number;
      completed_at?: string;
    }
  ) => {
    try {
      const updateData: any = { ...updates };
      if (updates.user_answers) {
        updateData.user_answers = updates.user_answers as any;
      }
      if (updates.block_scores) {
        updateData.block_scores = updates.block_scores as any;
      }

      const { data, error } = await supabase
        .from("exam_attempts")
        .update(updateData)
        .eq("id", attemptId)
        .select()
        .single();

      if (error) throw error;
      
      await fetchAttempts();
      return { data, error: null };
    } catch (error) {
      console.error("Error updating exam attempt:", error);
      return { data: null, error };
    }
  };

  const deleteAttempt = async (attemptId: string) => {
    try {
      const { error } = await supabase
        .from("exam_attempts")
        .delete()
        .eq("id", attemptId);

      if (error) throw error;
      
      await fetchAttempts();
      return { error: null };
    } catch (error) {
      console.error("Error deleting exam attempt:", error);
      return { error };
    }
  };

  const getCompletedAttempts = () => {
    return attempts.filter((attempt) => attempt.status === "completed");
  };

  const getAttemptsByExam = (examId: string) => {
    return attempts.filter((attempt) => attempt.exam_id === examId);
  };

  return {
    attempts,
    loading,
    createAttempt,
    updateAttempt,
    deleteAttempt,
    getInProgressAttempt,
    getCompletedAttempts,
    getAttemptsByExam,
    refresh: fetchAttempts,
  };
}
