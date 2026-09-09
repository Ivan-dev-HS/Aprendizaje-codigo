# Backlog de contenido educativo

Ver decisión de alcance en `IMPLEMENTATION_PLAN.md §3`. Este documento se mantiene
actualizado en cada fase con el estado real del contenido — nunca se presenta un
curso como completo si no lo está.

Leyenda: ✅ completo (cumple o supera el mínimo de SPEC.md §68 con contenido de 7
partes por concepto) · 🟡 real pero por debajo del mínimo (módulo/lección genuina,
con las 6 partes de la sección 14, no placeholder) · ⬜ solo el registro del curso,
sin módulos/lecciones todavía.

| Curso (SPEC.md §13)           | Estado | Módulos | Lecciones | Notas                                                                                       |
| ----------------------------- | ------ | ------- | --------- | ------------------------------------------------------------------------------------------- |
| 1. Fundamentos de informática | 🟡     | 2       | 4         | Hardware/software, archivos, lógica, cómo funciona la web                                   |
| 2. HTML                       | 🟡     | 2       | 6         | Estructura, texto/enlaces/imágenes, listas/tablas, semántica, formularios, buenas prácticas |
| 3. CSS                        | 🟡     | 2       | 6         | Selectores/box model, tipografía, Flexbox, Grid, responsive, debugging visual               |
| 4. JavaScript                 | 🟡     | 3       | 9         | Fundamentos, DOM/eventos/formularios, asincronía/fetch                                      |
| 5. Git y GitHub               | 🟡     | 2       | 4         | Working tree/staging/commits, ramas/merge, remotos, PRs/Code Review                         |
| 6. TypeScript                 | ⬜     | 0       | 0         | Pendiente                                                                                   |
| 7. React                      | ⬜     | 0       | 0         | Pendiente                                                                                   |
| 8. Node.js                    | ⬜     | 0       | 0         | Pendiente                                                                                   |
| 9. APIs REST                  | ⬜     | 0       | 0         | Pendiente                                                                                   |
| 10. SQL/PostgreSQL            | ⬜     | 0       | 0         | Pendiente                                                                                   |
| 11. Testing                   | ⬜     | 0       | 0         | Pendiente                                                                                   |
| 12. Linux                     | ⬜     | 0       | 0         | Pendiente                                                                                   |
| 13. Docker                    | ⬜     | 0       | 0         | Pendiente                                                                                   |
| 14. Debugging                 | ⬜     | 0       | 0         | Ver también tabla de Casos abajo (Fase 7)                                                   |
| 15. IT Support                | ⬜     | 0       | 0         | Ver también tabla de Casos abajo (Fase 7)                                                   |
| 16. Proyecto Full Stack       | ⬜     | 0       | 0         | Pendiente                                                                                   |
| 17. Trabajo en empresa        | ⬜     | 0       | 0         | Ver simulador Nexora Tech (Fase 7)                                                          |
| 18. Entrevistas               | ⬜     | 0       | 0         | Ver banco de preguntas (Fase 8)                                                             |

Cada una de las 29 lecciones sembradas sigue el modelo pedagógico completo de la
sección 14 de SPEC.md: `theory` (explicación sencilla), `technical` (explicación
técnica), `example` (código real), `common_mistake` (error típico), `challenge`
(reto) y `real_application` (aplicación práctica) — ver
`packages/database/prisma/seed/content/*.ts`.

