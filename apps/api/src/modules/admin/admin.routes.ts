import { Router } from "express";
import { prisma } from "@codeforge/database";
import {
  adminAchievementSchema,
  adminAchievementUpdateSchema,
  adminCourseSchema,
  adminCourseUpdateSchema,
  adminExerciseSchema,
  adminExerciseUpdateSchema,
  adminInterviewQuestionSchema,
  adminInterviewQuestionUpdateSchema,
  adminLessonSchema,
  adminLessonUpdateSchema,
  adminModuleSchema,
  adminModuleUpdateSchema,
  adminProjectSchema,
  adminProjectUpdateSchema,
  adminSkillSchema,
  adminSkillUpdateSchema,
  adminTicketSchema,
  adminTicketUpdateSchema,
} from "@codeforge/validators";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { createAdminCrudRouter } from "./admin-crud.js";
import { adminController } from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/analytics", asyncHandler(adminController.analytics));
adminRouter.get("/audit-log", asyncHandler(adminController.listAuditLog));
adminRouter.get("/feature-flags", asyncHandler(adminController.listFeatureFlags));
adminRouter.patch("/feature-flags/:key", asyncHandler(adminController.updateFeatureFlag));
adminRouter.get("/users", asyncHandler(adminController.listUsers));
adminRouter.patch("/users/:id/role", asyncHandler(adminController.updateUserRole));

adminRouter.use(
  "/courses",
  createAdminCrudRouter({
    entityType: "Course",
    model: prisma.course,
    createSchema: adminCourseSchema,
    updateSchema: adminCourseUpdateSchema,
    searchField: "title",
    orderBy: { order: "asc" },
  }),
);

adminRouter.use(
  "/modules",
  createAdminCrudRouter({
    entityType: "Module",
    model: prisma.module,
    createSchema: adminModuleSchema,
    updateSchema: adminModuleUpdateSchema,
    searchField: "title",
    filterFields: ["courseId"],
    orderBy: { order: "asc" },
  }),
);

adminRouter.use(
  "/lessons",
  createAdminCrudRouter({
    entityType: "Lesson",
    model: prisma.lesson,
    createSchema: adminLessonSchema,
    updateSchema: adminLessonUpdateSchema,
    searchField: "title",
    filterFields: ["moduleId", "skillId"],
    orderBy: { order: "asc" },
  }),
);

adminRouter.use(
  "/exercises",
  createAdminCrudRouter({
    entityType: "Exercise",
    model: prisma.exercise,
    createSchema: adminExerciseSchema,
    updateSchema: adminExerciseUpdateSchema,
    searchField: "title",
    filterFields: ["skillId", "type", "difficulty"],
    orderBy: { createdAt: "desc" },
  }),
);

adminRouter.use(
  "/projects",
  createAdminCrudRouter({
    entityType: "Project",
    model: prisma.project,
    createSchema: adminProjectSchema,
    updateSchema: adminProjectUpdateSchema,
    searchField: "title",
    filterFields: ["level"],
    orderBy: { createdAt: "desc" },
  }),
);

adminRouter.use(
  "/skills",
  createAdminCrudRouter({
    entityType: "Skill",
    model: prisma.skill,
    createSchema: adminSkillSchema,
    updateSchema: adminSkillUpdateSchema,
    searchField: "name",
    orderBy: { name: "asc" },
  }),
);

adminRouter.use(
  "/achievements",
  createAdminCrudRouter({
    entityType: "Achievement",
    model: prisma.achievement,
    createSchema: adminAchievementSchema,
    updateSchema: adminAchievementUpdateSchema,
    searchField: "title",
    orderBy: { xpReward: "asc" },
  }),
);

adminRouter.use(
  "/interview-questions",
  createAdminCrudRouter({
    entityType: "InterviewQuestion",
    model: prisma.interviewQuestion,
    createSchema: adminInterviewQuestionSchema,
    updateSchema: adminInterviewQuestionUpdateSchema,
    searchField: "prompt",
    filterFields: ["category", "difficulty", "skillId"],
    orderBy: { createdAt: "desc" },
  }),
);

adminRouter.use(
  "/tickets",
  createAdminCrudRouter({
    entityType: "Ticket",
    model: prisma.ticket,
    createSchema: adminTicketSchema,
    updateSchema: adminTicketUpdateSchema,
    searchField: "title",
    filterFields: ["status", "priority", "type", "sprintId", "assigneeId"],
    orderBy: { createdAt: "desc" },
  }),
);
