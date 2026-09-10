import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deleteAccountSchema,
  updateProfileSchema,
  type DeleteAccountInput,
  type UpdateProfileInput,
} from "@codeforge/validators";
import { Alert, Button, Card, FieldError, Input, Label } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { useAuth } from "../auth/auth-context";
import { settingsApi } from "./settings.api";

function ProfileForm() {
  const { user, setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: user?.profile.displayName ?? "",
      bio: user?.profile.bio ?? "",
      avatarUrl: user?.profile.avatarUrl ?? "",
    },
  });

  async function onSubmit(input: UpdateProfileInput) {
    setServerError(null);
    setSaved(false);
    try {
      const updated = await settingsApi.updateProfile(input);
      setUser(updated);
      setSaved(true);
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response
          ?.data?.error?.message ?? "No hemos podido guardar los cambios.";
      setServerError(message);
    }
  }

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">Tu perfil</h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Esta información aparece en tu portfolio público y en Nexora Tech.
      </p>

      {serverError && (
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>
      )}
      {saved && (
        <Alert variant="success" className="mb-4">
          Cambios guardados.
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="displayName">Nombre visible</Label>
          <Input
            id="displayName"
            autoComplete="name"
            hasError={!!errors.displayName}
            {...register("displayName")}
          />
          <FieldError>{errors.displayName?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            {...register("bio")}
          />
          <FieldError>{errors.bio?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="avatarUrl">URL de tu avatar</Label>
          <Input
            id="avatarUrl"
            type="url"
            placeholder="https://…"
            hasError={!!errors.avatarUrl}
            {...register("avatarUrl")}
          />
          <FieldError>{errors.avatarUrl?.message}</FieldError>
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          Guardar cambios
        </Button>
      </form>
    </Card>
  );
}

function DangerZone() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DeleteAccountInput>({ resolver: zodResolver(deleteAccountSchema) });

  async function onSubmit(input: DeleteAccountInput) {
    setServerError(null);
    try {
      await settingsApi.deleteAccount(input);
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response
          ?.data?.error?.message ??
        "No hemos podido borrar tu cuenta. Inténtalo de nuevo.";
      setServerError(message);
    }
  }

  return (
    <Card className="border-red-200 dark:border-red-900">
      <h2 className="mb-1 text-lg font-semibold text-red-700 dark:text-red-400">
        Zona de peligro
      </h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Borrar tu cuenta es permanente: perderás tu progreso, tus proyectos y tu
        portfolio. No se puede deshacer.
      </p>

      {!confirming && (
        <Button
          variant="danger"
          onClick={() => {
            setConfirming(true);
            setServerError(null);
          }}
        >
          Borrar mi cuenta
        </Button>
      )}

      {confirming && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <div>
            <Label htmlFor="deletePassword">Introduce tu contraseña para confirmar</Label>
            <Input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              hasError={!!errors.password}
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="danger" isLoading={isSubmitting}>
              Sí, borrar mi cuenta definitivamente
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirming(false);
                setServerError(null);
                reset();
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export function SettingsPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <h1 className="text-2xl font-bold">Ajustes de la cuenta</h1>
        <ProfileForm />
        <DangerZone />
      </main>
    </div>
  );
}
