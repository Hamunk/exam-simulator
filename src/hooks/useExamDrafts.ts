import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserExamData } from "./useUserExams";

export function useExamDrafts() {
  const [drafts, setDrafts] = useState<UserExamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDrafts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_exams")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_draft", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map((exam) => ({
        ...exam,
        blocks: exam.blocks as any,
      }));
      
      setDrafts(typedData);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (draftData: {
    course_code: string;
    course_name: string;
    exam_title: string;
    exam_year: string;
    exam_semester: string;
    blocks: any[];
    draft_data: any;
    id?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User must be logged in to save drafts");
      }

      if (draftData.id) {
        // Update existing draft
        const { error } = await supabase
          .from("user_exams")
          .update({
            course_code: draftData.course_code,
            course_name: draftData.course_name,
            exam_title: draftData.exam_title,
            exam_year: draftData.exam_year,
            exam_semester: draftData.exam_semester,
            blocks: draftData.blocks,
            draft_data: draftData.draft_data,
            is_draft: true,
          })
          .eq("id", draftData.id);

        if (error) throw error;
      } else {
        // Create new draft
        const { error } = await supabase
          .from("user_exams")
          .insert({
            user_id: user.id,
            course_code: draftData.course_code,
            course_name: draftData.course_name,
            exam_title: draftData.exam_title,
            exam_year: draftData.exam_year,
            exam_semester: draftData.exam_semester,
            blocks: draftData.blocks,
            draft_data: draftData.draft_data,
            is_draft: true,
            is_public: false,
          });

        if (error) throw error;
      }

      await fetchDrafts();
      return { error: null };
    } catch (error) {
      console.error("Error saving draft:", error);
      return { error };
    }
  };

  const publishDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from("user_exams")
        .update({
          is_draft: false,
          draft_data: null,
        })
        .eq("id", draftId);

      if (error) throw error;
      
      await fetchDrafts();
      return { error: null };
    } catch (error) {
      console.error("Error publishing draft:", error);
      return { error };
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from("user_exams")
        .delete()
        .eq("id", draftId);

      if (error) throw error;
      
      await fetchDrafts();
      return { error: null };
    } catch (error) {
      console.error("Error deleting draft:", error);
      return { error };
    }
  };

  return {
    drafts,
    loading,
    saveDraft,
    publishDraft,
    deleteDraft,
    refresh: fetchDrafts,
  };
}
