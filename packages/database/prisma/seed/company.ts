import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../src/client.js";

/**
 * Simulador de empresa "Nexora Tech" (secciones 28-33 de SPEC.md). Es un
 * espacio de trabajo COMPARTIDO (como un sprint board real de equipo): todos
 * los usuarios ven el mismo sprint y los mismos tickets, y pueden
 * autoasignarse los que estén libres — no es una copia privada por usuario
 * (igual decisión de modelado que reflejan `Sprint`/`Ticket` en el schema,
 * sin `userId` propio, a diferencia de `UserProject`).
 *
 * Las "personas" (reporter/autor de PR) son usuarios reales de la tabla
 * `User` con email @nexora-tech.internal — nunca inician sesión (password
 * aleatoria), solo existen para que Nexora Tech se sienta como un equipo de
 * verdad con nombres y roles, en vez de "Sistema" genérico.
 */
const TEAMMATES = [
  {
    email: "elena.rios@nexora-tech.internal",
    username: "elena.rios",
    displayName: "Elena Ríos",
  },
  {
    email: "marcos.ibanez@nexora-tech.internal",
    username: "marcos.ibanez",
    displayName: "Marcos Ibáñez",
  },
];

interface TicketSeed {
  code: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: "BUG" | "FEATURE" | "CHORE" | "INCIDENT";
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "BLOCKED" | "CODE_REVIEW" | "QA";
  acceptanceCriteria: string[];
  reporterEmail: string;
}

