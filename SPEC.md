# CODEFORGE — ESPECIFICACIÓN MAESTRA DEL PRODUCTO

> Este documento es la especificación original recibida para el desarrollo de CodeForge. Se conserva íntegra como referencia. Las decisiones técnicas derivadas de esta especificación, así como el estado de implementación, se documentan en `IMPLEMENTATION_PLAN.md`.

## 0. INSTRUCCIÓN PRINCIPAL PARA CLAUDE CODE

Construye una plataforma SaaS educativa completa llamada provisionalmente CodeForge.
El objetivo de CodeForge es convertir a una persona que empieza desde cero en una persona capaz de:

- crear páginas web profesionales;
- desarrollar aplicaciones frontend;
- desarrollar APIs y aplicaciones backend;
- utilizar bases de datos;
- trabajar con Git y GitHub;
- utilizar Linux y terminal;
- detectar y solucionar problemas informáticos;
- depurar código;
- trabajar siguiendo procesos profesionales;
- colaborar mediante tickets, ramas, Pull Requests y Code Reviews;
- desarrollar proyectos reales;
- superar entrevistas técnicas;
- crear un portfolio profesional;
- estar preparada para incorporarse como desarrollador/a junior o perfil técnico junior.

### REGLA FUNDAMENTAL

NO construyas una demo.
NO construyas únicamente una landing page.
NO simules funcionalidades importantes.
NO llenes la aplicación de botones que no hacen nada.
NO dejes las funcionalidades principales como TODO.
Quiero un producto funcional y ejecutable.
Cuando una característica sea demasiado grande, divídela en fases internas y continúa implementándola.
Si falta una decisión técnica, toma tú una decisión profesional razonable y continúa.

## 1. VISIÓN DEL PRODUCTO

CodeForge debe combinar: plataforma educativa, coding platform, laboratorio de debugging, laboratorio de IT Support, simulador de empresa, plataforma de proyectos, sistema de entrevistas, sistema de gamificación, portfolio builder, sistema de evaluación profesional.

La experiencia debe parecer una mezcla conceptual entre: una plataforma de cursos, un coding challenge platform, un IDE, un dashboard SaaS, una plataforma de formación corporativa.

NO copies diseños, marcas ni interfaces propietarias.

## 2. USUARIO OBJETIVO

**Perfil A — Principiante absoluto**: nunca ha programado. Necesita aprender informática básica, lógica, terminal, HTML, CSS, JavaScript.

**Perfil B — Autodidacta**: sabe algo de programación pero tiene conocimientos desordenados. Debe poder realizar una evaluación inicial y saltar contenidos que ya domine.

**Perfil C — Junior**: ya conoce programación. Necesita proyectos, debugging, Git, APIs, testing, arquitectura, simulaciones laborales, entrevistas.

## 3. OBJETIVO EDUCATIVO

Evitar el modelo TEORÍA → TEST → SIGUIENTE LECCIÓN.
Usar: TEORÍA → EJEMPLO → PRÁCTICA GUIADA → EJERCICIO → ERROR → DEBUGGING → PROBLEMA REAL → PROYECTO → SIMULACIÓN LABORAL → ENTREVISTA.

## 4. STACK TECNOLÓGICO

**Frontend**: React, TypeScript, Vite o Next.js, Tailwind CSS, React Router, TanStack Query, Zod, React Hook Form.
**Backend**: Node.js, TypeScript, Express o Fastify.
**Database**: PostgreSQL, Prisma.
**Testing**: Vitest, React Testing Library, Playwright.
**Code editor**: Monaco Editor.
**Infraestructura**: Docker, Docker Compose.
**Calidad**: ESLint, Prettier, Husky, lint-staged.

Si se considera que otra tecnología es mejor, se puede cambiar, documentando la decisión.

## 5. ARQUITECTURA

Arquitectura modular. Separar claramente frontend, backend, database, shared, infrastructure, docs.
Evitar componentes gigantes, lógica de negocio en componentes visuales, SQL repartido, duplicación, dependencias innecesarias.
Separación: UI → hooks/services → API → business logic → repositories → database.

