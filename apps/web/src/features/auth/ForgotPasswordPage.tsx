import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestInput,
} from "@codeforge/validators";
import { Alert, Button, Card, FieldError, Input, Label } from "@codeforge/ui";
import { authApi } from "./auth.api";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  async function onSubmit(input: PasswordResetRequestInput) {
    setError(null);
    try {
      await authApi.requestPasswordReset(input);
      setSent(true);
    } catch {
      setError("No hemos podido procesar tu solicitud. Inténtalo de nuevo.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold">Recupera tu contraseña</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Te enviaremos instrucciones si existe una cuenta con ese email.
        </p>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {sent ? (
          <Alert variant="success">
            Si existe una cuenta con ese email, recibirás instrucciones para recuperar tu
            contraseña.
          </Alert>
        ) : (
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
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Enviar instrucciones
            </Button>
          </form>
        )}

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
