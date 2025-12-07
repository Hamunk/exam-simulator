import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PublicCourseData {
  id: string;
  course_code: string;
  course_name: string;
  created_at: string;
  updated_at: string;
}

export function useUserCourses() {
  const [userCourses, setUserCourses] = useState<PublicCourseData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserCourses = async () => {
    setLoading(true);
    try {
      // Use the security definer function to get all courses without exposing user_id
      const { data, error } = await supabase
        .rpc('get_public_courses');

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
      
      // Optimistically add the new course to the list (without user_id for public display)
      if (data) {
        const publicCourse: PublicCourseData = {
          id: data.id,
          course_code: data.course_code,
          course_name: data.course_name,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setUserCourses(prev => [publicCourse, ...prev]);
      }
      
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
