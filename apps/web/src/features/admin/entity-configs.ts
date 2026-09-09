export interface AdminFieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "select" | "json";
  options?: string[];
  required?: boolean;
}

export interface AdminEntityConfig {
  title: string;
  basePath: string;
  columns: { key: string; label: string }[];
  fields: AdminFieldConfig[];
}

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

export const ADMIN_ENTITIES: Record<string, AdminEntityConfig> = {
  courses: {
    title: "Cursos",
    basePath: "courses",
    columns: [
      { key: "title", label: "Título" },
      { key: "slug", label: "Slug" },
      { key: "order", label: "Orden" },
      { key: "isPublished", label: "Publicado" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descripción", type: "textarea", required: true },
      { name: "order", label: "Orden", type: "number", required: true },
      { name: "icon", label: "Icono (emoji)", type: "text" },
      { name: "estimatedHours", label: "Horas estimadas", type: "number" },
      { name: "isPublished", label: "Publicado", type: "boolean" },
    ],
  },
  modules: {
    title: "Módulos",
    basePath: "modules",
    columns: [
      { key: "title", label: "Título" },
      { key: "courseId", label: "courseId" },
      { key: "order", label: "Orden" },
    ],
    fields: [
      { name: "courseId", label: "ID del curso", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descripción", type: "textarea", required: true },
      { name: "order", label: "Orden", type: "number", required: true },
      { name: "requiresModuleId", label: "Requiere módulo (ID, opcional)", type: "text" },
    ],
  },
  lessons: {
    title: "Lecciones",
    basePath: "lessons",
    columns: [
      { key: "title", label: "Título" },
      { key: "moduleId", label: "moduleId" },
      { key: "order", label: "Orden" },
    ],
    fields: [
      { name: "moduleId", label: "ID del módulo", type: "text", required: true },
      { name: "skillId", label: "ID de la skill (opcional)", type: "text" },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Título", type: "text", required: true },
      { name: "summary", label: "Resumen", type: "textarea", required: true },
      {
        name: "content",
        label:
          "Contenido (JSON: theory/technical/example/commonMistake/challenge/realApplication)",
        type: "json",
        required: true,
      },
      { name: "order", label: "Orden", type: "number", required: true },
      { name: "estimatedMinutes", label: "Minutos estimados", type: "number" },
    ],
  },
  exercises: {
    title: "Ejercicios",
    basePath: "exercises",
    columns: [
      { key: "title", label: "Título" },
      { key: "type", label: "Tipo" },
      { key: "difficulty", label: "Dificultad" },
      { key: "points", label: "Puntos" },
    ],
    fields: [
      { name: "lessonId", label: "ID de la lección (opcional)", type: "text" },
      { name: "skillId", label: "ID de la skill", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descripción", type: "textarea", required: true },
      {
        name: "type",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          "MCQ",
          "TRUE_FALSE",
          "CODE_COMPLETION",
          "CODE_WRITING",
          "DEBUGGING",
          "OUTPUT_PREDICTION",
          "ORDERING",
          "MATCHING",
          "SQL",
          "TERMINAL",
          "REAL_CASE",
          "PROJECT_TASK",
        ],
      },
      {
        name: "difficulty",
        label: "Dificultad",
        type: "select",
        required: true,
        options: DIFFICULTIES,
      },
      { name: "points", label: "Puntos", type: "number", required: true },
      {
        name: "estimatedMinutes",
        label: "Minutos estimados",
        type: "number",
        required: true,
      },
      {
        name: "prompt",
        label: "Prompt (JSON, según el tipo)",
        type: "json",
        required: true,
      },
      { name: "hints", label: "Pistas (JSON: string[])", type: "json", required: true },
      {
        name: "solution",
        label: "Solución (JSON, según el tipo)",
        type: "json",
        required: true,
      },
      { name: "explanation", label: "Explicación", type: "textarea", required: true },
      { name: "tests", label: "Tests (JSON, opcional)", type: "json" },
      { name: "isPublished", label: "Publicado", type: "boolean" },
    ],
  },
  projects: {
    title: "Proyectos",
    basePath: "projects",
    columns: [
      { key: "title", label: "Título" },
      { key: "level", label: "Nivel" },
      { key: "estimatedHours", label: "Horas" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Título", type: "text", required: true },
      {
        name: "level",
        label: "Nivel",
        type: "select",
        required: true,
        options: [
          "L1_PORTFOLIO",
          "L2_LANDING",
          "L3_TODO",
          "L4_DASHBOARD",
          "L5_API_APP",
          "L6_ECOMMERCE",
          "L7_FULL_STACK",
          "L8_SAAS",
        ],
      },
      { name: "brief", label: "Brief", type: "textarea", required: true },
      {
        name: "requirements",
        label: "Requirements (JSON: string[])",
        type: "json",
        required: true,
      },
      {
        name: "userStories",
        label: "User stories (JSON: string[])",
        type: "json",
        required: true,
      },
      {
        name: "acceptanceCriteria",
        label: "Acceptance criteria (JSON: string[])",
        type: "json",
        required: true,
      },
      {
        name: "bonusIdeas",
        label: "Bonus ideas (JSON: string[], opcional)",
        type: "json",
      },
      {
        name: "estimatedHours",
        label: "Horas estimadas",
        type: "number",
        required: true,
      },
    ],
  },
  skills: {
    title: "Skills",
    basePath: "skills",
    columns: [
      { key: "name", label: "Nombre" },
      { key: "category", label: "Categoría" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "description", label: "Descripción", type: "textarea", required: true },
      { name: "category", label: "Categoría", type: "text", required: true },
    ],
  },
  achievements: {
    title: "Logros",
    basePath: "achievements",
    columns: [
      { key: "icon", label: "" },
      { key: "title", label: "Título" },
      { key: "xpReward", label: "XP" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descripción", type: "textarea", required: true },
      { name: "icon", label: "Icono (emoji)", type: "text", required: true },
      { name: "xpReward", label: "XP de recompensa", type: "number" },
      {
        name: "criteria",
        label:
          'Criterio (JSON: {"kind":"XP_SOURCE_COUNT","source":"LESSON","count":1} | {"kind":"STREAK_DAYS","days":7} | {"kind":"LEVEL","level":5} | {"kind":"XP_TOTAL","amount":1000})',
        type: "json",
        required: true,
      },
    ],
  },
  "interview-questions": {
    title: "Preguntas de entrevista",
    basePath: "interview-questions",
    columns: [
      { key: "prompt", label: "Pregunta" },
      { key: "category", label: "Categoría" },
      { key: "difficulty", label: "Dificultad" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      {
        name: "category",
        label: "Categoría",
        type: "select",
        required: true,
        options: [
          "TECHNICAL",
          "BEHAVIORAL",
          "FRONTEND",
          "BACKEND",
          "FULL_STACK",
          "IT_SUPPORT",
        ],
      },
      { name: "skillId", label: "ID de la skill (opcional)", type: "text" },
      {
        name: "difficulty",
        label: "Dificultad",
        type: "select",
        required: true,
        options: DIFFICULTIES,
      },
      { name: "prompt", label: "Pregunta", type: "textarea", required: true },
      {
        name: "expectedAnswer",
        label: "Respuesta modelo",
        type: "textarea",
        required: true,
      },
      {
        name: "concepts",
        label: "Conceptos clave (JSON: string[])",
        type: "json",
        required: true,
      },
      {
        name: "commonMistakes",
        label: "Errores frecuentes (JSON: string[])",
        type: "json",
        required: true,
      },
    ],
  },
  tickets: {
    title: "Tickets (Nexora Tech)",
    basePath: "tickets",
    columns: [
      { key: "code", label: "Código" },
      { key: "title", label: "Título" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Prioridad" },
    ],
    fields: [
      { name: "code", label: "Código (p.ej. NEX-109)", type: "text", required: true },
      { name: "sprintId", label: "ID del sprint (opcional)", type: "text" },
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descripción", type: "textarea", required: true },
      {
        name: "priority",
        label: "Prioridad",
        type: "select",
        required: true,
        options: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      },
      {
        name: "type",
        label: "Tipo",
        type: "select",
        required: true,
        options: ["BUG", "FEATURE", "CHORE", "INCIDENT"],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          "BACKLOG",
          "TODO",
          "IN_PROGRESS",
          "BLOCKED",
          "CODE_REVIEW",
          "QA",
          "DONE",
        ],
      },
      {
        name: "acceptanceCriteria",
        label: "Acceptance criteria (JSON: string[])",
        type: "json",
        required: true,
      },
      { name: "reporterId", label: "ID de quien reporta", type: "text", required: true },
      {
        name: "assigneeId",
        label: "ID de quien lo tiene asignado (opcional)",
        type: "text",
      },
    ],
  },
};