## 6. ESTRUCTURA INICIAL

```
/apps
  /web
  /api
/packages
  /ui
  /config
  /types
  /validators
/prisma
/docs
/scripts
/tests
Dockerfile
docker-compose.yml
package.json
README.md
SPEC.md
```

Se puede modificar si existe una arquitectura mejor.

## 7. AUTENTICACIÓN

Registro, login, logout, sesión persistente, recuperación de contraseña preparada, perfil, roles, protección de rutas.
Roles: USER, ADMIN. Preparar arquitectura para futuros: INSTRUCTOR, MENTOR, COMPANY.
Nunca confiar en el frontend para autorización. Toda autorización importante debe verificarse en backend.

## 8. PERFIL DEL USUARIO

Nombre, avatar, bio, objetivo, nivel, habilidades, proyectos, logros, estadísticas, portfolio, progreso, historial.
"Mi objetivo": Aprender desde cero / Frontend Developer / Backend Developer / Full Stack Developer / IT Support / Prepararme para entrevistas.

## 9. ONBOARDING

Paso 1: "¿Qué experiencia tienes?" (Ninguna/Básica/Intermedia/Avanzada)
Paso 2: "¿Qué quieres conseguir?"
Paso 3: Evaluación inicial.
Paso 4: Generación del roadmap.
Paso 5: Dashboard personalizado.

## 10. ROADMAP

INFORMÁTICA → HTML → CSS → JAVASCRIPT → GIT → TYPESCRIPT → REACT → APIs → BACKEND → DATABASE → TESTING → DOCKER → PROYECTOS → EMPRESA → ENTREVISTA
Cada módulo puede tener dependencias. No permitir avanzar automáticamente cuando existan requisitos importantes sin completar.

## 11. SISTEMA DE SKILLS

HTML Fundamentals, Semantic HTML, CSS Layout, Flexbox, CSS Grid, Responsive Design, JavaScript Fundamentals, DOM, Async JavaScript, APIs, Git, TypeScript, React, Node, Express, SQL, Testing, Docker, Linux, Networking, Debugging, Problem Solving, Communication, Code Review.
Cada skill: nivel, XP, ejercicios, proyectos, fortalezas, debilidades.

## 12. MOTOR EDUCATIVO

Entidades: Course, Module, Lesson, Exercise, ExerciseAttempt, Skill, UserSkill, LearningPath, con relaciones correctas.
Las lecciones pueden contener texto, código, imágenes futuras, ejemplos, preguntas, ejercicios, retos.

## 13. CURSOS

1. Fundamentos de informática, 2. HTML, 3. CSS, 4. JavaScript, 5. Git y GitHub, 6. TypeScript, 7. React, 8. Node.js, 9. APIs REST, 10. SQL/PostgreSQL, 11. Testing, 12. Linux, 13. Docker, 14. Debugging, 15. IT Support, 16. Proyecto Full Stack, 17. Trabajo en empresa, 18. Entrevistas.

## 14. CALIDAD DEL CONTENIDO

Cada concepto importante: explicación sencilla, explicación técnica, ejemplo, error típico, ejercicio, reto, aplicación práctica. No enseñar solo definiciones; mostrar problema, código, resultado, explicación, ejercicio, debugging, aplicación real.

## 15. SISTEMA DE EJERCICIOS

Tipos: MCQ, TRUE_FALSE, CODE_COMPLETION, CODE_WRITING, DEBUGGING, OUTPUT_PREDICTION, ORDERING, MATCHING, SQL, TERMINAL, REAL_CASE, PROJECT_TASK.
Cada ejercicio: id, título, descripción, dificultad, skill, puntos, tiempo estimado, pistas, solución, explicación, tests.

## 16. EJECUCIÓN DE CÓDIGO

Debe ser segura. Nunca ejecutar código arbitrario en el proceso principal del backend. Capa de ejecución aislada: Web Worker (frontend), sandbox, contenedor aislado, proceso limitado, timeout, memory/CPU limits, filesystem temporal. Separar CODE EXECUTION SERVICE de MAIN API.

