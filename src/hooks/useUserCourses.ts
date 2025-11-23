import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserCourseData {
  id: string;
  user_id: string;
  course_code: string;
  course_name: string;
  created_at: string;
  updated_at: string;
}

export function useUserCourses() {
  const [userCourses, setUserCourses] = useState<UserCourseData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserCourses(data || []);
    } catch (error: any) {
      console.error("Error fetching user courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCourses();
  }, []);

  const createUserCourse = async (courseData: {
    course_code: string;
    course_name: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_courses")
        .insert([{
          user_id: user.id,
          course_code: courseData.course_code,
          course_name: courseData.course_name,
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchUserCourses();
      return data;
    } catch (error: any) {
      console.error("Error creating course:", error);
      throw error;
    }
  };

  const courseExists = (courseCode: string): boolean => {
    return userCourses.some(
      (c) => c.course_code.toLowerCase() === courseCode.toLowerCase()
    );
  };

  return {
    userCourses,
    loading,
    createUserCourse,
    courseExists,
    refresh: fetchUserCourses,
  };
}
