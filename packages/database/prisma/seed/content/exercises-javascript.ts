import type { ExerciseSeed } from "./exercise-helpers.js";

export const JAVASCRIPT_EXERCISES: ExerciseSeed[] = [
  {
    slug: "js-output-let-scope",
    title: "Predice el output: scope de bloque",
    description: "¿Qué imprime este código en la consola?",
    type: "OUTPUT_PREDICTION",
    difficulty: "EASY",
    estimatedMinutes: 5,
    skillSlug: "javascript-fundamentals",
    prompt: {
      type: "OUTPUT_PREDICTION",
      question: "¿Qué se imprime en la consola al ejecutar este código?",
      code: 'let mensaje = "fuera";\n\nif (true) {\n  let mensaje = "dentro";\n  console.log(mensaje);\n}\n\nconsole.log(mensaje);',
      language: "javascript",
    },
    hints: [
      "let tiene scope de bloque: cada { } crea un nuevo scope.",
      "Hay dos variables mensaje distintas, una por cada scope.",
      'El console.log de dentro del if imprime "dentro", el de fuera imprime "fuera".',
    ],
    solution: { expectedOutput: "dentro\nfuera" },
    explanation:
      "Como let tiene scope de bloque, la declaración dentro del if crea una variable completamente independiente de la de fuera — no la sobreescribe. Cada console.log ve la variable de su propio scope.",
  },
  {
    slug: "js-mcq-triple-equals",
    title: "=== vs ==",
    description: "¿Cuál es el resultado de esta comparación?",
    type: "MCQ",
    difficulty: "EASY",
    estimatedMinutes: 3,
    skillSlug: "javascript-fundamentals",
    prompt: {
      type: "MCQ",
      question: '¿Cuál es el valor de "5" === 5 en JavaScript?',
      options: [
        { id: "a", label: "true, porque ambos representan el número 5" },
        {
          id: "b",
          label: "false, porque === compara tipo y valor, y aquí los tipos son distintos",
        },
        { id: "c", label: "Lanza un error" },
        { id: "d", label: "undefined" },
      ],
    },
    hints: [
      "=== nunca convierte tipos antes de comparar.",
      '"5" es un string, 5 es un number: son tipos distintos.',
      "Con == sí serían iguales (por la conversión de tipos), pero con === no.",
    ],
    solution: { correctOptionId: "b" },
    explanation:
      '=== ("igualdad estricta") compara tipo y valor sin conversión. "5" (string) y 5 (number) tienen tipos distintos, así que el resultado es false, aunque con == (que sí convierte tipos) sería true.',
  },
  {
    slug: "js-completion-array-map",
    title: "Completa: duplicar cada número",
    description: "Rellena el método de array que falta.",
    type: "CODE_COMPLETION",
    difficulty: "MEDIUM",
    estimatedMinutes: 6,
    skillSlug: "javascript-fundamentals",
    prompt: {
      type: "CODE_COMPLETION",
      instruction:
        "Este código debe devolver un nuevo array con cada número multiplicado por 2. Escribe el nombre del método de array que falta (sin paréntesis).",
      code: "const numeros = [1, 2, 3, 4];\nconst duplicados = numeros.___((n) => n * 2);\n// duplicados debe ser [2, 4, 6, 8]",
      language: "javascript",
    },
    hints: [
      "Necesitas un método que transforme cada elemento y devuelva un array nuevo del mismo tamaño.",
      "No es filter (eso filtra, no transforma) ni forEach (eso no devuelve nada).",
      'Es el método que "mapea" cada valor a un nuevo valor.',
    ],
    solution: { expectedAnswer: "map" },
    explanation:
      "Array.prototype.map() aplica una función a cada elemento y devuelve un nuevo array con los resultados, manteniendo el mismo tamaño que el original.",
  },
  {
    slug: "js-tf-await-async",
    title: "¿Dónde puedes usar await?",
    description: "Comprueba si entiendes la regla básica de await.",
    type: "TRUE_FALSE",
    difficulty: "EASY",
    estimatedMinutes: 3,
    skillSlug: "async-javascript",
    prompt: {
      type: "TRUE_FALSE",
      statement:
        "La palabra clave await solo puede usarse dentro de una función declarada como async.",
    },
    hints: [
      "Intenta recordar si viste algún error de sintaxis relacionado con esto en la lección.",
      "await pausa la función que lo contiene — necesita que esa función sea async para funcionar.",
      "Usar await fuera de una función async (en el nivel superior de un módulo es una excepción especial) da un error de sintaxis.",
    ],
    solution: { correct: true },
    explanation:
      "await solo es válido dentro de una función async (con la excepción de top-level await en módulos ES modernos). Usarlo en una función normal produce un SyntaxError.",
  },
  {
    slug: "js-ordering-fetch-flow",
    title: "Ordena el flujo de una petición fetch",
    description: "Ordena los pasos correctos para consumir una API de forma segura.",
    type: "ORDERING",
    difficulty: "MEDIUM",
    estimatedMinutes: 6,
    skillSlug: "apis",
    prompt: {
      type: "ORDERING",
      instruction:
        "Ordena estos pasos en el orden correcto para consumir una API con fetch.",
      items: [
        { id: "fetch", label: "Llamar a fetch(url) y esperar (await) la respuesta" },
        { id: "check", label: "Comprobar response.ok (o response.status)" },
        { id: "json", label: "Esperar (await) response.json() para obtener los datos" },
        { id: "usar", label: "Usar los datos ya parseados en el resto del programa" },
      ],
    },
    hints: [
      "fetch() resuelve en cuanto llegan las cabeceras, no el cuerpo — por eso response.ok se puede comprobar antes de parsear el JSON.",
      "Comprobar errores HTTP debería pasar antes de intentar usar datos que podrían no existir.",
      "El parseo del JSON (await response.json()) siempre va antes de poder usar los datos.",
    ],
    solution: { correctOrder: ["fetch", "check", "json", "usar"] },
    explanation:
      "fetch() no lanza un error automático en respuestas 4xx/5xx, así que hay que comprobar response.ok antes de asumir que la petición fue exitosa, y solo entonces parsear el cuerpo con response.json() antes de usar los datos.",
  },
  {
    slug: "js-debugging-missing-return",
    title: "Depura: la función que no devuelve nada",
    description: "Esta función siempre da undefined. Encuentra el bug.",
    type: "DEBUGGING",
    difficulty: "EASY",
    estimatedMinutes: 5,
    skillSlug: "javascript-fundamentals",
    prompt: {
      type: "DEBUGGING",
      question:
        "console.log(duplicar(5)) imprime undefined en vez de 10. ¿Cuál es la causa?",
      code: "function duplicar(n) {\n  n * 2;\n}\n\nconsole.log(duplicar(5));",
      language: "javascript",
      options: [
        { id: "a", label: "n debería llamarse number" },
        { id: "b", label: "Falta la palabra return antes de n * 2" },
        { id: "c", label: "console.log no puede recibir el resultado de una función" },
        { id: "d", label: "Hace falta usar function* en vez de function" },
      ],
    },
    hints: [
      "La operación n * 2 se calcula, pero... ¿se devuelve?",
      "Una función sin return explícito siempre devuelve undefined.",
      "Añade return antes de n * 2.",
    ],
    solution: { correctOptionId: "b" },
    explanation:
      "Sin la palabra return, el resultado de n * 2 se calcula pero se descarta — la función termina y devuelve undefined por defecto. Hace falta return n * 2; para que el valor salga de la función.",
  },
  {
    slug: "js-output-async-order",
    title: "Predice el output: orden de ejecución asíncrona",
    description: "Un clásico: ¿en qué orden se imprimen estos tres mensajes?",
    type: "OUTPUT_PREDICTION",
    difficulty: "HARD",
    estimatedMinutes: 8,
    skillSlug: "async-javascript",
    prompt: {
      type: "OUTPUT_PREDICTION",
      question: '¿En qué orden se imprimen "uno", "dos" y "tres"?',
      code: 'console.log("uno");\nsetTimeout(() => console.log("dos"), 0);\nconsole.log("tres");',
      language: "javascript",
    },
    hints: [
      "JavaScript ejecuta primero todo el código síncrono antes de atender ninguna tarea asíncrona, incluso con un delay de 0ms.",
      '"uno" y "tres" son síncronos y se ejecutan en orden, de arriba a abajo.',
      "setTimeout, aunque sea 0ms, siempre se ejecuta después de que el código síncrono termine.",
    ],
    solution: { expectedOutput: "uno\ntres\ndos" },
    explanation:
      'Aunque el delay de setTimeout sea 0, su callback se coloca en la cola de tareas y solo se ejecuta cuando el call stack principal está vacío. Por eso todo el código síncrono ("uno", "tres") se ejecuta primero, y "dos" llega el último.',
  },
];
