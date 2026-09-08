import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@codeforge/validators";
import { Alert, Button, Card, FieldError, Input, Label } from "@codeforge/ui";
import { useAuth } from "./auth-context";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(input: RegisterInput) {
    setServerError(null);
    try {
      await registerUser(input);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response
          ?.data?.error?.message ??
        "No hemos podido crear tu cuenta. Inténtalo de nuevo.";
      setServerError(message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold">Crea tu cuenta</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Empieza tu camino para convertirte en desarrollador/a junior.
        </p>

        {serverError && (
          <Alert variant="error" className="mb-4">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="displayName">Nombre</Label>
            <Input
              id="displayName"
              autoComplete="name"
              hasError={!!errors.displayName}
              {...register("displayName")}
            />
            <FieldError>{errors.displayName?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              autoComplete="username"
              hasError={!!errors.username}
              {...register("username")}
            />
            <FieldError>{errors.username?.message}</FieldError>
          </div>

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
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              hasError={!!errors.password}
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
