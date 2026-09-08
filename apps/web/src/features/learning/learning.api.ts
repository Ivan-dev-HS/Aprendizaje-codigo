import type {
  CourseDetail,
  CourseSummary,
  LearningPathSummary,
  LessonDetail,
} from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export const learningApi = {
  async listCourses() {
    const { data } = await apiClient.get<{ courses: CourseSummary[] }>("/courses");
    return data.courses;
  },

  async getCourse(slug: string) {
    const { data } = await apiClient.get<{ course: CourseDetail }>(`/courses/${slug}`);
    return data.course;
  },

  async getLesson(id: string) {
    const { data } = await apiClient.get<{ lesson: LessonDetail }>(`/lessons/${id}`);
    return data.lesson;
  },

  async completeLesson(id: string) {
    const { data } = await apiClient.post<{
      xpAwarded: number;
      alreadyCompleted: boolean;
      totalXp: number;
      level: number;
      leveledUp: boolean;
    }>(`/lessons/${id}/complete`);
    return data;
  },

  async getLearningPath() {
    const { data } = await apiClient.get<{ learningPath: LearningPathSummary }>(
      "/learning-paths/me",
    );
    return data.learningPath;
  },
};