## 17. CODE EDITOR

Monaco Editor: syntax highlighting, line numbers, autocomplete, errores, tabs, Run/Reset/Save/Submit/Tests/resultado. Lenguajes: HTML, CSS, JavaScript, TypeScript, JSON, SQL.

## 18. HTML/CSS PLAYGROUND

Panel HTML, panel CSS, panel PREVIEW en tiempo real. Reset, ejecutar, guardar, comparar, tests básicos.

## 19. JAVASCRIPT LAB

Ejecutar JS de forma controlada. Mostrar OUTPUT, ERRORS, TESTS.

## 20. SQL LAB

Base de datos aislada. Schema, Tables, Query editor, Execute, Results, Tests. Comprobación automática del resultado esperado.

## 21. TERMINAL LAB

Terminal simulada. Comandos: pwd, ls, cd, mkdir, touch, cp, mv, rm, cat, grep, find, echo, chmod, ps, kill, curl. Entorno virtual controlado con ejercicios.

## 22. GIT LAB

Simulación de Git: working tree, staging, commit, branch, remote. Ejercicios: crear rama, commit, merge, conflictos, revert, cherry-pick, pull, push. Historial visual.

## 23. DEBUGGING LAB

`/debugging`. Categorías: HTML, CSS, JavaScript, React, Node, SQL, API, Git, Linux. Cada problema: SYMPTOMS, ENVIRONMENT, CODE, LOGS, EXPECTED, ACTUAL.

## 24. SISTEMA DE PISTAS

Pista 1, Pista 2, Pista 3, Solución. Penalizaciones opcionales de XP. Nunca mostrar la solución al primer error.

## 25. CASOS REALES DE IT SUPPORT

`/it-support`. Categorías: Hardware, Windows, Linux, Networking, Software, Security, Printers, Accounts, Performance. Herramientas simuladas: Task Manager, Event Viewer, Device Manager, Network tools, Disk tools.

## 26. CASOS DE NETWORKING

DNS, DHCP, IP, gateway, subnet, ping, traceroute, HTTP, HTTPS, puertos.

## 27. SIMULADOR DE PRODUCCIÓN

`/production`. Problemas: 500s, connection pool agotado, CORS, funciona local no en producción, sin memoria, variable de entorno faltante. Usar logs, métricas, código, configuración.

## 28. SIMULADOR DE EMPRESA

Empresa ficticia "NEXORA TECH". El usuario es Junior Developer. Dashboard: My tickets, Sprint, Pull Requests, Reviews, Team, Notifications.

## 29. SISTEMA DE TICKETS

ID, Título, Descripción, Prioridad, Tipo, Reporter, Acceptance Criteria, Comments, Attachments (preparado), Status.
Estados: BACKLOG, TODO, IN_PROGRESS, BLOCKED, CODE_REVIEW, QA, DONE.

## 30. SPRINTS

Objetivo, tickets, progreso, tareas, tiempo, bloqueos.

## 31. DAILY STANDUP SIMULADO

"¿Qué hiciste ayer?" / "¿Qué harás hoy?" / "¿Tienes algún bloqueo?" — evaluar calidad de comunicación.

## 32. CODE REVIEW

Simular compañeros. Mostrar Pull Request. Revisar bugs, seguridad, naming, arquitectura, rendimiento, tests. Comentarios y comparación con revisión experta.

## 33. PULL REQUEST

Branch → Code → Tests → Commit → Push → Pull Request → Code Review → Changes requested → Approved → Merge.

## 34. PROYECTOS

Nivel 1 Portfolio, Nivel 2 Landing page, Nivel 3 To-do, Nivel 4 Dashboard, Nivel 5 Aplicación API, Nivel 6 E-commerce, Nivel 7 Full Stack, Nivel 8 SaaS.
Cada proyecto: Brief, Requirements, User stories, Acceptance criteria, Tasks, Tests, Bonus.

## 35. PROJECT BUILDER

