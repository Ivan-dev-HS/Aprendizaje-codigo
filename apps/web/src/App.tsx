import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Spinner } from "@codeforge/ui";
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { LoginPage } from "./features/auth/LoginPage";
import { ForgotPasswordPage } from "./features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage";
import { OnboardingPage } from "./features/onboarding/OnboardingPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { CoursesPage } from "./features/learning/CoursesPage";
import { CourseDetailPage } from "./features/learning/CourseDetailPage";
import { LessonPage } from "./features/learning/LessonPage";
import { ExercisesPage } from "./features/exercises/ExercisesPage";
import { ExerciseDetailPage } from "./features/exercises/ExerciseDetailPage";
import { LabsPage } from "./features/labs/LabsPage";
import { TerminalLabPage } from "./features/labs/TerminalLabPage";
import { GitLabPage } from "./features/labs/GitLabPage";
import { ProjectsPage } from "./features/projects/ProjectsPage";
import { ProjectDetailPage } from "./features/projects/ProjectDetailPage";
import { PortfolioEditorPage } from "./features/portfolio/PortfolioEditorPage";
import { PublicPortfolioPage } from "./features/portfolio/PublicPortfolioPage";
import { ResumeBuilderPage } from "./features/portfolio/ResumeBuilderPage";
import { GuestOnlyRoute, ProtectedRoute, RequireOnboarding } from "./app/protected-route";

// Monaco Editor es pesado (~1MB gzip): se separa en su propio chunk y solo se
// descarga cuando el usuario visita un lab que realmente lo usa.
const PlaygroundPage = lazy(() =>
  import("./features/labs/PlaygroundPage").then((m) => ({ default: m.PlaygroundPage })),
);
const JsLabPage = lazy(() =>
  import("./features/labs/JsLabPage").then((m) => ({ default: m.JsLabPage })),
);
const SqlLabPage = lazy(() =>
  import("./features/labs/SqlLabPage").then((m) => ({ default: m.SqlLabPage })),
);

function LazyPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner label="Cargando…" />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />

      <Route element={<GuestOnlyRoute />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
        <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      <Route element={<RequireOnboarding />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/lessons/:id" element={<LessonPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route
          path="/labs/playground"
          element={
            <Suspense fallback={<LazyPageFallback />}>
              <PlaygroundPage />
            </Suspense>
          }
        />
        <Route
          path="/labs/javascript"
          element={
            <Suspense fallback={<LazyPageFallback />}>
              <JsLabPage />
            </Suspense>
          }
        />
        <Route
          path="/labs/sql"
          element={
            <Suspense fallback={<LazyPageFallback />}>
              <SqlLabPage />
            </Suspense>
          }
        />
        <Route path="/labs/terminal" element={<TerminalLabPage />} />
        <Route path="/labs/git" element={<GitLabPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/portfolio" element={<PortfolioEditorPage />} />
        <Route path="/resume" element={<ResumeBuilderPage />} />
      </Route>
    </Routes>
  );
}
