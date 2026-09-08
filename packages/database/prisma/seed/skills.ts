import { prisma } from "../../src/client.js";

/** Catálogo de skills (sección 11 de SPEC.md). Idempotente vía upsert por `slug`. */
export const SKILLS = [
  {
    slug: "html-fundamentals",
    name: "HTML Fundamentals",
    category: "frontend",
    description: "Estructura semántica de documentos HTML.",
  },
  {
    slug: "semantic-html",
    name: "Semantic HTML",
    category: "frontend",
    description: "Uso correcto de etiquetas semánticas y accesibilidad básica.",
  },
  {
    slug: "css-layout",
    name: "CSS Layout",
    category: "frontend",
    description: "Modelo de caja, posicionamiento y flujo en CSS.",
  },
  {
    slug: "flexbox",
    name: "Flexbox",
    category: "frontend",
    description: "Layouts unidimensionales con Flexbox.",
  },
  {
    slug: "css-grid",
    name: "CSS Grid",
    category: "frontend",
    description: "Layouts bidimensionales con CSS Grid.",
  },
  {
    slug: "responsive-design",
    name: "Responsive Design",
    category: "frontend",
    description: "Diseño adaptable a distintos tamaños de pantalla.",
  },
  {
    slug: "javascript-fundamentals",
    name: "JavaScript Fundamentals",
    category: "frontend",
    description: "Variables, tipos, funciones, control de flujo.",
  },
  {
    slug: "dom",
    name: "DOM",
    category: "frontend",
    description: "Manipulación del DOM y eventos.",
  },
  {
    slug: "async-javascript",
    name: "Async JavaScript",
    category: "frontend",
    description: "Callbacks, promesas, async/await.",
  },
  {
    slug: "apis",
    name: "APIs",
    category: "backend",
    description: "Consumo y diseño de APIs REST.",
  },
  {
    slug: "git",
    name: "Git",
    category: "tools",
    description: "Control de versiones con Git y GitHub.",
  },
  {
    slug: "typescript",
    name: "TypeScript",
    category: "frontend",
    description: "Tipado estático sobre JavaScript.",
  },
  {
    slug: "react",
    name: "React",
    category: "frontend",
    description: "Componentes, hooks y estado en React.",
  },
  {
    slug: "node",
    name: "Node",
    category: "backend",
    description: "Entorno de ejecución de JavaScript en servidor.",
  },
  {
    slug: "express",
    name: "Express",
    category: "backend",
    description: "Construcción de APIs con Express.",
  },
  {
    slug: "sql",
    name: "SQL",
    category: "backend",
    description: "Consultas y modelado de datos relacional.",
  },
  {
    slug: "testing",
    name: "Testing",
    category: "quality",
    description: "Tests unitarios, de integración y E2E.",
  },
  {
    slug: "docker",
    name: "Docker",
    category: "tools",
    description: "Contenedores y Docker Compose.",
  },
  {
    slug: "linux",
    name: "Linux",
    category: "tools",
    description: "Terminal y administración básica de Linux.",
  },
  {
    slug: "networking",
    name: "Networking",
    category: "it-support",
    description: "DNS, DHCP, IP, puertos, HTTP/HTTPS.",
  },
  {
    slug: "debugging",
    name: "Debugging",
    category: "quality",
    description: "Diagnóstico y resolución sistemática de errores.",
  },
  {
    slug: "problem-solving",
    name: "Problem Solving",
    category: "soft-skills",
    description: "Descomposición y resolución de problemas.",
  },
  {
    slug: "communication",
    name: "Communication",
    category: "soft-skills",
    description: "Comunicación técnica: tickets, PRs, standups.",
  },
  {
    slug: "code-review",
    name: "Code Review",
    category: "soft-skills",
    description: "Revisión de código: bugs, seguridad, arquitectura.",
  },
] as const;

export async function seedSkills() {
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: {
        name: skill.name,
        description: skill.description,
        category: skill.category,
      },
      create: skill,
    });
  }
  console.log(`  ✔ ${SKILLS.length} skills`);
}
