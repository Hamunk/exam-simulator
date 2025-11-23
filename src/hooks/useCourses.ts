import { useMemo } from "react";
import { courses as hardcodedCourses, Course, Exam } from "@/data/coursesData";
import { useUserExams } from "./useUserExams";

export function useCourses() {
  const { userExams, loading } = useUserExams();

  const allCourses = useMemo(() => {
    // Start with hardcoded courses
    const coursesMap = new Map<string, Course>();
    
    hardcodedCourses.forEach(course => {
      coursesMap.set(course.code.toLowerCase(), { ...course });
    });

    // Add user-created exams to existing courses or create new courses
    userExams.forEach(userExam => {
      const courseKey = userExam.course_code.toLowerCase();
      const exam: Exam = {
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

      if (coursesMap.has(courseKey)) {
        // Add exam to existing course
        const course = coursesMap.get(courseKey)!;
        course.exams.push(exam);
      } else {
        // Create new course for this exam
        coursesMap.set(courseKey, {
          id: `user-${courseKey}`,
          code: userExam.course_code,
          name: userExam.course_name,
          exams: [exam],
          isUserCreated: true,
        });
      }
    });

    return Array.from(coursesMap.values());
  }, [userExams]);

  const getCourseById = (courseId: string) => {
    return allCourses.find(c => c.id === courseId);
  };

  const getCourseByCourseCode = (courseCode: string) => {
    return allCourses.find(c => c.code.toLowerCase() === courseCode.toLowerCase());
  };

  const getExamById = (examId: string): { exam: Exam; course: Course } | null => {
    for (const course of allCourses) {
      const exam = course.exams.find(e => e.id === examId);
      if (exam) {
        return { exam, course };
      }
    }
    return null;
  };

  return {
    courses: allCourses,
    loading,
    getCourseById,
    getCourseByCourseCode,
    getExamById,
  };
}
