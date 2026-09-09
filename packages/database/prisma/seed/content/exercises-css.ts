import type { ExerciseSeed } from "./exercise-helpers.js";

export const CSS_EXERCISES: ExerciseSeed[] = [
  {
    slug: "css-mcq-box-sizing",
    title: "box-sizing y el ancho real",
    description: "¿Qué mide realmente width con box-sizing: border-box?",
    type: "MCQ",
    difficulty: "MEDIUM",
    estimatedMinutes: 5,
    skillSlug: "css-layout",
    prompt: {
      type: "MCQ",
      question:
        "Un elemento tiene width: 200px, padding: 20px, border: 5px solid, y box-sizing: border-box. ¿Cuánto mide su ancho total renderizado?",
      options: [
        { id: "a", label: "200px" },
        { id: "b", label: "250px" },
        { id: "c", label: "240px" },
        { id: "d", label: "245px" },
      ],
    },
    hints: [
      "border-box incluye padding y borde DENTRO del width que defines.",
      "Con border-box, el width que escribes ES el ancho total final.",
      "No sumes nada: 200px ya es la respuesta.",
    ],
    solution: { correctOptionId: "a" },
    explanation:
      "Con box-sizing: border-box, el valor de width ya incluye el contenido, el padding y el borde — por eso mide exactamente 200px, sin necesidad de sumar nada más.",
  },
  {
    slug: "css-completion-centrar-flex",
    title: "Completa: centrar con Flexbox",
    description:
      "Rellena la propiedad que falta para centrar los elementos horizontalmente.",
    type: "CODE_COMPLETION",
    difficulty: "EASY",
    estimatedMinutes: 5,
    skillSlug: "flexbox",
    prompt: {
      type: "CODE_COMPLETION",
      instruction:
        "Este contenedor flex debe centrar sus elementos en el eje principal (horizontal). Escribe la propiedad CSS que falta (sin el valor).",
      code: ".contenedor {\n  display: flex;\n  ___: center;\n}",
      language: "css",
    },
    hints: [
      "Es la propiedad que controla el eje PRINCIPAL, no el cruzado.",
      "No es align-items — esa es para el eje cruzado (vertical, en este caso).",
      "Empieza por 'justify'.",
    ],
    solution: {
      expectedAnswer: "justify-content",
      acceptableAnswers: ["justify-content:"],
    },
    explanation:
      "justify-content controla la alineación en el eje principal del contenedor flex (horizontal por defecto, con flex-direction: row).",
  },
  {
    slug: "css-matching-propiedades-flexbox",
    title: "Empareja: propiedades de Flexbox",
    description: "Relaciona cada propiedad de Flexbox con lo que controla.",
    type: "MATCHING",
    difficulty: "MEDIUM",
    estimatedMinutes: 6,
    skillSlug: "flexbox",
    prompt: {
      type: "MATCHING",
      instruction: "Une cada propiedad con su efecto.",
      left: [
        { id: "justify-content", label: "justify-content" },
        { id: "align-items", label: "align-items" },
        { id: "gap", label: "gap" },
        { id: "flex-direction", label: "flex-direction" },
      ],
      right: [
        { id: "cruzado", label: "Alinea los elementos en el eje cruzado" },
        { id: "principal", label: "Alinea los elementos en el eje principal" },
        { id: "espacio", label: "Define el espacio entre elementos" },
        { id: "eje", label: "Define si el eje principal es fila o columna" },
      ],
    },
    hints: [
      "justify-content y align-items controlan ejes distintos: uno principal, otro cruzado.",
      "gap es el más directo: literalmente define espacio.",
      "flex-direction decide qué eje es cuál — es la base de todo lo demás.",
    ],
    solution: {
      correctPairs: [
        { leftId: "justify-content", rightId: "principal" },
        { leftId: "align-items", rightId: "cruzado" },
        { leftId: "gap", rightId: "espacio" },
        { leftId: "flex-direction", rightId: "eje" },
      ],
    },
    explanation:
      "flex-direction determina cuál es el eje principal (row = horizontal, column = vertical); justify-content alinea en ese eje principal; align-items alinea en el eje cruzado; gap simplemente separa los elementos entre sí.",
  },
  {
    slug: "css-debugging-especificidad",
    title: "Depura: el estilo que nunca se aplica",
    description: "Un botón azul se ve gris. Encuentra por qué.",
    type: "DEBUGGING",
    difficulty: "MEDIUM",
    estimatedMinutes: 7,
    skillSlug: "css-layout",
    prompt: {
      type: "DEBUGGING",
      question:
        "El botón se sigue viendo gris en vez de azul, aunque .btn-primario está definido después en el archivo. ¿Por qué?",
      code: '#enviar { background: gray; }\n.btn-primario { background: blue; }\n\n<button id="enviar" class="btn-primario">Enviar</button>',
      language: "css",
      options: [
        {
          id: "a",
          label: "CSS aplica siempre la última regla del archivo, sin excepción",
        },
        {
          id: "b",
          label:
            "El selector de ID (#enviar) tiene más especificidad que el de clase (.btn-primario), gane quien gane en orden",
        },
        {
          id: "c",
          label: "Los navegadores ignoran las clases si hay un id en el elemento",
        },
        { id: "d", label: "gray es un color inválido en CSS" },
      ],
    },
    hints: [
      "El orden en el archivo no siempre gana — depende de la especificidad del selector.",
      "Compara el TIPO de selector: uno es de id, el otro de clase.",
      "Los selectores de ID tienen más peso (especificidad) que los de clase, independientemente del orden.",
    ],
    solution: { correctOptionId: "b" },
    explanation:
      "La especificidad de CSS no depende del orden de aparición sino del tipo de selector: un ID (#enviar) siempre gana sobre una clase (.btn-primario), sin importar cuál se declaró después.",
  },
  {
    slug: "css-tf-rem-relativo",
    title: "¿rem es relativo a qué?",
    description: "Comprueba si entiendes correctamente la unidad rem.",
    type: "TRUE_FALSE",
    difficulty: "EASY",
    estimatedMinutes: 3,
    skillSlug: "responsive-design",
    prompt: {
      type: "TRUE_FALSE",
      statement:
        "1rem siempre equivale al font-size del elemento <html> (raíz), sin importar en qué elemento anidado lo uses.",
    },
    hints: [
      "La 'r' de rem significa 'root' (raíz).",
      "Compara con em, que sí es relativo al elemento padre más cercano.",
      "rem siempre mira al mismo sitio: la raíz del documento.",
    ],
    solution: { correct: true },
    explanation:
      "A diferencia de em (relativo al elemento padre), rem siempre es relativo al font-size del elemento raíz <html> — por eso es más predecible para mantener consistencia en toda la aplicación.",
  },
];