const SPRINT_TICKETS: TicketSeed[] = [
  {
    code: "NEX-101",
    title: 'El botón de "Guardar" no responde en Safari',
    description:
      'Varios usuarios de Safari reportan que al pulsar "Guardar" en el formulario de perfil no pasa nada. En Chrome y Firefox funciona sin problema.',
    priority: "HIGH",
    type: "BUG",
    status: "TODO",
    acceptanceCriteria: [
      "El botón Guardar funciona correctamente en Safari (última versión y la anterior).",
      "Se añade un test manual documentado en el propio ticket tras verificarlo.",
      "No se rompe el comportamiento existente en Chrome/Firefox.",
    ],
    reporterEmail: "elena.rios@nexora-tech.internal",
  },
  {
    code: "NEX-102",
    title: "Añadir validación de email en el formulario de registro",
    description:
      "Actualmente el formulario de registro acepta cualquier texto en el campo email, incluso sin @. Hay que validarlo en el cliente antes de enviar la petición.",
    priority: "MEDIUM",
    type: "FEATURE",
    status: "BACKLOG",
    acceptanceCriteria: [
      "Un email sin '@' muestra un error antes de enviar el formulario.",
      "Un email con formato válido no muestra ningún error.",
      "El mensaje de error es claro y aparece cerca del campo afectado.",
    ],
    reporterEmail: "marcos.ibanez@nexora-tech.internal",
  },
  {
    code: "NEX-103",
    title: "Actualizar las dependencias de ESLint a la última versión",
    description:
      "Las dependencias de ESLint tienen varias versiones de retraso. Actualizarlas y resolver los nuevos warnings que puedan aparecer.",
    priority: "LOW",
    type: "CHORE",
    status: "BACKLOG",
    acceptanceCriteria: [
      "ESLint y sus plugins están en la última versión estable.",
      "`npm run lint` (o equivalente) pasa sin errores nuevos.",
      "Se documenta en el PR cualquier regla que haya cambiado de comportamiento.",
    ],
    reporterEmail: "elena.rios@nexora-tech.internal",
  },
  {
    code: "NEX-104",
    title: "Los usuarios pierden su sesión al refrescar la página",
    description:
      "Varios usuarios reportan que tras refrescar la página (F5), son redirigidos al login aunque su sesión debería seguir activa.",
    priority: "CRITICAL",
    type: "BUG",
    status: "IN_PROGRESS",
    acceptanceCriteria: [
      "Refrescar la página mantiene la sesión activa si el token todavía es válido.",
      "Si el token expiró, se redirige al login de forma clara (sin quedarse en un estado roto).",
      "Se añade al menos un test que reproduzca el escenario original.",
    ],
    reporterEmail: "marcos.ibanez@nexora-tech.internal",
  },
  {
    code: "NEX-105",
    title: 'Mostrar un mensaje de "cargando" en el dashboard',
    description:
      "Mientras se obtienen los datos del dashboard, la pantalla aparece completamente en blanco durante uno o dos segundos, lo cual confunde a los usuarios nuevos.",
    priority: "MEDIUM",
    type: "FEATURE",
    status: "BLOCKED",
    acceptanceCriteria: [
      "Se muestra un indicador de carga mientras los datos se están obteniendo.",
      "El indicador desaparece en cuanto los datos llegan (o si hay un error).",
      "No aparece un parpadeo si la carga es casi instantánea (menos de ~150ms).",
    ],
    reporterEmail: "elena.rios@nexora-tech.internal",
  },
  {
    code: "NEX-106",
    title: "El endpoint /api/users devuelve 500 de forma intermitente",
    description:
      "El endpoint /api/users falla con error 500 aproximadamente 1 de cada 20 peticiones, sin un patrón claro. Investigar la causa raíz.",
    priority: "HIGH",
    type: "INCIDENT",
    status: "CODE_REVIEW",
    acceptanceCriteria: [
      "Se identifica la causa raíz del error intermitente.",
      "El endpoint responde de forma consistente bajo la misma carga que antes fallaba.",
      "Se documenta la causa y la solución en el ticket para referencia futura.",
    ],
    reporterEmail: "marcos.ibanez@nexora-tech.internal",
  },
  {
    code: "NEX-107",
    title: "Escribir tests unitarios para el módulo de autenticación",
    description:
      "El módulo de autenticación (login/registro/refresh) no tiene cobertura de tests. Añadir tests unitarios para los casos principales y los de error.",
    priority: "LOW",
    type: "CHORE",
    status: "QA",
    acceptanceCriteria: [
      "Existen tests para login exitoso y login con credenciales incorrectas.",
      "Existen tests para el registro con datos válidos e inválidos.",
      "Los tests pasan de forma consistente (no son flaky).",
    ],
    reporterEmail: "elena.rios@nexora-tech.internal",
  },
  {
    code: "NEX-108",
    title: "El contador de notificaciones no se actualiza en tiempo real",
    description:
      "Cuando llega una notificación nueva, el contador en la campanita no se actualiza hasta que el usuario recarga la página manualmente.",
    priority: "MEDIUM",
    type: "BUG",
    status: "TODO",
    acceptanceCriteria: [
      "El contador se actualiza automáticamente al recibir una notificación nueva.",
      "El contador nunca muestra un número negativo o inconsistente.",
      "El comportamiento se degrada con gracia si falla la conexión en tiempo real.",
    ],
    reporterEmail: "marcos.ibanez@nexora-tech.internal",
  },
];

interface PullRequestSeed {
  ticketCode: string;
  ticketTitle: string;
  title: string;
  description: string;
  diff: string;
  candidateIssues: { id: string; label: string; isRealIssue: boolean }[];
  authorEmail: string;
}