Nombre, descripción, tecnologías, screenshots, GitHub URL, demo URL, README → alimenta el portfolio.

## 36. PORTFOLIO BUILDER

`/portfolio/:username`: nombre, bio, skills, proyectos, GitHub, logros, formación. SEO básico.

## 37. CV BUILDER

Información, resumen, experiencia, formación, skills, proyectos, enlaces. Exportación PDF.

## 38. ENTREVISTAS

`/interviews`. Categorías: Technical, Behavioral, Frontend, Backend, Full Stack, IT Support. Preguntas dinámicas.

## 39. SIMULACIÓN DE ENTREVISTA

30 minutos, conjunto de preguntas. Evaluar conocimientos, precisión, comunicación, debugging, razonamiento.
Resultado: Technical Score, Problem Solving, Communication, Confidence, Overall.

## 40. BANCO DE PREGUNTAS

Dificultad, skill, respuesta esperada, conceptos, explicación, errores frecuentes. Seeds suficientes desde el primer arranque.

## 41-43. GAMIFICACIÓN / XP

XP, niveles, rachas, badges, achievements, missions, daily/weekly challenge. Ejemplo de XP: lección +10, ejercicio fácil +10, medio +25, difícil +50, proyecto +500, entrevista +300. No permitir explotar XP repitiendo infinitamente el mismo ejercicio.

## 44. EVALUACIÓN

Score: KNOWLEDGE, PRACTICE, DEBUGGING, PROJECTS, GIT, COMMUNICATION, INTERVIEW.
Professional Readiness Score 0–100, descrito como "indicador interno de preparación", nunca como garantía de empleabilidad.

## 45. DASHBOARD

Nivel, XP, Streak, Readiness, Continue learning, Weak skills, Current project, Company simulation, Interview preparation, Recent activity.

## 46. ADMIN

`/admin`. CRUD: Courses, Modules, Lessons, Exercises, Projects, Tickets, Interview Questions, Skills, Achievements, Users. Filtros, búsqueda, paginación, validación.

## 47. ANALYTICS

Usuarios activos, ejercicios completados, cursos populares, ejercicios con mayor tasa de fallo, skills débiles, tiempo medio, retención.

## 48. NOTIFICACIONES

Tipos: achievement, course, ticket, review, system. Preparar arquitectura para email futuro.

## 49-52. UX/PERFORMANCE

Dark mode real con persistencia y detección de preferencia del sistema. Accesibilidad (keyboard nav, focus states, semantic HTML, labels, ARIA, contraste, reduced motion). Responsive en 320/375/768/1024/1280/1440/1920. Performance: lazy loading, code splitting, caching, pagination, queries optimizadas, índices.

## 53-55. SEGURIDAD / LOGGING / ERRORES

Password hashing, validation, rate limiting, CORS, cookies seguras, sanitización, autorización, protección SQL injection/XSS/CSRF, headers seguros, secrets vía env vars. Logging estructurado sin secretos. Manejo de errores con loading/empty/error/retry en frontend y error middleware con códigos HTTP apropiados en backend, sin stack traces en producción.

## 56. DATABASE

Entidades mínimas: User, Profile, Role, Course, Module, Lesson, Exercise, ExerciseAttempt, Skill, UserSkill, LearningPath, Project, ProjectTask, ProjectProgress, Ticket, Sprint, PullRequest, CodeReview, Achievement, UserAchievement, Mission, Interview, InterviewQuestion, InterviewAttempt, Portfolio, Resume, Notification, ProgressEvent. Relaciones e índices apropiados.

## 57. SEEDS

Usuario demo, admin demo, cursos, módulos, lecciones, ejercicios, skills, proyectos, tickets, entrevistas, achievements. Nunca credenciales reales.

## 58-59. API

REST clara (rutas de ejemplo listadas en el original), admin endpoints separados, documentación OpenAPI/Swagger.

## 60-61. TESTING / CI

Unit (XP, progress, scoring, validation), Integration (auth, exercises, database, projects), E2E (register, login, course, exercise, progress, project, interview, admin). GitHub Actions: Install → Lint → Typecheck → Unit → Integration → Build → E2E.

