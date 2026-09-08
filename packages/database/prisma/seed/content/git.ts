import type { ModuleSeed } from "./helpers.js";

export const GIT_MODULES: ModuleSeed[] = [
  {
    slug: "fundamentos-de-git",
    title: "Fundamentos de Git",
    description: "Working tree, staging area, commits y el historial de un repositorio.",
    order: 1,
    lessons: [
      {
        slug: "working-tree-staging-y-commits",
        title: "Working tree, staging y commits",
        summary: "Los tres estados de Git y cómo se mueve un cambio entre ellos.",
        order: 1,
        estimatedMinutes: 18,
        skillSlug: "git",
        content: [
          {
            type: "theory",
            body: "Git rastrea los cambios de tus archivos en tres áreas: el working tree (tus archivos tal como están ahora mismo), el staging area (los cambios que has marcado para el próximo commit) y el historial de commits (instantáneas guardadas permanentemente).",
          },
          {
            type: "technical",
            title: "El flujo básico",
            body: "git add mueve cambios del working tree al staging area. git commit toma lo que está en staging y lo guarda como una instantánea permanente en el historial, con un mensaje describiendo el cambio.",
          },
          {
            type: "example",
            language: "bash",
            code: 'git status                        # ver qué ha cambiado\ngit add index.html                # mover un archivo a staging\ngit add .                         # mover todos los cambios a staging\ngit commit -m "Añade la página de inicio"',
          },
          {
            type: "common_mistake",
            title: "Commits gigantes con mensajes vagos",
            body: 'git commit -m "cambios" con 40 archivos modificados de funcionalidades distintas hace imposible entender el historial después. Un buen commit agrupa un cambio lógico coherente, con un mensaje que explica el porqué.',
          },
          {
            type: "challenge",
            title: "Simula el flujo",
            body: 'Sin ejecutar nada todavía (lo harás en la Git Lab más adelante), describe en orden los tres comandos que llevarían un archivo nuevo, sin trackear, hasta quedar guardado en el historial con el mensaje "Primer commit".',
          },
          {
            type: "real_application",
            body: "Absolutamente todo el desarrollo de software profesional (incluido este mismo proyecto) usa Git para llevar un historial completo y reversible de cada cambio.",
          },
        ],
      },
      {
        slug: "ramas-y-merge",
        title: "Ramas y merge",
        summary: "Trabajar en paralelo con branches y cómo se combinan de vuelta.",
        order: 2,
        estimatedMinutes: 20,
        skillSlug: "git",
        content: [
          {
            type: "theory",
            body: "Una rama (branch) es una línea de desarrollo independiente. Permite trabajar en una funcionalidad nueva sin afectar al código estable de la rama principal, hasta que esté lista para unirse (merge).",
          },
          {
            type: "technical",
            title: "merge vs conflicto",
            body: "git merge combina los cambios de una rama en otra. Si ambas ramas modificaron las mismas líneas de un archivo de forma distinta, Git no puede decidir por ti: marca un conflicto que debes resolver manualmente.",
          },
          {
            type: "example",
            language: "bash",
            code: "git checkout -b feature/login   # crea y cambia a una rama nueva\n# ... trabajas y haces commits ...\ngit checkout main\ngit merge feature/login          # trae los cambios de vuelta a main",
          },
          {
            type: "common_mistake",
            title: "Trabajar directamente sobre main",
            body: "Hacer commits directamente en la rama principal (main/master) sin pasar por una rama de feature y una Pull Request salta el proceso de Code Review — es una práctica que casi ningún equipo profesional permite, salvo cambios triviales.",
          },
          {
            type: "challenge",
            title: "Resuelve un conflicto mentalmente",
            body: 'Dos ramas modificaron la misma línea de un archivo de configuración: una la puso en "production" y otra en "staging". Git no puede fusionarlo automáticamente. ¿Qué información necesitarías para decidir cuál mantener?',
          },
          {
            type: "real_application",
            body: "La Git Lab de esta plataforma (Fase 5) simula exactamente este flujo — crear ramas, hacer commits, provocar y resolver un conflicto — en un entorno seguro antes de hacerlo con un repositorio real.",
          },
        ],
      },
    ],
  },
  {
    slug: "colaboracion-con-github",
    title: "Colaboración con GitHub",
    description: "Repositorios remotos, Pull Requests y el proceso de Code Review.",
    order: 2,
    lessons: [
      {
        slug: "remotos-push-pull-clone",
        title: "Remotos: push, pull, clone",
        summary: "Cómo sincronizar tu repositorio local con uno alojado en GitHub.",
        order: 1,
        estimatedMinutes: 15,
        skillSlug: "git",
        content: [
          {
            type: "theory",
            body: "Un repositorio remoto es una copia de tu proyecto alojada en un servidor (como GitHub), que permite colaborar con otras personas y tener una copia de seguridad fuera de tu ordenador.",
          },
          {
            type: "technical",
            title: "clone, push, pull",
            body: "git clone descarga un repositorio remoto completo por primera vez. git push envía tus commits locales al remoto. git pull trae los commits nuevos del remoto y los combina con tu copia local.",
          },
          {
            type: "example",
            language: "bash",
            code: "git clone https://github.com/usuario/proyecto.git\ncd proyecto\n# ... haces cambios y commits ...\ngit push origin main\n\n# Otro día, para traer cambios de otras personas:\ngit pull origin main",
          },
          {
            type: "common_mistake",
            title: "Hacer push sin hacer pull antes",
            body: 'Si alguien más subió cambios al remoto mientras tú trabajabas, git push falla ("rejected: non-fast-forward"). La solución casi siempre es git pull primero (para integrar los cambios remotos) y luego intentar el push de nuevo.',
          },
          {
            type: "challenge",
            title: "Ordena el flujo",
            body: "Ordena estos pasos: (a) git push, (b) hacer cambios y git commit, (c) git pull, (d) git clone del repositorio la primera vez.",
          },
          {
            type: "real_application",
            body: "Este es literalmente el flujo que se sigue en este mismo proyecto: cada fase se desarrolla, se hace commit, y se hace push a la rama correspondiente en GitHub.",
          },
        ],
      },
      {
        slug: "pull-requests-y-code-review",
        title: "Pull Requests y Code Review",
        summary: "Cómo proponer cambios formalmente y qué se revisa en un Code Review.",
        order: 2,
        estimatedMinutes: 18,
        skillSlug: "git",
        content: [
          {
            type: "theory",
            body: "Una Pull Request (PR) es una propuesta formal de fusionar los cambios de una rama en otra, con un espacio para que otras personas del equipo los revisen antes de aceptarlos.",
          },
          {
            type: "technical",
            title: "Qué revisa un Code Review",
            body: 'Un Code Review evalúa: ¿el código hace lo que dice? ¿hay bugs o casos no contemplados? ¿sigue las convenciones del proyecto? ¿tiene tests? ¿hay implicaciones de seguridad o rendimiento? No es solo "¿funciona?", es "¿es correcto, seguro y mantenible?".',
          },
          {
            type: "example",
            language: "text",
            code: 'Flujo típico:\n1. git checkout -b feature/nueva-funcionalidad\n2. Commits + git push\n3. Abrir Pull Request en GitHub\n4. Compañeros revisan y comentan\n5. Se corrigen los comentarios ("changes requested")\n6. Se aprueba ("approved")\n7. Se hace merge a main',
          },
          {
            type: "common_mistake",
            title: "Tomarse los comentarios de review como algo personal",
            body: 'Un comentario como "esta función podría simplificarse" es sobre el código, no sobre la persona. La mentalidad profesional (sección 77 de SPEC.md) es: nadie lo sabe todo, y el review es una red de seguridad colectiva, no un examen.',
          },
          {
            type: "challenge",
            title: "Escribe un comentario de review",
            body: "Imagina que revisas un Pull Request donde una función de 80 líneas hace tres cosas distintas mezcladas. Escribe, en tono profesional y constructivo, el comentario que dejarías sugiriendo dividirla.",
          },
          {
            type: "real_application",
            body: "En el simulador de empresa Nexora Tech (Fase 7) practicarás Code Review real: revisarás un Pull Request simulado, dejarás comentarios y compararás tu revisión con la de una persona experta.",
          },
        ],
      },
    ],
  },
];
