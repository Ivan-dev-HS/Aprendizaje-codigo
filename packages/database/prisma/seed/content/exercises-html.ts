import type { ExerciseSeed } from "./exercise-helpers.js";

export const HTML_EXERCISES: ExerciseSeed[] = [
  {
    slug: "html-mcq-etiqueta-semantica-pie",
    title: "La etiqueta semántica correcta",
    description:
      "Elige la etiqueta HTML semánticamente correcta para el pie de página del sitio.",
    type: "MCQ",
    difficulty: "EASY",
    estimatedMinutes: 3,
    skillSlug: "semantic-html",
    prompt: {
      type: "MCQ",
      question: "¿Qué etiqueta es la más adecuada para el pie de página de un sitio web?",
      options: [
        { id: "a", label: '<div class="footer">' },
        { id: "b", label: "<bottom>" },
        { id: "c", label: "<footer>" },
        { id: "d", label: '<section id="footer">' },
      ],
    },
    hints: [
      "Piensa en las etiquetas semánticas que viste en la lección de HTML semántico.",
      "No es <div>, ni una etiqueta inventada como <bottom>.",
      "Existe una etiqueta HTML5 pensada exactamente para esto.",
    ],
    solution: { correctOptionId: "c" },
    explanation:
      "<footer> comunica directamente el propósito del contenido a navegadores, lectores de pantalla y motores de búsqueda, a diferencia de un <div> genérico con una clase.",
  },
  {
    slug: "html-tf-alt-decorativas",
    title: "Imágenes decorativas y el atributo alt",
    description: '¿Es correcto usar alt="" en una imagen puramente decorativa?',
    type: "TRUE_FALSE",
    difficulty: "MEDIUM",
    estimatedMinutes: 4,
    skillSlug: "semantic-html",
    prompt: {
      type: "TRUE_FALSE",
      statement:
        'Para una imagen puramente decorativa (que no aporta información), es correcto usar alt="" en vez de omitir el atributo alt.',
    },
    hints: [
      "Piensa en qué hace un lector de pantalla si el atributo alt falta por completo.",
      'alt="" le dice explícitamente al lector de pantalla que ignore la imagen.',
      "Omitir alt del todo puede hacer que el lector de pantalla lea el nombre del archivo en su lugar.",
    ],
    solution: { correct: true },
    explanation:
      'alt="" (vacío pero presente) marca la imagen como decorativa y los lectores de pantalla la saltan. Omitir el atributo por completo es peor: algunos lectores de pantalla leen la URL del archivo.',
  },
  {
    slug: "html-completion-alt-attribute",
    title: "Completa el atributo que falta",
    description: "Rellena el nombre del atributo que falta en esta imagen.",
    type: "CODE_COMPLETION",
    difficulty: "EASY",
    estimatedMinutes: 4,
    skillSlug: "html-fundamentals",
    prompt: {
      type: "CODE_COMPLETION",
      instruction:
        "Esta imagen necesita un atributo que describa su contenido para accesibilidad. Escribe solo el nombre del atributo que falta.",
      code: '<img src="gato.jpg" ___="Un gato naranja durmiendo en un sofá" />',
      language: "html",
    },
    hints: [
      "Es el atributo que aprendiste junto a src en la lección de imágenes.",
      "Empieza por 'a'.",
      "Son 3 letras: a-l-t.",
    ],
    solution: { expectedAnswer: "alt" },
    explanation:
      "El atributo alt describe el contenido de la imagen para accesibilidad y SEO, y se muestra si la imagen no carga.",
  },
  {
    slug: "html-ordering-imagen-accesible",
    title: "Pasos para añadir una imagen accesible",
    description:
      "Ordena los pasos para añadir correctamente una imagen accesible a una página.",
    type: "ORDERING",
    difficulty: "EASY",
    estimatedMinutes: 5,
    skillSlug: "semantic-html",
    prompt: {
      type: "ORDERING",
      instruction: "Ordena estos pasos en el orden lógico correcto.",
      items: [
        { id: "elegir", label: "Elegir el archivo de imagen que quieres usar" },
        { id: "etiqueta", label: "Escribir la etiqueta <img> con el atributo src" },
        { id: "alt", label: "Añadir un atributo alt que describa la imagen" },
        {
          id: "comprobar",
          label: "Abrir la página y comprobar que se ve y se lee correctamente",
        },
      ],
    },
    hints: [
      "Primero necesitas tener la imagen antes de poder enlazarla.",
      "El alt se añade a la misma etiqueta <img>, después de tener el src.",
      "La comprobación final siempre es el último paso.",
    ],
    solution: { correctOrder: ["elegir", "etiqueta", "alt", "comprobar"] },
    explanation:
      "No puedes enlazar (src) un archivo que no tienes, y el alt se escribe junto al src antes de comprobar el resultado final en el navegador.",
  },
  {
    slug: "html-debugging-div-onclick",
    title: "Depura: botón que no es un botón",
    description:
      "Este código tiene un problema real de accesibilidad. Encuentra la causa.",
    type: "DEBUGGING",
    difficulty: "MEDIUM",
    estimatedMinutes: 6,
    skillSlug: "semantic-html",
    prompt: {
      type: "DEBUGGING",
      question:
        'Un usuario que navega solo con teclado no puede activar este "botón". ¿Cuál es la causa más probable?',
      code: '<div onclick="enviarFormulario()">Enviar</div>',
      language: "html",
      options: [
        { id: "a", label: "El nombre de la función enviarFormulario() está mal escrito" },
        {
          id: "b",
          label:
            "Un <div> no es enfocable ni activable con teclado por defecto; debería ser un <button>",
        },
        { id: "c", label: "Falta el atributo type en el div" },
        { id: "d", label: 'El texto "Enviar" debería estar en mayúsculas' },
      ],
    },
    hints: [
      "Piensa en qué elementos reciben foco de teclado (Tab) de forma nativa.",
      "Un <div> no tiene ningún comportamiento de interacción por defecto — solo lo que le añadas tú manualmente.",
      "La solución correcta es cambiar la etiqueta, no arreglar el JavaScript.",
    ],
    solution: { correctOptionId: "b" },
    explanation:
      'Los elementos <button> son enfocables con Tab y activables con Enter/Espacio de forma nativa, además de comunicar su rol a lectores de pantalla. Un <div> con onclick requiere replicar manualmente todo ese comportamiento (tabindex, manejo de teclado, role="button"...) — usar <button> es siempre la opción correcta cuando existe.',
  },
];
