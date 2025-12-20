import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "./useUserRole";

interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  role: "admin" | "user";
}

interface AdminExamAttempt {
  id: string;
  user_id: string;
  user_email: string;
  exam_title: string;
  course_code: string;
  course_name: string;
  status: string;
  total_score: number | null;
  max_score: number | null;
  percentage: number | null;
  started_at: string;
  completed_at: string | null;
}

interface AdminUserExam {
  id: string;
  user_id: string;
  user_email: string;
  exam_title: string;
  course_code: string;
  course_name: string;
  is_public: boolean;
  is_draft: boolean;
  created_at: string;
}

export function useAdminData() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [examAttempts, setExamAttempts] = useState<AdminExamAttempt[]>([]);
  const [userExams, setUserExams] = useState<AdminUserExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading) return;
    
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .rpc("get_all_users_for_admin");
        
        if (usersError) {
          console.error("Error fetching users:", usersError);
        } else {
          setUsers(usersData || []);
        }

        // Fetch all exam attempts
        const { data: attemptsData, error: attemptsError } = await supabase
          .rpc("get_all_exam_attempts_for_admin");
        
        if (attemptsError) {
          console.error("Error fetching attempts:", attemptsError);
        } else {
          setExamAttempts(attemptsData || []);
        }

        // Fetch all user exams
        const { data: examsData, error: examsError } = await supabase
          .rpc("get_all_user_exams_for_admin");
        
        if (examsError) {
          console.error("Error fetching exams:", examsError);
        } else {
          setUserExams(examsData || []);
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAdmin, roleLoading]);

  const refresh = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const [usersRes, attemptsRes, examsRes] = await Promise.all([
        supabase.rpc("get_all_users_for_admin"),
        supabase.rpc("get_all_exam_attempts_for_admin"),
        supabase.rpc("get_all_user_exams_for_admin"),
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (attemptsRes.data) setExamAttempts(attemptsRes.data);
      if (examsRes.data) setUserExams(examsRes.data);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    examAttempts,
    userExams,
    loading: loading || roleLoading,
    isAdmin,
    refresh,
  };
}
