import type { ModuleSeed } from "./helpers.js";

export const JAVASCRIPT_MODULES: ModuleSeed[] = [
  {
    slug: "fundamentos-de-javascript",
    title: "Fundamentos de JavaScript",
    description: "Variables, tipos, operadores, condicionales, bucles y funciones.",
    order: 1,
    lessons: [
      {
        slug: "variables-tipos-y-operadores",
        title: "Variables, tipos y operadores",
        summary: "let/const, los tipos primitivos y los operadores más usados.",
        order: 1,
        estimatedMinutes: 18,
        skillSlug: "javascript-fundamentals",
        content: [
          {
            type: "theory",
            body: "Una variable es un nombre que apunta a un valor guardado en memoria. JavaScript tiene tipos primitivos: number, string, boolean, undefined, null, y tipos de referencia como object y array.",
          },
          {
            type: "technical",
            title: "let, const y var",
            body: "const declara una variable cuyo valor no puede reasignarse (usa por defecto). let declara una variable que sí puede reasignarse, con scope de bloque. var (heredado de versiones antiguas) tiene scope de función, lo que causa bugs sutiles — evítalo en código nuevo.",
          },
          {
            type: "example",
            language: "javascript",
            code: 'const nombre = "Ada";\nlet edad = 28;\nedad = 29; // válido, let permite reasignar\n\nconst esMayorDeEdad = edad >= 18; // boolean\nconsole.log(`${nombre} tiene ${edad} años`);',
          },
          {
            type: "common_mistake",
            title: "Intentar reasignar un const",
            body: "const total = 10; total = 20; lanza TypeError: Assignment to constant variable. Si necesitas reasignar el valor más adelante, la variable debería ser let, no const.",
          },
          {
            type: "challenge",
            title: "Corrige el código",
            body: "const contador = 0; y luego, en la siguiente línea, contador = contador + 1;. Este código lanza un error. ¿Cómo lo arreglas sin cambiar la lógica?",
          },
          {
            type: "real_application",
            body: "Elegir const por defecto y let solo cuando es necesario es la convención en cualquier código base profesional de JavaScript/TypeScript moderno, incluido este mismo proyecto.",
          },
        ],
      },
      {
        slug: "condicionales-y-bucles",
        title: "Condicionales y bucles",
        summary: "if/else, comparaciones y cómo repetir código con for/while.",
        order: 2,
        estimatedMinutes: 18,
        skillSlug: "javascript-fundamentals",
        content: [
          {
            type: "theory",
            body: "if/else ejecuta código distinto según una condición sea verdadera o falsa. Los bucles (for, while) repiten un bloque de código mientras se cumpla una condición.",
          },
          {
            type: "technical",
            title: "=== vs ==",
            body: '=== compara valor Y tipo sin conversión ("5" === 5 es false). == convierte los tipos antes de comparar ("5" == 5 es true), lo que puede producir resultados sorprendentes. Usa siempre === salvo que tengas una razón explícita para lo contrario.',
          },
          {
            type: "example",
            language: "javascript",
            code: "const numeros = [1, 2, 3, 4, 5];\nlet suma = 0;\n\nfor (const n of numeros) {\n  if (n % 2 === 0) {\n    suma += n;\n  }\n}\n\nconsole.log(suma); // 6 (2 + 4)",
          },
          {
            type: "common_mistake",
            title: "Bucles infinitos",
            body: "while (true) { /* sin break o condición de salida */ } congela el programa. Todo bucle necesita una condición que eventualmente se vuelva falsa, o una instrucción break alcanzable.",
          },
          {
            type: "challenge",
            title: "Filtra y cuenta",
            body: "Dado el array [3, 7, 2, 9, 4, 1, 8], escribe un bucle for que cuente cuántos números son mayores que 4.",
          },
          {
            type: "real_application",
            body: "Filtrar y transformar listas de datos (usuarios, productos, tickets) es una de las tareas más comunes en cualquier aplicación real — lo verás constantemente en el resto de la plataforma.",
          },
        ],
      },
      {
        slug: "funciones",
        title: "Funciones",
        summary: "Declarar, invocar y devolver valores desde funciones; arrow functions.",
        order: 3,
        estimatedMinutes: 18,
        skillSlug: "javascript-fundamentals",
        content: [
          {
            type: "theory",
            body: "Una función agrupa código reutilizable. Recibe parámetros de entrada y opcionalmente devuelve (return) un valor de salida.",
          },
          {
            type: "technical",
            title: "Funciones tradicionales vs arrow functions",
            body: "function suma(a, b) { return a + b; } y const suma = (a, b) => a + b; son equivalentes en la mayoría de casos. Las arrow functions son más concisas y no redefinen this — importante cuando trabajes con clases y callbacks.",
          },
          {
            type: "example",
            language: "javascript",
            code: 'function calcularXP(dificultad) {\n  if (dificultad === "facil") return 10;\n  if (dificultad === "media") return 25;\n  return 50; // difícil\n}\n\nconst calcularXPArrow = (dificultad) =>\n  dificultad === "facil" ? 10 : dificultad === "media" ? 25 : 50;\n\nconsole.log(calcularXP("media")); // 25',
          },
          {
            type: "common_mistake",
            title: "Olvidar el return",
            body: "function duplicar(n) { n * 2; } no devuelve nada (undefined) porque falta la palabra return. Es uno de los errores más comunes al empezar: escribir la operación sin decirle a la función que la devuelva.",
          },
          {
            type: "challenge",
            title: "Función de validación",
            body: 'Escribe una función esEmailValido(email) que devuelva true si el string contiene un "@" y al menos un "." después de él, y false en caso contrario.',
          },
          {
            type: "real_application",
            body: "El backend de CodeForge (apps/api) está organizado en funciones puras y pequeñas (controllers, services, repositories) que hacen exactamente una cosa cada una — la misma disciplina que estás aprendiendo aquí, a mayor escala.",
          },
        ],
      },
    ],
  },
  {
    slug: "dom-y-eventos",
    title: "DOM y eventos",
    description:
      "Leer y modificar la página desde JavaScript, y reaccionar a la interacción del usuario.",
    order: 2,
    lessons: [
      {
        slug: "seleccionar-y-modificar-el-dom",
        title: "Seleccionar y modificar el DOM",
        summary:
          "querySelector, y cómo leer/cambiar el contenido y los estilos de un elemento.",
        order: 1,
        estimatedMinutes: 18,
        skillSlug: "dom",
        content: [
          {
            type: "theory",
            body: "El DOM (Document Object Model) es la representación en memoria de tu HTML que JavaScript puede leer y modificar. Cambiar el DOM cambia lo que ve el usuario, sin recargar la página.",
          },
          {
            type: "technical",
            title: "querySelector y propiedades",
            body: "document.querySelector(selector) devuelve el primer elemento que coincide con un selector CSS. Una vez tienes el elemento, puedes leer/cambiar .textContent, .innerHTML, .style, o sus atributos.",
          },
          {
            type: "example",
            language: "javascript",
            code: 'const titulo = document.querySelector("h1");\ntitulo.textContent = "¡Título actualizado!";\ntitulo.style.color = "blue";\n\nconst todosLosParrafos = document.querySelectorAll("p");\ntodosLosParrafos.forEach((p) => p.classList.add("resaltado"));',
          },
          {
            type: "common_mistake",
            title: "innerHTML con contenido de usuario",
            body: "elemento.innerHTML = datoDelUsuario es un riesgo real de seguridad (XSS): si ese dato contiene <script>, se ejecutará. Para insertar texto plano, usa siempre .textContent, no .innerHTML.",
          },
          {
            type: "challenge",
            title: "Contador de clics",
            body: 'Dado <button id="btn">0</button>, escribe el JavaScript para que, cada vez que se seleccione el botón, se lea su número actual y se actualice a +1 (sin usar addEventListener todavía, solo la lectura/escritura del DOM).',
          },
          {
            type: "real_application",
            body: 'React (que verás más adelante) automatiza exactamente este patrón de "actualizar el DOM cuando cambian los datos" — entender cómo funciona manualmente primero hace que React tenga mucho más sentido después.',
          },
        ],
      },
      {
        slug: "eventos",
        title: "Eventos",
        summary:
          "addEventListener y cómo reaccionar a clics, teclado y envíos de formulario.",
        order: 2,
        estimatedMinutes: 18,
        skillSlug: "dom",
        content: [
          {
            type: "theory",
            body: "Un evento es algo que ocurre en la página (un clic, una tecla pulsada, un formulario enviado). addEventListener registra una función que se ejecuta cuando ese evento ocurre.",
          },
          {
            type: "technical",
            title: "El objeto event",
            body: "La función que registras recibe automáticamente un objeto event con información sobre lo ocurrido: event.target (el elemento que originó el evento), event.key (la tecla pulsada), etc.",
          },
          {
            type: "example",
            language: "javascript",
            code: 'const boton = document.querySelector("#btn");\nlet contador = 0;\n\nboton.addEventListener("click", () => {\n  contador += 1;\n  boton.textContent = contador;\n});',
          },
          {
            type: "common_mistake",
            title: "No prevenir el comportamiento por defecto",
            body: 'En un formulario, el evento "submit" recarga la página por defecto. Si quieres manejar el envío con JavaScript sin recargar, necesitas event.preventDefault() al principio del listener — olvidarlo es un error clásico.',
          },
          {
            type: "challenge",
            title: "Formulario sin recarga",
            body: "Registra un listener para el evento submit de un formulario que llame a event.preventDefault() y muestre por consola los valores de sus campos, sin que la página se recargue.",
          },
          {
            type: "real_application",
            body: 'Cada botón "Enviar" de esta plataforma (login, registro, envío de un ejercicio) usa exactamente este patrón: preventDefault + lógica propia en JavaScript/React.',
          },
        ],
      },
      {
        slug: "formularios-y-validacion-con-js",
        title: "Formularios y validación con JS",
        summary: "Leer valores de un formulario y validarlos antes de enviarlos.",
        order: 3,
        estimatedMinutes: 15,
        skillSlug: "dom",
        content: [
          {
            type: "theory",
            body: 'La validación nativa de HTML (required, type="email"...) cubre casos básicos, pero a menudo necesitas reglas más específicas (contraseñas seguras, confirmar que dos campos coinciden) que solo JavaScript puede comprobar.',
          },
          {
            type: "technical",
            title: "FormData",
            body: "new FormData(formulario) recoge todos los valores de un formulario en un objeto fácil de leer, sin tener que seleccionar cada input manualmente.",
          },
          {
            type: "example",
            language: "javascript",
            code: 'formulario.addEventListener("submit", (event) => {\n  event.preventDefault();\n  const datos = new FormData(formulario);\n  const password = datos.get("password");\n\n  if (password.length < 8) {\n    mostrarError("La contraseña debe tener al menos 8 caracteres");\n    return;\n  }\n\n  enviarAlServidor(datos);\n});',
          },
          {
            type: "common_mistake",
            title: "Validar solo en el frontend",
            body: "La validación en JavaScript mejora la experiencia de usuario (feedback inmediato), pero nunca sustituye la validación en el backend: cualquiera puede saltarse el JavaScript del navegador y enviar una petición directamente a tu API.",
          },
          {
            type: "challenge",
            title: "Valida una contraseña",
            body: "Escribe una función que reciba una contraseña y devuelva un array de errores (vacío si es válida): debe tener al menos 8 caracteres, al menos una letra y al menos un número.",
          },
          {
            type: "real_application",
            body: "Este mismo patrón (validar en el cliente para UX, y siempre revalidar en el servidor) es exactamente cómo está construido el formulario de registro de CodeForge: React Hook Form + Zod en el frontend, y el mismo esquema Zod reutilizado en el backend.",
          },
        ],
      },
    ],
  },
  {
    slug: "asincronia-y-apis",
    title: "Asincronía y APIs",
    description: "Promesas, async/await y cómo consumir una API real con fetch.",
    order: 3,
    lessons: [
      {
        slug: "callbacks-y-el-problema-de-la-anidacion",
        title: "Callbacks y el problema de la anidación",
        summary: 'Por qué existe la asincronía y el problema del "callback hell".',
        order: 1,
        estimatedMinutes: 15,
        skillSlug: "async-javascript",
        content: [
          {
            type: "theory",
            body: 'JavaScript es de un solo hilo: solo puede hacer una cosa a la vez. Para operaciones lentas (pedir datos a un servidor, leer un archivo), usa código asíncrono para no "congelar" el resto del programa mientras espera.',
          },
          {
            type: "technical",
            title: "Callbacks",
            body: "La forma más antigua de asincronía es pasar una función (callback) que se ejecuta cuando la operación termina. Cuando encadenas varias operaciones asíncronas dependientes, los callbacks anidados se vuelven difíciles de leer.",
          },
          {
            type: "example",
            language: "javascript",
            code: 'obtenerUsuario(id, (usuario) => {\n  obtenerPedidos(usuario.id, (pedidos) => {\n    obtenerDetalles(pedidos[0].id, (detalles) => {\n      console.log(detalles); // "callback hell": tres niveles anidados\n    });\n  });\n});',
          },
          {
            type: "common_mistake",
            title: 'Pensar que el código asíncrono se ejecuta "en orden visual"',
            body: 'console.log("A"); obtenerDatos(() => console.log("B")); console.log("C"); imprime A, C, B — no A, B, C. La operación asíncrona no bloquea el resto del código, que sigue ejecutándose mientras espera.',
          },
          {
            type: "challenge",
            title: "Predicción de output",
            body: '¿En qué orden se imprimen "uno", "dos" y "tres" en este código?\nconsole.log("uno");\nsetTimeout(() => console.log("dos"), 0);\nconsole.log("tres");',
          },
          {
            type: "real_application",
            body: "Entender esto es la base para el siguiente tema (promesas y async/await), que resuelve exactamente el problema de legibilidad de los callbacks anidados.",
          },
        ],
      },
      {
        slug: "promesas-y-async-await",
        title: "Promesas y async/await",
        summary: "Una forma más legible de escribir y encadenar código asíncrono.",
        order: 2,
        estimatedMinutes: 20,
        skillSlug: "async-javascript",
        content: [
          {
            type: "theory",
            body: "Una promesa (Promise) representa un valor que estará disponible en el futuro: puede resolverse (éxito) o rechazarse (error). async/await es una sintaxis que hace que el código con promesas se lea como si fuera síncrono.",
          },
          {
            type: "technical",
            title: "await solo pausa la función, no el programa",
            body: "await solo puede usarse dentro de una función async. Pausa la ejecución de ESA función hasta que la promesa se resuelva, pero el resto del programa (y del navegador) sigue funcionando con normalidad.",
          },
          {
            type: "example",
            language: "javascript",
            code: 'async function cargarPerfil(id) {\n  try {\n    const usuario = await obtenerUsuario(id);\n    const pedidos = await obtenerPedidos(usuario.id);\n    return { usuario, pedidos };\n  } catch (error) {\n    console.error("No se pudo cargar el perfil:", error);\n    throw error;\n  }\n}',
            body: "Compara esto con el ejemplo de callbacks anidados de la lección anterior: mismo problema, mucho más legible.",
          },
          {
            type: "common_mistake",
            title: "Olvidar el try/catch",
            body: "Una promesa rechazada dentro de una función async sin try/catch se propaga como una excepción no controlada. En una aplicación real esto puede romper flujos completos silenciosamente si nadie captura el error.",
          },
          {
            type: "challenge",
            title: "Convierte a async/await",
            body: "Reescribe el ejemplo de callbacks anidados de la lección anterior (obtenerUsuario → obtenerPedidos → obtenerDetalles) usando async/await, asumiendo que cada función ya devuelve una promesa.",
          },
          {
            type: "real_application",
            body: "Todo el backend de CodeForge (apps/api) usa async/await de principio a fin: cada controller, service y query a la base de datos es una función async.",
          },
        ],
      },
      {
        slug: "fetch-y-consumo-de-apis",
        title: "Fetch y consumo de APIs",
        summary: "Pedir datos a un servidor real desde el navegador con fetch.",
        order: 3,
        estimatedMinutes: 20,
        skillSlug: "apis",
        content: [
          {
            type: "theory",
            body: "fetch() es la API nativa del navegador para hacer peticiones HTTP: pedir datos a un servidor (GET), o enviarle datos (POST, PUT, DELETE).",
          },
          {
            type: "technical",
            title: "fetch devuelve una promesa... dos veces",
            body: "fetch(url) resuelve cuando llegan las cabeceras de la respuesta, no el cuerpo completo. Por eso necesitas un segundo await sobre response.json() (o .text()) para obtener los datos ya parseados.",
          },
          {
            type: "example",
            language: "javascript",
            code: 'async function obtenerCursos() {\n  const response = await fetch("/api/v1/courses");\n\n  if (!response.ok) {\n    throw new Error(`Error ${response.status} al obtener los cursos`);\n  }\n\n  const data = await response.json();\n  return data.courses;\n}',
          },
          {
            type: "common_mistake",
            title: "No comprobar response.ok",
            body: "fetch() NO lanza un error automáticamente si el servidor responde con 404 o 500 — solo lo hace si la red falla por completo. Hay que comprobar response.ok (o response.status) manualmente para detectar errores HTTP.",
          },
          {
            type: "challenge",
            title: "Maneja el error",
            body: "Modifica la función obtenerCursos() del ejemplo para que, si la petición falla (red caída o servidor con error), devuelva un array vacío en vez de dejar que el error se propague sin control.",
          },
          {
            type: "real_application",
            body: "El cliente HTTP de CodeForge (apps/web/src/lib/api-client.ts) envuelve exactamente este patrón con axios, añadiendo autenticación y reintentos automáticos — lo verás en detalle en el curso de React.",
          },
        ],
      },
    ],
  },
];
