/**
 * Evaluación inicial del onboarding (sección 9, paso 3). Un cuestionario corto
 * y real —no genérico— que permite detectar qué conceptos domina ya un
 * usuario autodidacta (Perfil B) para marcar contenido introductorio como
 * opcional en su ruta de aprendizaje, en vez de obligarle a repetirlo.
 *
 * No forma parte del motor general de Exercise (eso llega en la Fase 4): es
 * contenido propio, autocontenido, del flujo de onboarding.
 */
export interface DiagnosticQuizOption {
  id: string;
  label: string;
}

export interface DiagnosticQuizQuestion {
  id: string;
  skillSlug: string;
  prompt: string;
  options: DiagnosticQuizOption[];
  correctOptionId: string;
}

export const DIAGNOSTIC_QUIZ: DiagnosticQuizQuestion[] = [
  {
    id: "q1-html-semantics",
    skillSlug: "semantic-html",
    prompt:
      "¿Qué etiqueta HTML es la más adecuada para el contenido principal de un artículo de blog?",
    options: [
      { id: "a", label: '<div class="article">' },
      { id: "b", label: "<article>" },
      { id: "c", label: "<span>" },
      { id: "d", label: "<b>" },
    ],
    correctOptionId: "b",
  },
  {
    id: "q2-css-box-model",
    skillSlug: "css-layout",
    prompt:
      "Con `box-sizing: border-box`, ¿qué incluye el `width` que defines en un elemento?",
    options: [
      { id: "a", label: "Solo el contenido" },
      { id: "b", label: "Contenido + padding, pero no el borde" },
      { id: "c", label: "Contenido + padding + borde" },
      { id: "d", label: "Solo el borde" },
    ],
    correctOptionId: "c",
  },
  {
    id: "q3-flexbox",
    skillSlug: "flexbox",
    prompt:
      "En Flexbox, ¿qué propiedad del contenedor centra los elementos en el eje principal?",
    options: [
      { id: "a", label: "align-items: center" },
      { id: "b", label: "justify-content: center" },
      { id: "c", label: "text-align: center" },
      { id: "d", label: "flex-direction: center" },
    ],
    correctOptionId: "b",
  },
  {
    id: "q4-js-scope",
    skillSlug: "javascript-fundamentals",
    prompt: "¿Cuál es la principal diferencia entre `let` y `var` en JavaScript?",
    options: [
      { id: "a", label: "`let` tiene scope de bloque, `var` tiene scope de función" },
      { id: "b", label: "No hay ninguna diferencia" },
      { id: "c", label: "`var` es más moderno que `let`" },
      { id: "d", label: "`let` no se puede reasignar" },
    ],
    correctOptionId: "a",
  },
  {
    id: "q5-js-async",
    skillSlug: "async-javascript",
    prompt: "¿Qué hace `await` dentro de una función `async`?",
    options: [
      { id: "a", label: "Detiene la ejecución de todo el programa" },
      { id: "b", label: "Convierte la promesa en un callback" },
      {
        id: "c",
        label:
          "Pausa la función hasta que la promesa se resuelva, sin bloquear el hilo principal",
      },
      { id: "d", label: "Ejecuta el código de forma síncrona siempre" },
    ],
    correctOptionId: "c",
  },
  {
    id: "q6-dom",
    skillSlug: "dom",
    prompt:
      "¿Qué método se usa para seleccionar el primer elemento que coincide con un selector CSS?",
    options: [
      { id: "a", label: "document.getElementsByClassName()" },
      { id: "b", label: "document.querySelector()" },
      { id: "c", label: "document.createElement()" },
      { id: "d", label: "document.getAll()" },
    ],
    correctOptionId: "b",
  },
  {
    id: "q7-git",
    skillSlug: "git",
    prompt: "¿Qué comando mueve cambios del working tree al staging area en Git?",
    options: [
      { id: "a", label: "git commit" },
      { id: "b", label: "git push" },
      { id: "c", label: "git add" },
      { id: "d", label: "git merge" },
    ],
    correctOptionId: "c",
  },
  {
    id: "q8-responsive",
    skillSlug: "responsive-design",
    prompt: "¿Qué unidad CSS es relativa al ancho del viewport?",
    options: [
      { id: "a", label: "px" },
      { id: "b", label: "vw" },
      { id: "c", label: "pt" },
      { id: "d", label: "cm" },
    ],
    correctOptionId: "b",
  },
];

export function getPublicDiagnosticQuiz() {
  return DIAGNOSTIC_QUIZ.map(({ id, skillSlug, prompt, options }) => ({
    id,
    skillSlug,
    prompt,
    options,
  }));
}
