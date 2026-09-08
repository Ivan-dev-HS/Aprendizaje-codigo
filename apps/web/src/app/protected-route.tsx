import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "@codeforge/ui";
import { useAuth } from "../features/auth/auth-context";

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner label="Cargando tu sesión…" />
    </div>
  );
}

/** Redirige a /login si no hay sesión. La autorización real siempre se valida en backend. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullScreenSpinner />;
  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Igual que ProtectedRoute, pero además exige haber completado el onboarding. */
export function RequireOnboarding() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullScreenSpinner />;
  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!user?.profile.onboardingCompletedAt) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}

/** Solo accesible sin sesión (login/register): si ya hay sesión, va al dashboard. */
export function GuestOnlyRoute() {
  const { status } = useAuth();
  if (status === "loading") return <FullScreenSpinner />;
  if (status === "authenticated") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Requiere rol ADMIN. El backend vuelve a verificarlo en cada request. */
export function RequireAdmin() {
  const { status, user } = useAuth();
  if (status === "loading") return <FullScreenSpinner />;
  if (status === "anonymous") return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