const PRACTICE_PULL_REQUESTS: PullRequestSeed[] = [
  {
    ticketCode: "REV-201",
    ticketTitle: "Endpoint de login",
    title: "Añadir endpoint de login",
    description:
      "Implementa POST /login: valida credenciales contra la base de datos y devuelve un token.",
    diff: `--- a/src/routes/auth.js
+++ b/src/routes/auth.js
@@ -0,0 +1,15 @@
+const db = require("../db");
+
+async function loginUser(req, res) {
+  const { email, password } = req.body;
+  const query = \`SELECT * FROM users WHERE email = '\${email}' AND password = '\${password}'\`;
+  const result = db.query(query);
+
+  if (result.rows.length === 0) {
+    return res.status(401).json({ error: "Credenciales inválidas" });
+  }
+
+  const user = result.rows[0];
+  const token = generateToken(user.id);
+  res.json({ token });
+}
+
+module.exports = { loginUser };`,
    candidateIssues: [
      {
        id: "a",
        label:
          "El email y la contraseña se concatenan directamente en el SQL: inyección SQL",
        isRealIssue: true,
      },
      {
        id: "b",
        label:
          "Falta un await antes de db.query(query): result sería una Promise, no el resultado real",
        isRealIssue: true,
      },
      {
        id: "c",
        label: "Las contraseñas se comparan en texto plano en vez de contra un hash",
        isRealIssue: true,
      },
      {
        id: "d",
        label: "El nombre de la función loginUser no sigue camelCase",
        isRealIssue: false,
      },
      {
        id: "e",
        label: "Al código le faltan comentarios explicando cada línea",
        isRealIssue: false,
      },
    ],
    authorEmail: "marcos.ibanez@nexora-tech.internal",
  },
  {
    ticketCode: "REV-202",
    ticketTitle: "Optimizar el listado de productos",
    title: "Optimizar el listado de productos con sus reseñas",
    description:
      "Añade las reseñas de cada producto al endpoint de listado de productos.",
    diff: `--- a/src/services/products.js
+++ b/src/services/products.js
@@ -1,10 +1,14 @@
 async function getProductsWithReviews() {
-  const products = await db.query("SELECT * FROM products");
+  const products = await db.query("SELECT * FROM products");
+  for (const product of products) {
+    product.reviews = await db.query(
+      \`SELECT * FROM reviews WHERE product_id = \${product.id}\`
+    );
+  }
   return products;
 }`,
    candidateIssues: [
      {
        id: "a",
        label:
          "Problema N+1: se hace una consulta por cada producto dentro del bucle en vez de un solo JOIN",
        isRealIssue: true,
      },
      {
        id: "b",
        label:
          "product.id se concatena directamente en el SQL, una práctica arriesgada aunque venga de la base de datos",
        isRealIssue: true,
      },
      {
        id: "c",
        label:
          "SELECT * FROM products no tiene paginación: puede devolver una cantidad enorme de filas",
        isRealIssue: true,
      },
      {
        id: "d",
        label: "La función debería ser síncrona en vez de async",
        isRealIssue: false,
      },
      {
        id: "e",
        label: "Los nombres de variable product/products son confusos",
        isRealIssue: false,
      },
    ],
    authorEmail: "elena.rios@nexora-tech.internal",
  },
  {
    ticketCode: "REV-203",
    ticketTitle: "Formulario de contacto",
    title: "Formulario de contacto",
    description:
      "Añade un formulario de contacto simple que envía el mensaje a /api/contact.",
    diff: `--- a/src/components/ContactForm.jsx
+++ b/src/components/ContactForm.jsx
@@ -1,12 +1,20 @@
+function ContactForm() {
+  const [message, setMessage] = useState("");
+
+  function handleSubmit(e) {
+    e.preventDefault();
+    fetch("/api/contact", {
+      method: "POST",
+      body: JSON.stringify({ message }),
+    });
+    setMessage("");
+  }
+
+  return (
+    <form onSubmit={handleSubmit}>
+      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
+      <button type="submit">Enviar</button>
+      <div dangerouslySetInnerHTML={{ __html: message }} />
+    </form>
+  );
+}`,
    candidateIssues: [
      {
        id: "a",
        label:
          "dangerouslySetInnerHTML renderiza el mensaje del usuario como HTML crudo: vulnerabilidad XSS",
        isRealIssue: true,
      },
      {
        id: "b",
        label: "La llamada a fetch no maneja errores (sin .catch ni try/catch)",
        isRealIssue: true,
      },
      {
        id: "c",
        label: "Falta la cabecera Content-Type: application/json en la petición fetch",
        isRealIssue: true,
      },
      {
        id: "d",
        label:
          "useState debería importarse de forma explícita en cada archivo que lo usa",
        isRealIssue: false,
      },
      {
        id: "e",
        label:
          "El formulario debería usar una librería como Formik en vez de estado manual",
        isRealIssue: false,
      },
    ],
    authorEmail: "marcos.ibanez@nexora-tech.internal",
  },
];

