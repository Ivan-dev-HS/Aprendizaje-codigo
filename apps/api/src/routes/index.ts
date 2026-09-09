import { Router } from "express";
import { healthRouter } from "../modules/health/health.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { onboardingRouter } from "../modules/onboarding/onboarding.routes.js";
import { coursesRouter } from "../modules/courses/courses.routes.js";
import { lessonsRouter } from "../modules/lessons/lessons.routes.js";
import { skillsRouter } from "../modules/skills/skills.routes.js";
import { learningPathsRouter } from "../modules/learning-paths/learning-paths.routes.js";
import { exercisesRouter } from "../modules/exercises/exercises.routes.js";
import { labsRouter } from "../modules/labs/labs.routes.js";
import { projectsRouter } from "../modules/projects/projects.routes.js";
import { portfolioRouter } from "../modules/portfolio/portfolio.routes.js";
import { resumeRouter } from "../modules/resume/resume.routes.js";
import { casesRouter } from "../modules/cases/cases.routes.js";
import { ticketsRouter } from "../modules/tickets/tickets.routes.js";
import { sprintsRouter } from "../modules/sprints/sprints.routes.js";
import { standupsRouter } from "../modules/standups/standups.routes.js";
import { pullRequestsRouter } from "../modules/pull-requests/pull-requests.routes.js";
import { interviewsRouter } from "../modules/interviews/interviews.routes.js";

/**
 * Router raíz de la API, montado bajo /api/v1 en app.ts.
 * Cada fase añade aquí el router de su módulo correspondiente.
 */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/onboarding", onboardingRouter);
apiRouter.use("/courses", coursesRouter);
apiRouter.use("/lessons", lessonsRouter);
apiRouter.use("/skills", skillsRouter);
apiRouter.use("/learning-paths", learningPathsRouter);
apiRouter.use("/exercises", exercisesRouter);
apiRouter.use("/labs", labsRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/portfolio", portfolioRouter);
apiRouter.use("/resume", resumeRouter);
apiRouter.use("/cases", casesRouter);
apiRouter.use("/tickets", ticketsRouter);
apiRouter.use("/sprints", sprintsRouter);
apiRouter.use("/standups", standupsRouter);
apiRouter.use("/pull-requests", pullRequestsRouter);
apiRouter.use("/interviews", interviewsRouter);
