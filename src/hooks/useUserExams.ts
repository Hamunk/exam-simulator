import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExamBlock } from "@/types/exam";
import { Exam, Course } from "@/data/coursesData";
import { Database } from "@/integrations/supabase/types";

type UserExamRow = Database["public"]["Tables"]["user_exams"]["Row"];

export interface UserExamData {
  id: string;
  user_id: string;
  course_code: string;
  course_name: string;
  exam_title: string;
  exam_year: string;
  exam_semester: string;
  blocks: ExamBlock[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserExams() {
  const [userExams, setUserExams] = useState<UserExamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserExams();
  }, []);

  const fetchUserExams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch public exams for everyone, or all exams (public + own) for logged-in users
      let query = supabase
        .from("user_exams")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!user) {
        // Not logged in - only fetch public exams
        query = query.eq("is_public", true);
      }
      // If logged in, RLS policies will return both public exams and user's own exams

      const { data, error } = await query;

      if (error) throw error;
      
      // Cast the blocks from Json to ExamBlock[]
      const typedData = (data || []).map((exam) => ({
        ...exam,
        blocks: exam.blocks as unknown as ExamBlock[],
      }));
      
      setUserExams(typedData);
    } catch (error) {
      console.error("Error fetching user exams:", error);
      setUserExams([]);
    } finally {
      setLoading(false);
    }
  };

  const createUserExam = async (examData: {
    course_code: string;
    course_name: string;
    exam_title: string;
    exam_year: string;
    exam_semester: string;
    blocks: ExamBlock[];
    is_public?: boolean;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User must be logged in to create exams");
      }

      const { data, error } = await supabase
        .from("user_exams")
        .insert({
          user_id: user.id,
          course_code: examData.course_code,
          course_name: examData.course_name,
          exam_title: examData.exam_title,
          exam_year: examData.exam_year,
          exam_semester: examData.exam_semester,
          blocks: examData.blocks as any,
          is_public: examData.is_public || false,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchUserExams();
      return { data, error: null };
    } catch (error) {
      console.error("Error creating user exam:", error);
      return { data: null, error };
    }
  };

  const updateUserExam = async (examId: string, updates: Partial<Omit<UserExamData, "id" | "user_id" | "created_at" | "updated_at">>) => {
    try {
      const updateData: any = { ...updates };
      if (updates.blocks) {
        updateData.blocks = updates.blocks as any;
      }

      const { data, error } = await supabase
        .from("user_exams")
        .update(updateData)
        .eq("id", examId)
        .select()
        .single();

      if (error) throw error;
      
      await fetchUserExams();
      return { data, error: null };
    } catch (error) {
      console.error("Error updating user exam:", error);
      return { data: null, error };
    }
  };

  const deleteUserExam = async (examId: string) => {
    try {
      // First, fetch the exam to backup
      const { data: examToDelete, error: fetchError } = await supabase
        .from("user_exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (fetchError) throw fetchError;
      if (!examToDelete) throw new Error("Exam not found");

      // Backup the exam to deleted_exams table
      const { error: backupError } = await supabase
        .from("deleted_exams")
        .insert({
          original_exam_id: examToDelete.id,
          user_id: examToDelete.user_id,
          course_code: examToDelete.course_code,
          course_name: examToDelete.course_name,
          exam_title: examToDelete.exam_title,
          exam_year: examToDelete.exam_year,
          exam_semester: examToDelete.exam_semester,
          blocks: examToDelete.blocks,
          is_public: examToDelete.is_public,
          original_created_at: examToDelete.created_at,
        });

      if (backupError) throw backupError;

      // Now delete the exam
      const { error: deleteError } = await supabase
        .from("user_exams")
        .delete()
        .eq("id", examId);

      if (deleteError) throw deleteError;
      
      await fetchUserExams();
      return { error: null };
    } catch (error) {
      console.error("Error deleting user exam:", error);
      return { error };
    }
  };

  const convertToExam = (userExam: UserExamData): Exam => {
    return {
      id: userExam.id,
      title: userExam.exam_title,
      year: userExam.exam_year,
      semester: userExam.exam_semester,
      blocks: userExam.blocks,
      isUserCreated: true,
      userId: userExam.user_id,
      isPublic: userExam.is_public,
      createdAt: userExam.created_at,
    };
  };

  const convertToCourse = (userExam: UserExamData): Course => {
    return {
      id: `user-${userExam.course_code.toLowerCase()}`,
      code: userExam.course_code,
      name: userExam.course_name,
      exams: [convertToExam(userExam)],
      isUserCreated: true,
    };
  };

  return {
    userExams,
    loading,
    createUserExam,
    updateUserExam,
    deleteUserExam,
    convertToExam,
    convertToCourse,
    refresh: fetchUserExams,
  };
}
