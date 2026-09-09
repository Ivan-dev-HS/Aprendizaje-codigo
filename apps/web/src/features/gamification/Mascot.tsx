/**
 * "Chispa", la mascota de CodeForge — presencia amistosa tipo Duolingo,
 * peticion explícita del usuario para que la plataforma sea más entretenida.
 * Sin librería de animación ni assets nuevos: un emoji + un globo de texto
 * con mensajes contextuales es honesto sobre las herramientas disponibles
 * (no hay generación de imágenes en este proyecto) y sigue siendo
 * genuinamente simpático.
 */
export function Mascot({
  message,
  size = "md",
}: {
  message: string;
  size?: "sm" | "md" | "lg";
}) {
  const emojiSize = size === "lg" ? "text-5xl" : size === "sm" ? "text-2xl" : "text-3xl";
  return (
    <div className="flex items-start gap-3">
      <span className={`${emojiSize} shrink-0`} aria-hidden="true">
        🤖
      </span>
      <div className="relative rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800">
        {message}
      </div>
    </div>
  );
}
