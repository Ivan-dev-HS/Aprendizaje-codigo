import { Router } from "express";
import { healthRouter } from "../modules/health/health.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { onboardingRouter } from "../modules/onboarding/onboarding.routes.js";
import { coursesRouter } from "../modules/courses/courses.routes.js";
import { lessonsRouter } from "../modules/lessons/lessons.routes.js";
import { skillsRouter } from "../modules/skills/skills.routes.js";
import { learningPathsRouter } from "../modules/learning-paths/learning-paths.routes.js";

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
