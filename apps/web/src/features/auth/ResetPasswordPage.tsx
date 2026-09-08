import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordResetConfirmSchema,
  type PasswordResetConfirmInput,
} from "@codeforge/validators";
import { Alert, Button, Card, FieldError, Input, Label } from "@codeforge/ui";
import { authApi } from "./auth.api";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetConfirmInput>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: { token: searchParams.get("token") ?? "" },
  });

  async function onSubmit(input: PasswordResetConfirmInput) {
    setError(null);
    try {
      await authApi.confirmPasswordReset(input);
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch {
      setError("El enlace no es válido o ha expirado. Solicita uno nuevo.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold">Establece una nueva contraseña</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Pega el token que recibiste y elige una nueva contraseña.
        </p>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="token">Token de recuperación</Label>
            <Input id="token" hasError={!!errors.token} {...register("token")} />
            <FieldError>{errors.token?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              hasError={!!errors.newPassword}
              {...register("newPassword")}
            />
            <FieldError>{errors.newPassword?.message}</FieldError>
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Cambiar contraseña
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link
            to="/login"
            className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
