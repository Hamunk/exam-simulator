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

interface AccessRequest {
  id: string;
  email: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

export function useAdminData() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [examAttempts, setExamAttempts] = useState<AdminExamAttempt[]>([]);
  const [userExams, setUserExams] = useState<AdminUserExam[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
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

        // Fetch access requests
        const { data: requestsData, error: requestsError } = await supabase
          .from("access_requests")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (requestsError) {
          console.error("Error fetching access requests:", requestsError);
        } else {
          setAccessRequests(requestsData || []);
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
      const [usersRes, attemptsRes, examsRes, requestsRes] = await Promise.all([
        supabase.rpc("get_all_users_for_admin"),
        supabase.rpc("get_all_exam_attempts_for_admin"),
        supabase.rpc("get_all_user_exams_for_admin"),
        supabase.from("access_requests").select("*").order("created_at", { ascending: false }),
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (attemptsRes.data) setExamAttempts(attemptsRes.data);
      if (examsRes.data) setUserExams(examsRes.data);
      if (requestsRes.data) setAccessRequests(requestsRes.data);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("access_requests")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    
    if (!error) {
      setAccessRequests(prev => 
        prev.map(r => r.id === id ? { ...r, status, reviewed_at: new Date().toISOString() } : r)
      );
    }
    return { error };
  };

  const deleteRequest = async (id: string) => {
    const { error } = await supabase
      .from("access_requests")
      .delete()
      .eq("id", id);
    
    if (!error) {
      setAccessRequests(prev => prev.filter(r => r.id !== id));
    }
    return { error };
  };

  return {
    users,
    examAttempts,
    userExams,
    accessRequests,
    loading: loading || roleLoading,
    isAdmin,
    refresh,
    updateRequestStatus,
    deleteRequest,
  };
}
