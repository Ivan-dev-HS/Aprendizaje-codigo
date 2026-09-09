import type { ExerciseSeed } from "./exercise-helpers.js";

export const GIT_EXERCISES: ExerciseSeed[] = [
  {
    slug: "git-mcq-comando-staging",
    title: "El comando para mover a staging",
    description: "¿Qué comando mueve cambios del working tree al staging area?",
    type: "MCQ",
    difficulty: "EASY",
    estimatedMinutes: 3,
    skillSlug: "git",
    prompt: {
      type: "MCQ",
      question: "¿Qué comando de Git mueve cambios del working tree al staging area?",
      options: [
        { id: "a", label: "git commit" },
        { id: "b", label: "git push" },
        { id: "c", label: "git add" },
        { id: "d", label: "git merge" },
      ],
    },
    hints: [
      "No es el comando que guarda permanentemente en el historial.",
      "No es el que envía cambios a un servidor remoto.",
      "Es el primer paso del flujo básico: working tree → staging → commit.",
    ],
    solution: { correctOptionId: "c" },
    explanation:
      "git add mueve cambios del working tree al staging area, marcándolos para incluirse en el próximo commit.",
  },
  {
    slug: "git-tf-push-remoto",
    title: "¿Qué hace git push?",
    description: "Comprueba tu conocimiento sobre git push.",
    type: "TRUE_FALSE",
    difficulty: "EASY",
    estimatedMinutes: 3,
    skillSlug: "git",
    prompt: {
      type: "TRUE_FALSE",
      statement:
        "git push envía tus commits locales a un repositorio remoto (como GitHub).",
    },
    hints: [
      "Piensa en la dirección del flujo de datos: ¿local hacia remoto, o remoto hacia local?",
      '"Push" significa "empujar" — empujas tus cambios hacia afuera.',
      "Es lo contrario de git pull.",
    ],
    solution: { correct: true },
    explanation:
      "git push envía (sube) tus commits locales al repositorio remoto configurado, haciéndolos visibles para el resto del equipo.",
  },
  {
    slug: "git-ordering-flujo-basico",
    title: "Ordena el flujo básico de trabajo con Git",
    description: "Ordena estos pasos en el orden típico de un día de trabajo.",
    type: "ORDERING",
    difficulty: "MEDIUM",
    estimatedMinutes: 6,
    skillSlug: "git",
    prompt: {
      type: "ORDERING",
      instruction: "Ordena estos pasos en el orden en que normalmente ocurren.",
      items: [
        { id: "pull", label: "git pull (traer los cambios más recientes del equipo)" },
        { id: "cambios", label: "Hacer cambios en el código" },
        { id: "commit", label: "git add + git commit (guardar los cambios localmente)" },
        { id: "push", label: "git push (subir los cambios al remoto)" },
      ],
    },
    hints: [
      "Antes de empezar a trabajar, es buena práctica traer los cambios más recientes del equipo.",
      "Nunca puedes hacer commit antes de haber cambiado algo.",
      "El push siempre es el último paso, una vez tienes commits locales listos.",
    ],
    solution: { correctOrder: ["pull", "cambios", "commit", "push"] },
    explanation:
      "El flujo típico empieza trayendo los cambios del equipo (pull) para evitar conflictos innecesarios, luego se trabaja, se guarda localmente (add + commit) y finalmente se comparte (push).",
  },
  {
    slug: "git-matching-comandos",
    title: "Empareja: comandos de Git",
    description: "Relaciona cada comando de Git con lo que hace.",
    type: "MATCHING",
    difficulty: "MEDIUM",
    estimatedMinutes: 6,
    skillSlug: "git",
    prompt: {
      type: "MATCHING",
      instruction: "Une cada comando con su descripción.",
      left: [
        { id: "add", label: "git add" },
        { id: "commit", label: "git commit" },
        { id: "push", label: "git push" },
        { id: "pull", label: "git pull" },
      ],
      right: [
        { id: "staging", label: "Mueve cambios al staging area" },
        { id: "guarda", label: "Guarda una instantánea permanente en el historial" },
        { id: "sube", label: "Envía commits locales al repositorio remoto" },
        { id: "trae", label: "Trae y combina cambios nuevos del repositorio remoto" },
      ],
    },
    hints: [
      "add y commit son los dos primeros pasos, ambos locales.",
      "push y pull son los que hablan con el repositorio remoto — en direcciones opuestas.",
      "pull trae cambios hacia ti, push los envía desde ti.",
    ],
    solution: {
      correctPairs: [
        { leftId: "add", rightId: "staging" },
        { leftId: "commit", rightId: "guarda" },
        { leftId: "push", rightId: "sube" },
        { leftId: "pull", rightId: "trae" },
      ],
    },
    explanation:
      "add y commit trabajan localmente (staging area → historial local); push y pull sincronizan ese historial local con el repositorio remoto, cada uno en una dirección.",
  },
  {
    slug: "git-completion-crear-rama",
    title: "Completa: crear y cambiar de rama",
    description:
      "Rellena el comando que falta para crear una rama nueva y cambiar a ella.",
    type: "CODE_COMPLETION",
    difficulty: "MEDIUM",
    estimatedMinutes: 5,
    skillSlug: "git",
    prompt: {
      type: "CODE_COMPLETION",
      instruction:
        "Este comando debe crear una rama llamada feature/login y cambiar a ella en un solo paso. Escribe el comando completo (sin el nombre de la rama).",
      code: "___ feature/login",
      language: "bash",
    },
    hints: [
      "Es una variante de git checkout con un flag para crear la rama al mismo tiempo.",
      "El flag es una sola letra minúscula.",
      "git checkout -b <nombre-rama>",
    ],
    solution: {
      expectedAnswer: "git checkout -b",
      acceptableAnswers: ["git switch -c"],
    },
    explanation:
      "git checkout -b <rama> crea la rama y cambia a ella en un solo comando (equivalente moderno: git switch -c <rama>).",
  },
];
