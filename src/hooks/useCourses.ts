import { useMemo } from "react";
import { courses as hardcodedCourses, Course, Exam } from "@/data/coursesData";
import { useUserExams } from "./useUserExams";
import { useUserCourses } from "./useUserCourses";

export function useCourses() {
  const { userExams, loading: examsLoading } = useUserExams();
  const { userCourses, loading: coursesLoading } = useUserCourses();

  const allCourses = useMemo(() => {
    console.log("Rebuilding courses list. User courses:", userCourses.length, "User exams:", userExams.length);
    
    // Start with hardcoded courses
    const coursesMap = new Map<string, Course>();
    
    hardcodedCourses.forEach(course => {
      coursesMap.set(course.code.toLowerCase(), { 
        ...course,
        exams: [...course.exams] // Deep copy to prevent mutation
      });
    });

    // Add user-created courses (without exams initially)
    userCourses.forEach(userCourse => {
      const courseKey = userCourse.course_code.toLowerCase();
      if (!coursesMap.has(courseKey)) {
        const normalizedId = `user-${courseKey.replace(/\s+/g, '-')}`;
        coursesMap.set(courseKey, {
          id: normalizedId,
          code: userCourse.course_code,
          name: userCourse.course_name,
          exams: [],
          isUserCreated: true,
        });
      }
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
        // Normalize course ID to be URL-safe
        const normalizedId = `user-${courseKey.replace(/\s+/g, '-')}`;
        coursesMap.set(courseKey, {
          id: normalizedId,
          code: userExam.course_code,
          name: userExam.course_name,
          exams: [exam],
          isUserCreated: true,
        });
      }
    });

    return Array.from(coursesMap.values());
  }, [userExams, userCourses]);

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
    loading: examsLoading || coursesLoading,
    getCourseById,
    getCourseByCourseCode,
    getExamById,
  };
}
