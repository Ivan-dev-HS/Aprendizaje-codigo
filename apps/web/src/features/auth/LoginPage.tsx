import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@codeforge/validators";
import { Alert, Button, Card, FieldError, Input, Label } from "@codeforge/ui";
import { useAuth } from "./auth-context";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(input: LoginInput) {
    setServerError(null);
    try {
      const user = await login(input);
      const redirectTo =
        (location.state as { from?: string } | null)?.from ??
        (user.profile.onboardingCompletedAt ? "/dashboard" : "/onboarding");
      navigate(redirectTo, { replace: true });
    } catch {
      setServerError("Email o contraseña incorrectos.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold">Inicia sesión</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Continúa donde lo dejaste.
        </p>

        {serverError && (
          <Alert variant="error" className="mb-4">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              hasError={!!errors.email}
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                to="/recuperar-contrasena"
                className="text-brand-600 dark:text-brand-400 mb-1.5 text-sm hover:underline"
              >
                ¿La olvidaste?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              hasError={!!errors.password}
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </Card>
    </main>
  );
}