export async function seedCompany() {
  const teammateIds = new Map<string, string>();
  for (const t of TEAMMATES) {
    const passwordHash = await bcrypt.hash(`unusable-${randomUUID()}`, 12);
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        username: t.username,
        passwordHash,
        profile: {
          create: { displayName: t.displayName, onboardingCompletedAt: new Date() },
        },
      },
    });
    teammateIds.set(t.email, user.id);
  }

  const now = new Date();
  const startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000);
  const sprint = await prisma.sprint.upsert({
    where: { slug: "sprint-12" },
    update: { startDate, endDate },
    create: {
      slug: "sprint-12",
      name: "Sprint 12",
      goal: "Estabilizar el login, mejorar la experiencia del dashboard y reducir errores intermitentes en producción.",
      startDate,
      endDate,
    },
  });

  for (const t of SPRINT_TICKETS) {
    const reporterId = teammateIds.get(t.reporterEmail);
    if (!reporterId) throw new Error(`Reportero no encontrado: ${t.reporterEmail}`);

    await prisma.ticket.upsert({
      where: { code: t.code },
      update: {
        title: t.title,
        description: t.description,
        priority: t.priority,
        type: t.type,
        status: t.status,
        acceptanceCriteria: t.acceptanceCriteria,
        sprintId: sprint.id,
      },
      create: {
        code: t.code,
        title: t.title,
        description: t.description,
        priority: t.priority,
        type: t.type,
        status: t.status,
        acceptanceCriteria: t.acceptanceCriteria,
        sprintId: sprint.id,
        reporterId,
      },
    });
  }

  let prCount = 0;
  for (const pr of PRACTICE_PULL_REQUESTS) {
    const authorId = teammateIds.get(pr.authorEmail);
    if (!authorId) throw new Error(`Autor no encontrado: ${pr.authorEmail}`);
    const reporterId =
      [...teammateIds.values()].find((id) => id !== authorId) ?? authorId;

    const ticket = await prisma.ticket.upsert({
      where: { code: pr.ticketCode },
      update: { title: pr.ticketTitle },
      create: {
        code: pr.ticketCode,
        title: pr.ticketTitle,
        description: `Ejercicio de práctica de code review: ${pr.ticketTitle}.`,
        priority: "MEDIUM",
        type: "FEATURE",
        status: "CODE_REVIEW",
        acceptanceCriteria: [
          "Este ticket existe solo para anclar el ejercicio de code review.",
        ],
        reporterId,
      },
    });

    const existingPr = await prisma.pullRequest.findFirst({
      where: { ticketId: ticket.id },
    });
    if (existingPr) {
      await prisma.pullRequest.update({
        where: { id: existingPr.id },
        data: {
          title: pr.title,
          description: pr.description,
          diff: pr.diff,
          candidateIssues: pr.candidateIssues,
        },
      });
    } else {
      await prisma.pullRequest.create({
        data: {
          ticketId: ticket.id,
          authorId,
          title: pr.title,
          description: pr.description,
          diff: pr.diff,
          candidateIssues: pr.candidateIssues,
        },
      });
    }
    prCount += 1;
  }

  console.log(
    `  ✔ Simulador de empresa: 2 compañeros, 1 sprint, ${SPRINT_TICKETS.length} tickets, ${prCount} ejercicios de code review`,
  );
}
