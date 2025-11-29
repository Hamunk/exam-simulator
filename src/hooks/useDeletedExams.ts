import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExamBlock } from "@/types/exam";

export interface DeletedExamData {
  id: string;
  original_exam_id: string;
  user_id: string;
  course_code: string;
  course_name: string;
  exam_title: string;
  exam_year: string;
  exam_semester: string;
  blocks: ExamBlock[];
  is_public: boolean;
  deleted_at: string;
  original_created_at: string;
}

export function useDeletedExams() {
  const [deletedExams, setDeletedExams] = useState<DeletedExamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedExams();
  }, []);

  const fetchDeletedExams = async () => {
    try {
      const { data, error } = await supabase
        .from("deleted_exams")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map((exam) => ({
        ...exam,
        blocks: exam.blocks as unknown as ExamBlock[],
      }));
      
      setDeletedExams(typedData);
    } catch (error) {
      console.error("Error fetching deleted exams:", error);
      setDeletedExams([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    deletedExams,
    loading,
    refresh: fetchDeletedExams,
  };
}