| Laboratorio / caso real      | Mínimo SPEC.md     | Estado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Debugging Lab                | 40 casos           | 🟡 4 casos reales (HTML, CSS, JavaScript, Git), diagnóstico de opción múltiple con distractores plausibles, opciones desordenadas al servir (nunca la misma posición dos veces)                                                                                                                                                                                                                                                                                                                                                                         |
| IT Support                   | 40 casos           | 🟡 4 casos reales (Hardware, Windows, Networking, Cuentas)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Networking                   | 25 casos           | 🟡 3 casos reales (DNS, gateway/subred, firewall/puertos)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Producción                   | —                  | 🟡 3 incidentes reales (variable de entorno faltante, pool de conexiones agotado, CORS mal configurado — los 3 ejemplos de la sección 27 de SPEC.md), con postmortem estructurado (no autocorregido: es reflexión, no hay una única respuesta correcta)                                                                                                                                                                                                                                                                                                 |
| Empresa (tickets)            | 20 tickets         | 🟡 8 tickets reales en 1 sprint activo, repartidos por todo el pipeline (Backlog→Done), tablero compartido entre usuarios (no hay copia privada). 3 ejercicios de code review reales (inyección SQL + contraseñas en texto plano, problema N+1, XSS)                                                                                                                                                                                                                                                                                                    |
| Entrevistas (preguntas)      | 100 preguntas      | ⬜ Pendiente de Fase 8                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Ejercicios (todos los tipos) | Cientos, por skill | 🟡 22 ejercicios reales (HTML 5, CSS 5, JavaScript 7, Git 5) cubriendo los 7 tipos con motor de corrección propio: MCQ, TRUE_FALSE, ORDERING, MATCHING, OUTPUT_PREDICTION, CODE_COMPLETION, DEBUGGING. CODE_WRITING/SQL/TERMINAL/REAL_CASE/PROJECT_TASK existen en el esquema; el exec-service que necesitarían ya existe desde la Fase 5, pero extender `ExercisePrompt`/`ExerciseAnswer` y autorar contenido gradable para esos tipos queda pendiente (no se siembran ejercicios de esos tipos todavía para no presentar contenido a medio funcionar) |

### Labs interactivos (Fase 5 — sección 111: editor de código, playground, JS/SQL/Terminal/Git Lab)

Los labs son herramientas de práctica independientes (no ejercicios gradables con XP):
son 100% funcionales, no maquetas. `docs/SECURITY.md` detalla el aislamiento de cada uno.

| Lab                    | Estado | Notas                                                                                                                                                                      |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playground HTML/CSS/JS | ✅     | Monaco Editor self-hosted, preview en vivo (`<iframe sandbox>`), snapshots persistentes por usuario (CRUD real).                                                           |
| JavaScript Lab         | ✅     | Ejecuta código real en `apps/exec-service` (worker_thread + `vm`, timeout y límite de memoria reales).                                                                     |
| SQL Lab                | ✅     | 1 dataset real sembrado ("Tienda online": 8 clientes, 15 pedidos). Ejecuta `SELECT` reales contra el rol de solo lectura `codeforge_sandbox`. Más datasets es backlog.     |
| Terminal Lab           | ✅     | Sistema de archivos virtual real (`pwd/ls/cd/mkdir/touch/cat/echo/rm/cp/mv/whoami/help`), estado persistente por usuario. No es un shell real (por diseño, ver seguridad). |
| Git Lab                | ✅     | Grafo de commits simulado real (`init/status/add/commit/log/branch/checkout/merge`), estado persistente por usuario. No envuelve el binario `git` (por diseño).            |

### Proyectos, Portfolio y CV (Fase 6 — secciones 34-37)

| Elemento              | Estado | Notas                                                                                                                                                                                                                                                                                        |
| --------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catálogo de proyectos | 🟡     | 3 proyectos reales sembrados (uno por franja: L1 Portfolio personal, L3 Lista de tareas, L5 Cliente de una API de clima), cada uno con brief/requirements/user stories/acceptance criteria/tasks/bonus reales. Faltan L2/L4/L6/L7/L8 — mismo criterio de alcance que el resto del contenido. |
| Project Builder       | ✅     | githubUrl/demoUrl/readme/screenshots/technologies por usuario y proyecto, alimenta directamente el portfolio y el CV.                                                                                                                                                                        |
| Portfolio Builder     | ✅     | `/portfolio/:username` se compone en vivo (perfil, skills con mastery ≥40, proyectos completados, formación/enlaces del CV) — privado por defecto, publicable por el dueño. Sin logros todavía (llegan en la Fase 9, se sumarán a la composición entonces, nunca simulados mientras tanto).  |
| CV Builder            | ✅     | Resumen/experiencia/educación/enlaces editables + skills/proyectos reales derivados. Exportación a PDF vía impresión nativa del navegador (`window.print()` + CSS de impresión), sin librerías nuevas.                                                                                       |
