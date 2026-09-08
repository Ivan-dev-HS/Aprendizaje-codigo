import { prisma } from "../../src/client.js";

/**
 * Catálogo de los 18 cursos (sección 13 de SPEC.md). Se siembra completo desde
 * la Fase 2 para que el roadmap/onboarding pueda generar rutas de aprendizaje
 * reales desde el primer arranque. El contenido (módulos/lecciones/ejercicios)
 * se añade curso a curso en fases posteriores — ver docs/CONTENT_BACKLOG.md.
 */
export const COURSES = [
  {
    slug: "fundamentos-informatica",
    title: "Fundamentos de informática",
    description:
      "Cómo funciona un ordenador, archivos, sistemas operativos, redes básicas y lógica: la base antes de escribir la primera línea de código.",
    order: 1,
    icon: "cpu",
    estimatedHours: 8,
  },
  {
    slug: "html",
    title: "HTML",
    description:
      "Estructura semántica de páginas web: etiquetas, formularios, accesibilidad.",
    order: 2,
    icon: "code",
    estimatedHours: 12,
  },
  {
    slug: "css",
    title: "CSS",
    description: "Estilos, modelo de caja, Flexbox, Grid y diseño responsive.",
    order: 3,
    icon: "palette",
    estimatedHours: 16,
  },
  {
    slug: "javascript",
    title: "JavaScript",
    description: "El lenguaje de la web: variables, funciones, DOM, eventos, asincronía.",
    order: 4,
    icon: "braces",
    estimatedHours: 30,
  },
  {
    slug: "git-github",
    title: "Git y GitHub",
    description: "Control de versiones, ramas, Pull Requests y colaboración en equipo.",
    order: 5,
    icon: "git-branch",
    estimatedHours: 10,
  },
  {
    slug: "typescript",
    title: "TypeScript",
    description: "Tipado estático sobre JavaScript para escribir código más seguro.",
    order: 6,
    icon: "file-type",
    estimatedHours: 12,
  },
  {
    slug: "react",
    title: "React",
    description: "Interfaces declarativas con componentes, hooks y gestión de estado.",
    order: 7,
    icon: "atom",
    estimatedHours: 24,
  },
  {
    slug: "node",
    title: "Node.js",
    description: "JavaScript en el servidor: módulos, filesystem, procesos, npm.",
    order: 8,
    icon: "server",
    estimatedHours: 14,
  },
  {
    slug: "apis-rest",
    title: "APIs REST",
    description: "Diseño y consumo de APIs REST: rutas, status codes, autenticación.",
    order: 9,
    icon: "plug",
    estimatedHours: 14,
  },
  {
    slug: "sql-postgresql",
    title: "SQL y PostgreSQL",
    description: "Modelado relacional, consultas SQL, índices y buenas prácticas.",
    order: 10,
    icon: "database",
    estimatedHours: 16,
  },
  {
    slug: "linux",
    title: "Linux",
    description: "Terminal, sistema de archivos, permisos y administración básica.",
    order: 11,
    icon: "terminal",
    estimatedHours: 10,
  },
  {
    slug: "testing",
    title: "Testing",
    description: "Tests unitarios, de integración y end-to-end: Vitest, RTL, Playwright.",
    order: 12,
    icon: "check-circle",
    estimatedHours: 12,
  },
  {
    slug: "docker",
    title: "Docker",
    description: "Contenedores, imágenes y Docker Compose para entornos reproducibles.",
    order: 13,
    icon: "box",
    estimatedHours: 10,
  },
  {
    slug: "debugging",
    title: "Debugging",
    description:
      "Metodología de diagnóstico de errores en HTML, CSS, JS, React, Node, SQL, APIs, Git y Linux.",
    order: 14,
    icon: "bug",
    estimatedHours: 16,
  },
  {
    slug: "it-support",
    title: "IT Support",
    description:
      "Diagnóstico de incidencias de hardware, sistema operativo, red, cuentas y rendimiento.",
    order: 15,
    icon: "life-buoy",
    estimatedHours: 14,
  },
  {
    slug: "proyecto-full-stack",
    title: "Proyecto Full Stack",
    description:
      "Construye una aplicación completa: frontend, backend, base de datos y despliegue.",
    order: 16,
    icon: "layers",
    estimatedHours: 30,
  },
  {
    slug: "trabajo-en-empresa",
    title: "Trabajo en empresa",
    description:
      "Simulación laboral en Nexora Tech: tickets, sprints, PRs, code review, incidentes.",
    order: 17,
    icon: "briefcase",
    estimatedHours: 20,
  },
  {
    slug: "entrevistas",
    title: "Entrevistas",
    description:
      "Preparación técnica y de comunicación para entrevistas de desarrollador/a junior.",
    order: 18,
    icon: "message-circle",
    estimatedHours: 12,
  },
] as const;

export async function seedCourses() {
  for (const course of COURSES) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        description: course.description,
        order: course.order,
        icon: course.icon,
        estimatedHours: course.estimatedHours,
      },
      create: course,
    });
  }
  console.log(`  ✔ ${COURSES.length} cursos`);
}
