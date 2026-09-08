import { Route, Routes } from "react-router-dom";
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
import { GuestOnlyRoute, ProtectedRoute, RequireOnboarding } from "./app/protected-route";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

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
      </Route>
    </Routes>
  );
}