## 62-64. DOCKER / ENV / DOCS

Docker Compose (web, api, postgres) con health checks. `.env.example` documentado sin secretos reales. README, ARCHITECTURE, SECURITY, CONTRIBUTING, API, DATABASE, DEPLOYMENT.

## 65-67. DESIGN SYSTEM

Componentes reutilizables (Button, Input, Select, Modal, Card, Badge, Tabs, Tooltip, Dropdown, Toast, Progress, Avatar, Table, Pagination, CodeEditor, Terminal, ExerciseCard, SkillCard, ProjectCard, TicketCard). Visual moderno, profesional, tecnológico, limpio. Microinteracciones moderadas.

## 68-71. CONTENIDO INICIAL / APRENDIZAJE ADAPTATIVO

Cantidades mínimas de ejercicios/casos por área (ver original). No preguntas triviales. Adaptativo: 3 fallos → skill "weak" → recomendaciones. Maestría por skill 0–100 combinando ejercicios, debugging, proyectos, repetición.

## 72-78. PROYECTO FINAL / SIMULACIÓN LABORAL / INCIDENTES / SOFT SKILLS

Proyecto final con brief empresarial completo. Simulación laboral de 8 semanas con informe final. Incident response P0–P3 con postmortem. Soft skills y mentalidad profesional como contenido evaluable.

## 79-84. BÚSQUEDA / FILTROS / GUARDADO / I18N / PRIVACIDAD

Búsqueda global, filtros, guardado de progreso robusto, arquitectura preparada para offline/PWA e i18n (es inicial, en preparado), privacidad y eliminación de cuenta.

## 85-89. ADMIN SECURITY / FEATURE FLAGS / IA FUTURA / OBSERVABILIDAD

AuditLog para acciones administrativas. Feature flags simples. Interfaz `AiProvider` con mock (explainConcept, reviewCode, generateHint, simulateInterview, generateExercise). Health endpoint (`GET /health`) comprobando API y DB.

## 90-101. CALIDAD / PROCESO

Lint, typecheck, tests y build deben pasar. No mockear autenticación, progreso, database, ejercicios, proyectos, tickets, entrevistas. UX de error humano con reintento. Loading/empty states en toda operación async relevante. Migrations reproducibles, seed idempotente, índices en columnas clave, paginación. Code labs con timeout, memory/CPU limits, aislamiento de filesystem/red, cleanup, límite de output.

## 102-105. CONTENT MODEL / VERSIONADO / ANALYTICS EVENTS

Contenido educativo estructurado en base de datos, no hardcodeado en componentes. `contentVersion` en ejercicios/lecciones. Eventos: lesson_started/completed, exercise_started/completed/failed, project_started/completed, ticket_started/completed, interview_started/completed, skill_mastered.

## 106-112. PRINCIPIOS DE INGENIERÍA

No implementar de forma insegura lo que no puede hacerse seguro: implementar versión mínima segura y documentar evolución. No sobreingenierizar (monolito modular preferible; ejecución de código como servicio aislado). Roadmap MVP → Beta → Production. Prioridades: 1) funcionalidad real, 2) experiencia educativa, 3) seguridad, 4) calidad de código, 5) UX, 6) escalabilidad, 7) contenido.

## 113-115. PROCESO Y RESULTADO ESPERADO

Antes de programar: analizar SPEC.md, definir arquitectura/DB/API/estructura/estrategia de ejecución segura/fases, crear `IMPLEMENTATION_PLAN.md`, y **usarlo para implementar el producto**, no solo para describirlo. Autonomía: tomar decisiones razonables sin preguntar por cada detalle, documentarlas y continuar. Resultado esperado: repositorio clonable y ejecutable con frontend, API, PostgreSQL, migrations, seeds, autenticación, sistema educativo, ejercicios, laboratorios, proyectos, simulador de empresa, entrevistas, gamificación, portfolio, admin, tests y documentación, mostrando contenido real desde la primera ejecución.
