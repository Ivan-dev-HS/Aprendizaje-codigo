import { prisma } from "../../src/client.js";

/**
 * Sección 34 de SPEC.md: 8 niveles de proyecto (L1 Portfolio → L8 SaaS). Se
 * siembran 3 proyectos reales y completos (uno por franja de dificultad:
 * principiante/intermedio/avanzado) en vez de los 8, siguiendo la misma
 * decisión de alcance que el resto del contenido (ver
 * `docs/CONTENT_BACKLOG.md` y `IMPLEMENTATION_PLAN.md §3): cada uno con
 * brief/requirements/user stories/acceptance criteria/tasks/bonus reales, no
 * plantillas vacías.
 */
interface ProjectSeed {
  slug: string;
  title: string;
  level:
    | "L1_PORTFOLIO"
    | "L2_LANDING"
    | "L3_TODO"
    | "L4_DASHBOARD"
    | "L5_API_APP"
    | "L6_ECOMMERCE"
    | "L7_FULL_STACK"
    | "L8_SAAS";
  brief: string;
  estimatedHours: number;
  requirements: string[];
  userStories: string[];
  acceptanceCriteria: string[];
  bonusIdeas: string[];
  tasks: { title: string; description: string }[];
}

const PROJECTS: ProjectSeed[] = [
  {
    slug: "portfolio-personal",
    title: "Portfolio personal",
    level: "L1_PORTFOLIO",
    brief:
      "Construye tu propio sitio de portfolio con HTML y CSS puros: una página que te presente a ti, tus proyectos y cómo contactarte. Es el primer proyecto real que podrás enseñar a otras personas.",
    estimatedHours: 6,
    requirements: [
      "Estructura semántica: header, nav, main con secciones, footer.",
      "Sección 'Sobre mí' con una foto o avatar y una biografía corta.",
      "Sección 'Proyectos' con al menos 3 tarjetas (aunque sean ficticias por ahora).",
      "Sección 'Contacto' con enlaces reales a email/GitHub/LinkedIn.",
      "Diseño responsive: debe verse bien en móvil (320px) y escritorio.",
      "Sin frameworks CSS: solo HTML y CSS escritos por ti (Flexbox y/o Grid).",
    ],
    userStories: [
      "Como visitante, quiero ver rápidamente quién es esta persona y a qué se dedica.",
      "Como visitante, quiero poder navegar entre secciones sin recargar la página.",
      "Como visitante, quiero poder contactar a la persona con un clic (email o redes).",
      "Como dueño del portfolio, quiero poder añadir un nuevo proyecto editando solo el HTML.",
    ],
    acceptanceCriteria: [
      "Dado un ancho de pantalla de 320px, el contenido no produce scroll horizontal.",
      "Dado un lector de pantalla, cada imagen tiene un atributo alt descriptivo.",
      "Dado un clic en el enlace de email, se abre el cliente de correo con la dirección correcta (mailto:).",
      "Dado el HTML, pasa una validación básica (etiquetas cerradas, sin anidamiento inválido).",
      "Dado el CSS, no hay una sola regla con !important (señal de que el layout está bien pensado).",
    ],
    bonusIdeas: [
      "Modo oscuro con una media query prefers-color-scheme.",
      "Animación sutil al hacer scroll (CSS puro, sin JS).",
      "Formulario de contacto (aunque no envíe datos todavía) con validación HTML5.",
    ],
    tasks: [
      {
        title: "Maquetar la estructura semántica base",
        description: "header/nav/main/footer sin estilos todavía.",
      },
      { title: "Sección 'Sobre mí'", description: "Foto/avatar + biografía corta." },
      {
        title: "Sección 'Proyectos'",
        description: "Al menos 3 tarjetas con título, descripción y enlace.",
      },
      {
        title: "Sección 'Contacto'",
        description: "Enlaces reales a email/GitHub/LinkedIn.",
      },
      {
        title: "Responsive con Flexbox/Grid",
        description: "Layout fluido desde 320px hasta escritorio.",
      },
      {
        title: "Revisión de accesibilidad",
        description: "alt en imágenes, contraste de color, orden de foco.",
      },
    ],
  },
  {
    slug: "lista-de-tareas",
    title: "Lista de tareas (To-Do)",
    level: "L3_TODO",
    brief:
      "Una aplicación de lista de tareas con JavaScript puro: añadir, completar, editar, borrar y filtrar tareas, con persistencia en localStorage para que no se pierdan al recargar la página.",
    estimatedHours: 10,
    requirements: [
      "Añadir una tarea nueva desde un formulario (input + botón o Enter).",
      "Marcar una tarea como completada (checkbox o clic).",
      "Editar el texto de una tarea existente.",
      "Borrar una tarea.",
      "Filtrar por: todas / activas / completadas.",
      "Persistir el estado en localStorage: al recargar, las tareas siguen ahí.",
      "Mostrar un contador de tareas pendientes.",
    ],
    userStories: [
      "Como usuario, quiero añadir una tarea escribiendo y pulsando Enter.",
      "Como usuario, quiero marcar una tarea como hecha sin perderla de la lista.",
      "Como usuario, quiero filtrar para ver solo lo que me falta por hacer.",
      "Como usuario, quiero que mis tareas sigan ahí si cierro y vuelvo a abrir el navegador.",
    ],
    acceptanceCriteria: [
      "Dado el input vacío, pulsar Enter no añade una tarea en blanco.",
      "Dado que marco una tarea como completada, su estilo cambia (p. ej. tachado) y el contador de pendientes baja en 1.",
      "Dado que recargo la página, las tareas y su estado (completada o no) se mantienen igual.",
      "Dado el filtro 'Activas', solo se muestran las tareas no completadas.",
      "Dado que borro una tarea, desaparece de la lista y de localStorage.",
    ],
    bonusIdeas: [
      "Arrastrar y soltar para reordenar tareas.",
      "Categorías o etiquetas de color por tarea.",
      "Botón 'Borrar completadas' para limpiar de golpe.",
    ],
    tasks: [
      {
        title: "Maquetar la UI base",
        description: "Input, lista vacía, contador, botones de filtro.",
      },
      {
        title: "Añadir tareas",
        description: "Formulario controlado, validación de input vacío.",
      },
      {
        title: "Marcar como completada",
        description: "Toggle de estado + estilo visual.",
      },
      {
        title: "Editar y borrar",
        description: "Edición inline o modal, borrado con confirmación.",
      },
      {
        title: "Filtros (todas/activas/completadas)",
        description: "Renderizado condicional según el filtro activo.",
      },
      {
        title: "Persistencia en localStorage",
        description: "Guardar en cada cambio, cargar al iniciar.",
      },
      {
        title: "Contador de pendientes",
        description: "Se actualiza en tiempo real con cada cambio.",
      },
    ],
  },
  {
    slug: "cliente-api-clima",
    title: "Cliente de una API pública (clima)",
    level: "L5_API_APP",
    brief:
      "Una aplicación que consulta una API REST pública del clima: el usuario busca una ciudad, la app hace fetch, maneja estados de carga/error, y muestra el resultado con una UI clara. Es tu primer proyecto conectado a datos reales del mundo exterior.",
    estimatedHours: 14,
    requirements: [
      "Formulario de búsqueda por nombre de ciudad.",
      "Petición fetch (o axios) a una API REST pública, de forma asíncrona (async/await).",
      "Estado de carga visible mientras la petición está en curso.",
      "Manejo de errores: ciudad no encontrada, fallo de red, respuesta inesperada.",
      "Mostrar los datos relevantes (temperatura, descripción, ciudad) de forma clara.",
      "Historial de las últimas 5 búsquedas (en memoria o localStorage).",
      "El código de acceso a la API está separado de la lógica de UI (no todo en un solo archivo/función).",
    ],
    userStories: [
      "Como usuario, quiero buscar una ciudad y ver su clima actual en segundos.",
      "Como usuario, quiero saber si algo está cargando en vez de ver una pantalla en blanco.",
      "Como usuario, quiero un mensaje claro si escribo mal el nombre de una ciudad.",
      "Como usuario, quiero ver rápidamente qué busqué antes sin tener que volver a escribirlo.",
    ],
    acceptanceCriteria: [
      "Dado un nombre de ciudad válido, se muestra su temperatura y descripción en menos de unos segundos.",
      "Dado un nombre de ciudad inexistente, se muestra un mensaje de error legible (no un error técnico crudo).",
      "Dado que la petición está en curso, se muestra un indicador de carga y el botón de búsqueda se deshabilita.",
      "Dado que la red falla, la app no se queda colgada: muestra un error y permite reintentar.",
      "Dado que busco 6 ciudades distintas, el historial solo conserva las últimas 5.",
    ],
    bonusIdeas: [
      "Guardar una ciudad 'favorita' que se carga automáticamente al abrir la app.",
      "Cambiar entre unidades Celsius/Fahrenheit.",
      "Mostrar un icono distinto según la condición climática (soleado/nublado/lluvia).",
    ],
    tasks: [
      {
        title: "Maquetar el formulario de búsqueda y el layout de resultado",
        description: "Input + botón + zona de resultado vacía.",
      },
      {
        title: "Módulo de acceso a la API",
        description:
          "Función separada que hace el fetch y devuelve datos ya normalizados.",
      },
      {
        title: "Estado de carga",
        description: "Spinner o mensaje mientras la petición está pendiente.",
      },
      {
        title: "Manejo de errores",
        description: "Ciudad no encontrada, fallo de red, timeout.",
      },
      {
        title: "Renderizar el resultado",
        description: "Temperatura, descripción, nombre de ciudad.",
      },
      {
        title: "Historial de búsquedas",
        description: "Guardar las últimas 5, mostrarlas como accesos rápidos.",
      },
      {
        title: "Refactor: separar UI de lógica de datos",
        description: "El módulo de API no debe tocar el DOM directamente.",
      },
    ],
  },
];

export async function seedProjects() {
  for (const p of PROJECTS) {
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        level: p.level,
        brief: p.brief,
        estimatedHours: p.estimatedHours,
        requirements: p.requirements,
        userStories: p.userStories,
        acceptanceCriteria: p.acceptanceCriteria,
        bonusIdeas: p.bonusIdeas,
      },
      create: {
        slug: p.slug,
        title: p.title,
        level: p.level,
        brief: p.brief,
        estimatedHours: p.estimatedHours,
        requirements: p.requirements,
        userStories: p.userStories,
        acceptanceCriteria: p.acceptanceCriteria,
        bonusIdeas: p.bonusIdeas,
      },
    });

    for (const [index, task] of p.tasks.entries()) {
      const existing = await prisma.projectTask.findFirst({
        where: { projectId: project.id, order: index },
      });
      if (existing) {
        await prisma.projectTask.update({
          where: { id: existing.id },
          data: { title: task.title, description: task.description },
        });
      } else {
        await prisma.projectTask.create({
          data: {
            projectId: project.id,
            title: task.title,
            description: task.description,
            order: index,
          },
        });
      }
    }
  }

  console.log(`  ✔ ${PROJECTS.length} proyectos reales (L1/L3/L5) con sus tareas`);
}
