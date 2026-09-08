import type { ModuleSeed } from "./helpers.js";

export const HTML_MODULES: ModuleSeed[] = [
  {
    slug: "fundamentos-de-html",
    title: "Fundamentos de HTML",
    description: "La estructura básica de cualquier página web.",
    order: 1,
    lessons: [
      {
        slug: "estructura-de-un-documento-html",
        title: "Estructura de un documento HTML",
        summary: "Las etiquetas mínimas de todo documento HTML y qué hace cada una.",
        order: 1,
        estimatedMinutes: 15,
        skillSlug: "html-fundamentals",
        content: [
          {
            type: "theory",
            body: 'HTML (HyperText Markup Language) describe la estructura de una página usando etiquetas. Cada etiqueta tiene un propósito: decirle al navegador "esto es un párrafo", "esto es un título", etc.',
          },
          {
            type: "technical",
            title: "El esqueleto mínimo",
            body: "<!DOCTYPE html> le dice al navegador qué versión de HTML usar. <html> envuelve todo el documento. <head> contiene metadatos (no se ve en la página). <body> contiene el contenido visible.",
          },
          {
            type: "example",
            language: "html",
            code: '<!DOCTYPE html>\n<html lang="es">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Mi primera página</title>\n  </head>\n  <body>\n    <h1>Hola, mundo</h1>\n    <p>Esta es mi primera página web.</p>\n  </body>\n</html>',
            body: "Guarda esto como index.html y ábrelo con tu navegador: ya tienes una página web real.",
          },
          {
            type: "common_mistake",
            title: "Olvidar cerrar etiquetas",
            body: '<p>Este párrafo sin cerrar puede romper el resto del documento. Cada etiqueta de apertura (<p>) necesita su etiqueta de cierre (</p>), salvo las etiquetas "vacías" como <img> o <br>.',
          },
          {
            type: "challenge",
            title: "Tu primera página",
            body: "Crea un archivo HTML con un título (<h1>), dos párrafos y tu nombre. Ábrelo en el navegador y comprueba que se ve como esperas.",
          },
          {
            type: "real_application",
            body: "Todo sitio web que has visitado en tu vida parte de este mismo esqueleto — desde una landing page sencilla hasta aplicaciones como Gmail.",
          },
        ],
      },
      {
        slug: "texto-enlaces-e-imagenes",
        title: "Texto, enlaces e imágenes",
        summary: "Etiquetas de texto, cómo enlazar páginas y cómo insertar imágenes.",
        order: 2,
        estimatedMinutes: 15,
        skillSlug: "html-fundamentals",
        content: [
          {
            type: "theory",
            body: "Además de párrafos y títulos (h1 a h6), HTML tiene etiquetas para énfasis (<strong>, <em>), enlaces (<a>) e imágenes (<img>).",
          },
          {
            type: "technical",
            title: "Atributos",
            body: "Un enlace necesita el atributo href (a dónde va). Una imagen necesita src (de dónde viene) y alt (texto alternativo, esencial para accesibilidad y SEO).",
          },
          {
            type: "example",
            language: "html",
            code: '<a href="https://developer.mozilla.org">Documentación de MDN</a>\n<img src="./gato.jpg" alt="Un gato naranja durmiendo en un sofá" />',
            body: "El texto alt se lee en voz alta por lectores de pantalla y se muestra si la imagen no carga.",
          },
          {
            type: "common_mistake",
            title: "Imágenes sin atributo alt",
            body: '<img src="foto.jpg"> sin alt es un problema de accesibilidad real: una persona que usa un lector de pantalla no sabrá qué muestra la imagen. Siempre añade un alt descriptivo (o alt="" si la imagen es puramente decorativa).',
          },
          {
            type: "challenge",
            title: "Página de perfil",
            body: 'Crea una pequeña página "sobre mí" con tu nombre en un h1, dos párrafos de texto (uno con una palabra en <strong>), un enlace a tu red social favorita y una imagen con su alt.',
          },
          {
            type: "real_application",
            body: "Un accesibility audit (auditoría de accesibilidad) real de una empresa suele detectar decenas de imágenes sin alt — es de los primeros problemas que aprenderás a diagnosticar en el Debugging Lab.",
          },
        ],
      },
      {
        slug: "listas-y-tablas",
        title: "Listas y tablas",
        summary: "Listas ordenadas/desordenadas y tablas para datos tabulares.",
        order: 3,
        estimatedMinutes: 12,
        skillSlug: "html-fundamentals",
        content: [
          {
            type: "theory",
            body: "Las listas (<ul> para no ordenadas, <ol> para ordenadas, con <li> por elemento) agrupan ítems relacionados. Las tablas (<table>) muestran datos con filas y columnas.",
          },
          {
            type: "technical",
            title: "Estructura de una tabla",
            body: "<table> contiene <tr> (filas), que contienen <th> (celdas de cabecera) o <td> (celdas de datos). Usar <thead> y <tbody> ayuda a estructurar tablas grandes.",
          },
          {
            type: "example",
            language: "html",
            code: "<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>\n\n<table>\n  <thead>\n    <tr><th>Curso</th><th>Horas</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>HTML</td><td>12</td></tr>\n  </tbody>\n</table>",
          },
          {
            type: "common_mistake",
            title: "Usar tablas para maquetar el layout",
            body: "Durante años se usaron tablas para posicionar elementos en la página (un menú a la izquierda, contenido a la derecha...). Hoy eso es CSS (Flexbox/Grid, en el curso de CSS). Las tablas son solo para datos tabulares reales.",
          },
          {
            type: "challenge",
            title: "Tabla de horarios",
            body: "Crea una tabla con tres columnas (Día, Hora, Actividad) y cuatro filas con tu horario de estudio de esta semana.",
          },
          {
            type: "real_application",
            body: "Cualquier panel de administración que muestre una lista de usuarios, pedidos o tickets (como el que construirás en el simulador de empresa) usa tablas HTML reales por debajo.",
          },
        ],
      },
    ],
  },
  {
    slug: "html-semantico-y-formularios",
    title: "HTML semántico y formularios",
    description: "Etiquetas con significado y cómo capturar datos del usuario.",
    order: 2,
    lessons: [
      {
        slug: "html-semantico-y-accesibilidad",
        title: "HTML semántico y accesibilidad",
        summary:
          "Por qué <article> comunica más que <div> y cómo afecta a accesibilidad y SEO.",
        order: 1,
        estimatedMinutes: 15,
        skillSlug: "semantic-html",
        content: [
          {
            type: "theory",
            body: "HTML semántico usa etiquetas que describen el significado del contenido (<header>, <nav>, <main>, <article>, <footer>) en vez de <div> genéricos para todo.",
          },
          {
            type: "technical",
            title: "Por qué importa",
            body: 'Los lectores de pantalla, los motores de búsqueda y otros desarrolladores "leen" tu HTML. <div> no dice nada sobre el contenido; <nav> dice "esto es la navegación principal", lo que permite saltar directamente a ella.',
          },
          {
            type: "example",
            language: "html",
            code: "<header>\n  <nav>...</nav>\n</header>\n<main>\n  <article>\n    <h2>Título del artículo</h2>\n    <p>Contenido...</p>\n  </article>\n</main>\n<footer>...</footer>",
          },
          {
            type: "common_mistake",
            title: '"Div-itis"',
            body: '<div class="header"><div class="nav">...</div></div> funciona visualmente igual que las etiquetas semánticas, pero no comunica nada al navegador ni a las tecnologías de asistencia. Es un antipatrón muy común en código heredado.',
          },
          {
            type: "challenge",
            title: "Encuentra 3 problemas de accesibilidad",
            body: 'Analiza este fragmento: <div onclick="enviar()">Enviar</div>. ¿Qué falta para que sea accesible con teclado y lectores de pantalla? (Pista: piensa en qué etiqueta nativa ya resuelve esto).',
          },
          {
            type: "real_application",
            body: 'En el Debugging Lab encontrarás casos reales de "este HTML tiene tres problemas de accesibilidad, encuéntralos" — exactamente el tipo de auditoría que se hace en equipos profesionales antes de lanzar una web.',
          },
        ],
      },
      {
        slug: "formularios",
        title: "Formularios",
        summary:
          "Capturar información del usuario con <form>, inputs y validación nativa.",
        order: 2,
        estimatedMinutes: 18,
        skillSlug: "semantic-html",
        content: [
          {
            type: "theory",
            body: "Un formulario (<form>) agrupa campos de entrada (<input>, <select>, <textarea>) para recoger datos del usuario, normalmente para enviarlos a un servidor.",
          },
          {
            type: "technical",
            title: "Label y validación nativa",
            body: '<label> asociado a un <input> (vía for/id) hace el campo accesible: al hacer clic en el texto, se enfoca el input. Atributos como required, type="email" o minlength activan validación del navegador sin necesidad de JavaScript.',
          },
          {
            type: "example",
            language: "html",
            code: '<form>\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required />\n\n  <label for="password">Contraseña</label>\n  <input id="password" name="password" type="password" minlength="8" required />\n\n  <button type="submit">Entrar</button>\n</form>',
          },
          {
            type: "common_mistake",
            title: "Inputs sin label",
            body: 'Un <input placeholder="Email"> sin <label> parece funcionar visualmente, pero el placeholder desaparece al escribir y no es leído de forma fiable por lectores de pantalla. El label es obligatorio, no opcional.',
          },
          {
            type: "challenge",
            title: "Formulario de registro",
            body: "Crea un formulario con campos de nombre, email y contraseña, cada uno con su label, y un botón de envío. Usa los atributos de validación nativa que correspondan a cada campo.",
          },
          {
            type: "real_application",
            body: "El formulario de registro que construirás en el curso de React más adelante reutiliza estos mismos conceptos HTML, solo que gestionados con JavaScript encima.",
          },
        ],
      },
      {
        slug: "buenas-practicas-y-errores-comunes",
        title: "Buenas prácticas y errores comunes",
        summary: "Un repaso de los errores de HTML más habituales antes de pasar a CSS.",
        order: 3,
        estimatedMinutes: 12,
        skillSlug: "semantic-html",
        content: [
          {
            type: "theory",
            body: 'HTML es permisivo: el navegador intenta "arreglar" errores de marcado en vez de fallar. Eso es cómodo pero esconde bugs — un HTML inválido puede renderizar distinto en distintos navegadores.',
          },
          {
            type: "technical",
            title: "Validación",
            body: "Herramientas como el validador de W3C comprueban que tu HTML sea válido: etiquetas bien anidadas, atributos obligatorios presentes, IDs únicos en la página.",
          },
          {
            type: "example",
            language: "html",
            code: "<!-- Mal: etiquetas cruzadas -->\n<p>Texto <strong>importante</p></strong>\n\n<!-- Bien -->\n<p>Texto <strong>importante</strong></p>",
          },
          {
            type: "common_mistake",
            title: "IDs duplicados",
            body: 'Usar el mismo id="menu" en dos elementos de la misma página es inválido y causa comportamientos impredecibles en CSS y JavaScript (document.getElementById solo devuelve el primero). Los IDs deben ser únicos en toda la página.',
          },
          {
            type: "challenge",
            title: "Encuentra el error",
            body: '<ul><li>Uno<li>Dos</ul> — falta algo en cada <li>. ¿Qué es, y por qué el navegador lo muestra "bien" igualmente?',
          },
          {
            type: "real_application",
            body: 'Un HTML inválido es una de las causas típicas de "funciona en mi navegador pero no en el del cliente" — un caso real que verás en el Debugging Lab.',
          },
        ],
      },
    ],
  },
];
