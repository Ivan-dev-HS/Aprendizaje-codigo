import type { ModuleSeed } from "./helpers.js";

export const CSS_MODULES: ModuleSeed[] = [
  {
    slug: "fundamentos-de-css",
    title: "Fundamentos de CSS",
    description: "Selectores, el modelo de caja y las propiedades visuales básicas.",
    order: 1,
    lessons: [
      {
        slug: "selectores-y-el-modelo-de-caja",
        title: "Selectores y el modelo de caja",
        summary: "Cómo apuntar a elementos con CSS y cómo se calcula su tamaño real.",
        order: 1,
        estimatedMinutes: 18,
        skillSlug: "css-layout",
        content: [
          {
            type: "theory",
            body: "CSS aplica estilos seleccionando elementos HTML (por etiqueta, clase o id) y asignándoles propiedades. Cada elemento se renderiza como una caja rectangular: contenido, padding, borde y margen.",
          },
          {
            type: "technical",
            title: "box-sizing",
            body: "Por defecto, width solo define el ancho del contenido (content-box): el padding y el borde se SUMAN, agrandando la caja real. Con box-sizing: border-box, width incluye contenido + padding + borde, lo que hace el tamaño mucho más predecible.",
          },
          {
            type: "example",
            language: "css",
            code: "* {\n  box-sizing: border-box;\n}\n\n.tarjeta {\n  width: 300px;\n  padding: 16px;\n  border: 2px solid #ccc;\n  /* con border-box, la caja sigue midiendo 300px de ancho total */\n}",
          },
          {
            type: "common_mistake",
            title: "Elementos que se desbordan sin explicación",
            body: 'Un layout que "se rompe" con elementos desbordando su contenedor es, la mayoría de las veces, un problema de box-sizing por defecto (content-box) combinado con padding. Añadir box-sizing: border-box globalmente es una de las primeras cosas que hace casi cualquier hoja de estilos moderna.',
          },
          {
            type: "challenge",
            title: "Depura esta caja",
            body: "Un div con width: 200px y padding: 20px mide realmente 240px de ancho (200 + 20 + 20). Sin cambiar el width, ¿qué única propiedad puedes añadir para que mida exactamente 200px?",
          },
          {
            type: "real_application",
            body: "Casi todos los frameworks de CSS (Tailwind incluido, que usarás en el frontend de CodeForge) aplican box-sizing: border-box globalmente por esta misma razón.",
          },
        ],
      },
      {
        slug: "colores-tipografia-y-espaciado",
        title: "Colores, tipografía y espaciado",
        summary: "Unidades de medida, color, fuentes y cómo espaciar contenido.",
        order: 2,
        estimatedMinutes: 15,
        skillSlug: "css-layout",
        content: [
          {
            type: "theory",
            body: "CSS ofrece varias unidades: px (píxeles fijos), % (relativo al contenedor), rem (relativo al tamaño de fuente raíz) y vw/vh (relativo al viewport). Elegir la unidad correcta afecta a lo adaptable que es tu diseño.",
          },
          {
            type: "technical",
            title: "rem vs px",
            body: "1rem equivale al font-size del elemento raíz (<html>), normalmente 16px. Usar rem para tipografía y espaciados hace que todo escale si el usuario cambia el tamaño de fuente de su navegador — algo que px ignora.",
          },
          {
            type: "example",
            language: "css",
            code: "html { font-size: 16px; }\n\nh1 {\n  font-size: 2rem;   /* 32px, escala con la preferencia del usuario */\n  color: #1e293b;\n  margin-bottom: 1rem;\n}",
          },
          {
            type: "common_mistake",
            title: "Usar solo px para todo",
            body: 'Un sitio construido enteramente en px ignora las preferencias de accesibilidad del usuario (por ejemplo, alguien que aumenta el tamaño de fuente por defecto del navegador por baja visión). No es un error "visible" en desarrollo, pero es un problema real de accesibilidad.',
          },
          {
            type: "challenge",
            title: "Convierte a rem",
            body: "Convierte estos valores de px a rem (asumiendo 16px = 1rem): 24px, 8px, 40px.",
          },
          {
            type: "real_application",
            body: "Los design systems profesionales (como el que construirás en packages/ui de CodeForge) definen una escala de espaciado en rem para mantener consistencia visual en toda la aplicación.",
          },
        ],
      },
      {
        slug: "flexbox",
        title: "Flexbox",
        summary:
          "Layouts unidimensionales: alinear y distribuir elementos en fila o columna.",
        order: 3,
        estimatedMinutes: 20,
        skillSlug: "flexbox",
        content: [
          {
            type: "theory",
            body: 'Flexbox organiza elementos en una sola dimensión (fila o columna). El contenedor se convierte en "flex" y sus hijos directos se distribuyen según las propiedades que le des al contenedor.',
          },
          {
            type: "technical",
            title: "Los ejes de Flexbox",
            body: "justify-content controla la alineación en el eje principal (horizontal si flex-direction: row). align-items controla la alineación en el eje cruzado (vertical en ese mismo caso). Es la confusión número uno al empezar con Flexbox.",
          },
          {
            type: "example",
            language: "css",
            code: ".barra-navegacion {\n  display: flex;\n  justify-content: space-between; /* separa los extremos */\n  align-items: center;            /* centra verticalmente */\n  gap: 16px;\n}",
            body: "Este patrón (logo a la izquierda, menú a la derecha, todo centrado verticalmente) es el layout de navegación más común de la web.",
          },
          {
            type: "common_mistake",
            title: "Confundir justify-content con align-items",
            body: "Un error clásico: quieres centrar elementos verticalmente y usas justify-content: center sin que funcione, porque tu flex-direction es row y el centrado vertical corresponde a align-items, no a justify-content.",
          },
          {
            type: "challenge",
            title: "Centra una tarjeta",
            body: "Dado un contenedor de 100vh, usa Flexbox para centrar una tarjeta tanto horizontal como verticalmente en el centro exacto de la pantalla. (Pista: necesitas dos propiedades en el contenedor).",
          },
          {
            type: "real_application",
            body: "Cada botón, barra de navegación y tarjeta de esta misma plataforma CodeForge está construida con Flexbox — ábrela con las herramientas de desarrollador y compruébalo.",
          },
        ],
      },
    ],
  },
  {
    slug: "layouts-modernos-y-responsive",
    title: "Layouts modernos y responsive",
    description: "CSS Grid, diseño adaptable y cómo depurar problemas visuales.",
    order: 2,
    lessons: [
      {
        slug: "css-grid",
        title: "CSS Grid",
        summary: "Layouts bidimensionales: filas y columnas al mismo tiempo.",
        order: 1,
        estimatedMinutes: 20,
        skillSlug: "css-grid",
        content: [
          {
            type: "theory",
            body: "Mientras Flexbox trabaja en una dimensión, CSS Grid trabaja en dos a la vez: filas y columnas. Es la herramienta correcta cuando necesitas controlar tanto el eje horizontal como el vertical de un layout.",
          },
          {
            type: "technical",
            title: "grid-template-columns",
            body: "Define cuántas columnas tiene la rejilla y su tamaño. La unidad fr reparte el espacio disponible de forma proporcional, y funciona muy bien combinada con tamaños fijos.",
          },
          {
            type: "example",
            language: "css",
            code: ".dashboard {\n  display: grid;\n  grid-template-columns: 240px 1fr; /* sidebar fija + contenido flexible */\n  gap: 24px;\n}",
            body: "Este es el patrón exacto del layout de un panel de administración con menú lateral, como el que construirás en la Fase 10 (Admin).",
          },
          {
            type: "common_mistake",
            title: "Usar Grid cuando Flexbox basta",
            body: "Para una sola fila de botones, Flexbox es más simple y suficiente. Grid brilla cuando necesitas alinear cosas en dos dimensiones a la vez (piensa en un tablero de ajedrez, no en una fila).",
          },
          {
            type: "challenge",
            title: "Rejilla de tarjetas",
            body: "Crea una rejilla de 3 columnas iguales para mostrar 6 tarjetas de proyecto, con un espacio (gap) de 16px entre ellas. (Pista: grid-template-columns: repeat(3, 1fr)).",
          },
          {
            type: "real_application",
            body: "El catálogo de cursos de esta misma plataforma usa CSS Grid para organizar las tarjetas de curso en una rejilla que se adapta al ancho de la pantalla.",
          },
        ],
      },
      {
        slug: "diseno-responsive-y-media-queries",
        title: "Diseño responsive y media queries",
        summary: "Adaptar el layout a distintos tamaños de pantalla con media queries.",
        order: 2,
        estimatedMinutes: 18,
        skillSlug: "responsive-design",
        content: [
          {
            type: "theory",
            body: "Diseño responsive significa que la misma página se ve y funciona bien en un móvil de 320px de ancho y en un monitor de 1920px. Las media queries permiten aplicar CSS distinto según el tamaño de la pantalla.",
          },
          {
            type: "technical",
            title: "Mobile-first",
            body: "La práctica estándar es escribir primero los estilos para móvil (el caso más restrictivo) y luego usar min-width para añadir/ajustar estilos en pantallas más grandes, en vez de al revés.",
          },
          {
            type: "example",
            language: "css",
            code: ".grid-cursos {\n  display: grid;\n  grid-template-columns: 1fr; /* móvil: una columna */\n}\n\n@media (min-width: 768px) {\n  .grid-cursos {\n    grid-template-columns: repeat(2, 1fr); /* tablet: dos columnas */\n  }\n}\n\n@media (min-width: 1024px) {\n  .grid-cursos {\n    grid-template-columns: repeat(3, 1fr); /* desktop: tres columnas */\n  }\n}",
          },
          {
            type: "common_mistake",
            title: "Probar solo en tu propio monitor",
            body: '"Se ve bien" en un monitor de 1440px no significa nada sobre cómo se ve en 375px (un móvil típico). SPEC.md exige probar en 320/375/768/1024/1280/1440/1920 explícitamente por esta razón: no basta con "verse bien" en un solo tamaño.',
          },
          {
            type: "challenge",
            title: "Menú responsive",
            body: "Diseña (en CSS, sin JavaScript todavía) un menú de navegación horizontal en desktop que, por debajo de 768px, cambie a mostrarse en columna (uno debajo de otro).",
          },
          {
            type: "real_application",
            body: "Antes de dar por terminada cualquier funcionalidad visual en CodeForge, se comprueba en varios anchos de pantalla — es una disciplina profesional, no un detalle opcional.",
          },
        ],
      },
      {
        slug: "errores-comunes-de-css-y-debugging-visual",
        title: "Errores comunes de CSS y debugging visual",
        summary: 'Cómo investigar por qué un estilo "no se aplica" usando las DevTools.',
        order: 3,
        estimatedMinutes: 15,
        skillSlug: "css-layout",
        content: [
          {
            type: "theory",
            body: 'Cuando un estilo "no funciona", casi siempre hay una razón concreta: otra regla con más especificidad lo sobreescribe, hay un error de sintaxis en otra parte de la hoja de estilos, o el selector no coincide con el elemento que crees.',
          },
          {
            type: "technical",
            title: "Especificidad",
            body: "Un selector de ID (#menu) gana a uno de clase (.menu), que gana a uno de etiqueta (nav). !important gana a casi todo — por eso es una señal de alerta cuando aparece en el código: normalmente esconde un problema de especificidad sin resolver correctamente.",
          },
          {
            type: "example",
            language: "css",
            code: "/* Esta regla nunca se aplica: pierde contra el ID */\n.boton { background: blue; }\n#boton-principal { background: red; }",
            body: "Aunque .boton esté escrito después en el archivo, #boton-principal gana porque los selectores de ID tienen más especificidad, independientemente del orden.",
          },
          {
            type: "common_mistake",
            title: "Abusar de !important",
            body: 'Usar !important para "forzar" que un estilo se aplique suele ser un parche, no una solución: esconde el problema real de especificidad y hace el CSS mucho más difícil de mantener a partir de ahí.',
          },
          {
            type: "challenge",
            title: "Diagnostica el bug",
            body: "Un botón tiene la clase .btn-primario con background: blue, pero se ve gris. En las DevTools ves que .btn-primario aparece tachado. ¿Qué investigarías primero?",
          },
          {
            type: "real_application",
            body: "Este es exactamente el tipo de caso que encontrarás en el Debugging Lab (categoría CSS): un síntoma visual, y tienes que usar las DevTools para encontrar la causa real, no adivinar.",
          },
        ],
      },
    ],
  },
];
