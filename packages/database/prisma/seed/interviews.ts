import { prisma } from "../../src/client.js";

/**
 * Secciones 38-40 de SPEC.md: banco de preguntas de entrevista + plantillas
 * de simulación. Misma decisión de alcance que el resto del contenido (ver
 * docs/CONTENT_BACKLOG.md): 24 preguntas reales (4 por categoría) en vez de
 * las 100 mínimas de la sección 68, cada una con concepts/commonMistakes/
 * expectedAnswer reales — nunca preguntas placeholder.
 *
 * `concepts` es lo único que se usa para puntuar (cobertura de conceptos
 * mencionados en la respuesta libre del usuario, ver
 * apps/api/src/modules/interviews/interview-scoring.ts). `commonMistakes`
 * es contenido puramente educativo, mostrado tras responder.
 */
interface QuestionSeed {
  slug: string;
  category:
    "TECHNICAL" | "BEHAVIORAL" | "FRONTEND" | "BACKEND" | "FULL_STACK" | "IT_SUPPORT";
  skillSlug?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prompt: string;
  expectedAnswer: string;
  concepts: string[];
  commonMistakes: string[];
}

const QUESTIONS: QuestionSeed[] = [
  // TECHNICAL
  {
    slug: "tech-equality-operators-js",
    category: "TECHNICAL",
    skillSlug: "javascript-fundamentals",
    difficulty: "EASY",
    prompt: "¿Cuál es la diferencia entre == y === en JavaScript?",
    expectedAnswer:
      "== compara valores permitiendo coerción de tipos (convierte los operandos a un tipo común antes de comparar), mientras que === compara valor y tipo sin ninguna conversión implícita. Por eso '5' == 5 es true, pero '5' === 5 es false. En la práctica se recomienda usar siempre === para evitar comparaciones sorprendentes causadas por la coerción automática.",
    concepts: ["coerción de tipos", "comparación estricta", "tipo de dato"],
    commonMistakes: [
      "Pensar que == y === siempre dan el mismo resultado.",
      "No saber explicar qué es la coerción de tipos con un ejemplo concreto.",
    ],
  },
  {
    slug: "tech-rest-api-principles",
    category: "TECHNICAL",
    skillSlug: "apis",
    difficulty: "MEDIUM",
    prompt: "Explica qué es una API REST y cuáles son sus principios básicos.",
    expectedAnswer:
      "Una API REST expone recursos a través de URLs y usa los verbos HTTP (GET, POST, PUT/PATCH, DELETE) para operar sobre ellos. Sus principios básicos incluyen: statelessness (cada petición contiene toda la información necesaria, el servidor no guarda estado de sesión entre peticiones), una interfaz uniforme (recursos identificados por URLs, representaciones en JSON u otro formato), y el uso correcto de los códigos de estado HTTP para comunicar el resultado de la operación.",
    concepts: ["recursos", "verbos http", "stateless", "códigos de estado"],
    commonMistakes: [
      "Confundir REST con 'cualquier API que use JSON'.",
      "No mencionar el statelessness como principio clave.",
    ],
  },
  {
    slug: "tech-closures-js",
    category: "TECHNICAL",
    skillSlug: "javascript-fundamentals",
    difficulty: "MEDIUM",
    prompt: "¿Qué es un closure en JavaScript y para qué sirve?",
    expectedAnswer:
      "Un closure es una función que recuerda el scope léxico en el que fue creada, incluso después de que la función externa haya terminado de ejecutarse. Esto le da a la función interna acceso a las variables de la función externa. Se usa para encapsular estado privado (por ejemplo, contadores o factories de funciones) y para patrones como debounce/throttle o currying.",
    concepts: ["scope léxico", "función interna", "estado privado"],
    commonMistakes: [
      "Explicar closures como 'una función dentro de otra función' sin mencionar el acceso al scope.",
      "No poder dar un ejemplo real de uso (encapsular estado, factories, debounce).",
    ],
  },
  {
    slug: "tech-sql-vs-nosql",
    category: "TECHNICAL",
    skillSlug: "sql",
    difficulty: "MEDIUM",
    prompt:
      "¿Qué diferencia hay entre una base de datos SQL y una NoSQL, y cuándo usarías cada una?",
    expectedAnswer:
      "SQL (relacional) organiza los datos en tablas con un esquema fijo y relaciones definidas mediante claves foráneas, y garantiza propiedades ACID, ideal cuando los datos son estructurados y las relaciones importan (por ejemplo un sistema de pedidos). NoSQL agrupa varios modelos (documentos, clave-valor, grafos) con esquema flexible, pensados para escalar horizontalmente o para datos poco estructurados o que cambian de forma. La elección depende de si el dominio necesita relaciones estrictas y transacciones (SQL) o flexibilidad y escala horizontal (NoSQL).",
    concepts: ["esquema fijo", "acid", "escalado horizontal", "esquema flexible"],
    commonMistakes: [
      "Decir que NoSQL 'siempre es más rápido' sin matizar el contexto.",
      "No saber qué significa ACID.",
    ],
  },

  // BEHAVIORAL
  {
    slug: "behav-conflicto-equipo",
    category: "BEHAVIORAL",
    skillSlug: "communication",
    difficulty: "EASY",
    prompt:
      "Cuéntame de un momento en el que tuviste un desacuerdo con un compañero de equipo y cómo lo resolviste.",
    expectedAnswer:
      "Una buena respuesta describe una situación concreta (situación y tarea), qué acción tomaste para resolver el desacuerdo — normalmente escuchar el punto de vista del otro, buscar datos objetivos o un tercero neutral, y proponer una solución de compromiso — y el resultado final, idealmente con lo que aprendiste sobre comunicación en equipo (estructura STAR: situación, tarea, acción, resultado).",
    concepts: ["situación concreta", "acción tomada", "resultado", "lo que aprendiste"],
    commonMistakes: [
      "Responder de forma abstracta ('siempre intento comunicarme bien') sin un ejemplo real.",
      "Culpar únicamente a la otra persona sin reflexionar sobre el propio rol.",
    ],
  },
  {
    slug: "behav-aprender-rapido",
    category: "BEHAVIORAL",
    skillSlug: "problem-solving",
    difficulty: "EASY",
    prompt:
      "Describe una situación en la que tuviste que aprender algo nuevo rápidamente bajo presión.",
    expectedAnswer:
      "Una buena respuesta explica el contexto (qué tenías que aprender y por qué había presión de tiempo), qué estrategia concreta usaste para aprender rápido (documentación oficial, un tutorial concreto, pedir ayuda a alguien con experiencia, dividir el problema en partes pequeñas) y el resultado: qué lograste y cómo ese aprendizaje te sirvió después.",
    concepts: [
      "contexto de la situación",
      "estrategia de aprendizaje",
      "resultado concreto",
    ],
    commonMistakes: [
      "Dar una respuesta genérica sin mencionar una tecnología o situación real.",
      "No explicar el proceso de aprendizaje, solo el resultado final.",
    ],
  },
  {
    slug: "behav-error-y-aprendizaje",
    category: "BEHAVIORAL",
    skillSlug: "communication",
    difficulty: "MEDIUM",
    prompt: "Cuéntame de un error que cometiste en un proyecto y qué aprendiste de él.",
    expectedAnswer:
      "Una buena respuesta reconoce un error real (no trivial ni inventado), explica el impacto que tuvo, cómo lo detectaste y corregiste, y sobre todo qué cambiaste en tu forma de trabajar después (por ejemplo, añadir tests, revisar mejor antes de desplegar, comunicar antes un riesgo). Mostrar responsabilidad y aprendizaje real es más valioso que aparentar que nunca se cometen errores.",
    concepts: ["error concreto", "impacto", "corrección", "cambio de hábito"],
    commonMistakes: [
      "Elegir un 'error' que en realidad no fue culpa propia, para evitar mostrar vulnerabilidad.",
      "No mencionar ningún cambio concreto de comportamiento tras el error.",
    ],
  },
  {
    slug: "behav-priorizar-tareas",
    category: "BEHAVIORAL",
    skillSlug: "communication",
    difficulty: "EASY",
    prompt: "¿Cómo priorizas tareas cuando tienes varias fechas límite al mismo tiempo?",
    expectedAnswer:
      "Una buena respuesta menciona un criterio concreto de priorización (impacto/urgencia, bloqueo de otras personas, esfuerzo estimado), la importancia de comunicar pronto si un plazo no se va a cumplir, y un ejemplo real de cómo lo aplicaste. Mencionar herramientas concretas (un tablero de tickets, por ejemplo) refuerza la respuesta.",
    concepts: ["criterio de priorización", "comunicación temprana", "ejemplo real"],
    commonMistakes: [
      "Responder solo 'trabajo mucho y ya está' sin un criterio real de priorización.",
      "No mencionar la comunicación con el equipo cuando un plazo está en riesgo.",
    ],
  },

  // FRONTEND
  {
    slug: "fe-box-model",
    category: "FRONTEND",
    skillSlug: "css-layout",
    difficulty: "EASY",
    prompt: "¿Qué es el Box Model en CSS?",
    expectedAnswer:
      "El Box Model describe cómo se calcula el tamaño de cada elemento: contenido (content), relleno (padding), borde (border) y margen (margin), de dentro hacia afuera. Por defecto el ancho/alto que defines solo aplica al contenido (box-sizing: content-box), por lo que padding y border se suman al tamaño final; con box-sizing: border-box el padding y el border se incluyen dentro del ancho/alto definido, lo que suele ser más predecible.",
    concepts: ["content", "padding", "border", "margin", "box-sizing"],
    commonMistakes: [
      "Olvidar mencionar box-sizing y por qué cambia el cálculo del tamaño.",
      "Confundir margin con padding.",
    ],
  },
  {
    slug: "fe-flexbox-vs-grid",
    category: "FRONTEND",
    skillSlug: "css-grid",
    difficulty: "MEDIUM",
    prompt: "¿Cuál es la diferencia entre Flexbox y Grid, y cuándo usarías cada uno?",
    expectedAnswer:
      "Flexbox es unidimensional: distribuye elementos en una fila o columna, ideal para barras de navegación, alinear elementos dentro de un contenedor o repartir espacio en una sola dirección. Grid es bidimensional: define filas y columnas a la vez, ideal para maquetar el layout completo de una página o componentes con una estructura de cuadrícula clara. En la práctica se combinan: Grid para la estructura general, Flexbox para alinear contenido dentro de cada celda.",
    concepts: ["unidimensional", "bidimensional", "filas y columnas", "alineación"],
    commonMistakes: [
      "Decir que uno 'sustituye' al otro en vez de que se complementan.",
      "No poder dar un ejemplo de cuándo usar cada uno.",
    ],
  },
  {
    slug: "fe-virtual-dom",
    category: "FRONTEND",
    skillSlug: "react",
    difficulty: "MEDIUM",
    prompt: "¿Qué es el Virtual DOM y qué problema resuelve React con él?",
    expectedAnswer:
      "El Virtual DOM es una representación en memoria del DOM real, en forma de objetos JavaScript ligeros. Cuando el estado cambia, React construye un nuevo Virtual DOM, lo compara (diffing) con el anterior, y aplica al DOM real solo los cambios mínimos necesarios (reconciliación), en vez de re-renderizar todo el árbol. Esto hace que las actualizaciones de la interfaz sean más eficientes que manipular el DOM real directamente en cada cambio.",
    concepts: [
      "representación en memoria",
      "diffing",
      "reconciliación",
      "actualizaciones eficientes",
    ],
    commonMistakes: [
      "Decir que el Virtual DOM 'siempre es más rápido que el DOM real' sin explicar por qué (evita manipulaciones directas repetidas).",
      "No mencionar el proceso de diffing/reconciliación.",
    ],
  },
  {
    slug: "fe-event-loop",
    category: "FRONTEND",
    skillSlug: "async-javascript",
    difficulty: "HARD",
    prompt: "¿Cómo funciona el event loop en el navegador?",
    expectedAnswer:
      "JavaScript es de un solo hilo: el call stack ejecuta el código de forma síncrona. Las operaciones asíncronas (timers, peticiones de red, promesas) se delegan a APIs del navegador, y cuando terminan, sus callbacks se colocan en una cola (microtask queue para promesas, macrotask/callback queue para timers y eventos). El event loop revisa constantemente si el call stack está vacío y, si lo está, mueve la siguiente tarea de la cola al stack para ejecutarla — las microtareas (promesas) siempre se procesan antes que las macrotareas pendientes.",
    concepts: ["call stack", "microtask queue", "callback queue", "asíncrono"],
    commonMistakes: [
      "Pensar que setTimeout(fn, 0) ejecuta el callback inmediatamente.",
      "No distinguir entre microtareas (promesas) y macrotareas (timers, eventos).",
    ],
  },

  // BACKEND
  {
    slug: "be-middleware-express",
    category: "BACKEND",
    skillSlug: "express",
    difficulty: "EASY",
    prompt: "¿Qué es un middleware en Express y para qué se usa?",
    expectedAnswer:
      "Un middleware es una función que recibe (req, res, next) y se ejecuta en el medio del ciclo de vida de una petición HTTP, antes de que llegue al controlador final. Se usa para tareas transversales como autenticación, logging, validación de datos, manejo de CORS o parseo del body — cada middleware puede modificar la petición/respuesta o cortar la cadena, y debe llamar a next() para pasar el control al siguiente.",
    concepts: ["req res next", "ciclo de vida de la petición", "tareas transversales"],
    commonMistakes: [
      "Olvidar mencionar next() y cómo continúa la cadena de middlewares.",
      "Confundir middleware con controlador (el middleware normalmente no responde la petición final).",
    ],
  },
  {
    slug: "be-sql-injection",
    category: "BACKEND",
    skillSlug: "sql",
    difficulty: "MEDIUM",
    prompt: "¿Qué es una inyección SQL y cómo se previene?",
    expectedAnswer:
      "Una inyección SQL ocurre cuando la entrada de un usuario se concatena directamente en una consulta SQL, permitiendo que un atacante inserte código SQL propio (por ejemplo para leer datos que no debería o saltarse un login). Se previene usando siempre consultas parametrizadas o un ORM/query builder que separe los datos del código SQL, nunca concatenando strings con datos del usuario, y validando/saneando la entrada como capa adicional.",
    concepts: ["concatenación de strings", "consultas parametrizadas", "orm"],
    commonMistakes: [
      "Pensar que escapar comillas manualmente es suficiente en vez de usar consultas parametrizadas.",
      "No poder explicar por qué la concatenación de strings es el problema raíz.",
    ],
  },
  {
    slug: "be-autenticacion-vs-autorizacion",
    category: "BACKEND",
    skillSlug: "apis",
    difficulty: "EASY",
    prompt: "Explica la diferencia entre autenticación y autorización.",
    expectedAnswer:
      "La autenticación responde a '¿quién eres?': verificar la identidad de un usuario, normalmente con credenciales (email/contraseña, token). La autorización responde a '¿qué puedes hacer?': una vez identificado, decidir si ese usuario tiene permiso para realizar una acción concreta (por ejemplo, solo un ADMIN puede borrar un curso). Un sistema puede autenticar correctamente a un usuario y aun así denegarle una acción por falta de autorización.",
    concepts: ["identidad", "credenciales", "permisos", "quién eres vs qué puedes hacer"],
    commonMistakes: [
      "Usar los dos términos como sinónimos.",
      "No dar un ejemplo concreto de autorización basada en roles.",
    ],
  },
  {
    slug: "be-indices-base-de-datos",
    category: "BACKEND",
    skillSlug: "sql",
    difficulty: "MEDIUM",
    prompt: "¿Qué es un índice de base de datos y cuándo lo usarías?",
    expectedAnswer:
      "Un índice es una estructura de datos adicional (normalmente un árbol B) que la base de datos mantiene sobre una o varias columnas para acelerar las búsquedas, a cambio de espacio extra en disco y de un pequeño coste al escribir (insertar/actualizar también hay que actualizar el índice). Se usa en columnas que se consultan con frecuencia en cláusulas WHERE, JOIN u ORDER BY, especialmente en tablas grandes, pero no conviene indexar todo porque cada índice ralentiza las escrituras.",
    concepts: ["acelerar búsquedas", "coste en escrituras", "where join order by"],
    commonMistakes: [
      "Pensar que añadir índices siempre mejora el rendimiento sin ningún coste.",
      "No mencionar en qué columnas tiene sentido indexar (las que se filtran/ordenan con frecuencia).",
    ],
  },

  // FULL_STACK
  {
    slug: "fs-comunicacion-frontend-backend",
    category: "FULL_STACK",
    skillSlug: "apis",
    difficulty: "MEDIUM",
    prompt:
      "¿Cómo diseñarías la comunicación entre un frontend en React y un backend en Node/Express?",
    expectedAnswer:
      "El frontend hace peticiones HTTP (normalmente vía fetch o una librería como React Query) a endpoints REST expuestos por Express, que devuelven JSON. Es buena práctica centralizar la lógica de peticiones en un cliente API compartido, definir un formato de error consistente, versionar la API (por ejemplo /api/v1), y separar claramente qué datos vienen del servidor (fuente de verdad) de qué es solo estado local de la interfaz.",
    concepts: [
      "peticiones http",
      "json",
      "cliente api centralizado",
      "formato de error consistente",
    ],
    commonMistakes: [
      "No mencionar el manejo de errores ni los estados de carga.",
      "Mezclar lógica de fetch directamente dentro de los componentes en vez de centralizarla.",
    ],
  },
  {
    slug: "fs-cors",
    category: "FULL_STACK",
    skillSlug: "apis",
    difficulty: "MEDIUM",
    prompt: "¿Qué es CORS y por qué existe?",
    expectedAnswer:
      "CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad del navegador que por defecto bloquea que una página en un origen (dominio+puerto+protocolo) haga peticiones a un origen distinto, salvo que el servidor lo permita explícitamente mediante cabeceras como Access-Control-Allow-Origin. Existe para proteger a los usuarios de que un sitio malicioso haga peticiones autenticadas a otro sitio en su nombre. Se configura en el backend, indicando qué orígenes tienen permiso.",
    concepts: ["mismo origen", "cabeceras access-control", "seguridad del navegador"],
    commonMistakes: [
      "Pensar que CORS es una medida de seguridad del backend en vez de una restricción que aplica el navegador.",
      "Intentar 'arreglar' un error de CORS solo desde el frontend.",
    ],
  },
  {
    slug: "fs-estado-autenticacion",
    category: "FULL_STACK",
    skillSlug: "apis",
    difficulty: "HARD",
    prompt:
      "¿Cómo manejarías el estado de autenticación de un usuario en una aplicación full stack?",
    expectedAnswer:
      "Una buena respuesta describe: el backend emite un access token de corta duración (JWT) tras el login, y un refresh token de larga duración guardado en una cookie httpOnly (para que no sea accesible desde JavaScript y mitigar XSS). El frontend guarda el access token en memoria (no en localStorage, por riesgo de XSS) y lo envía en la cabecera Authorization; cuando expira, usa el refresh token (vía la cookie) para obtener uno nuevo de forma transparente.",
    concepts: ["access token", "refresh token", "cookie httponly", "xss"],
    commonMistakes: [
      "Guardar tokens sensibles en localStorage sin considerar el riesgo de XSS.",
      "No mencionar cómo se renueva la sesión cuando el access token expira.",
    ],
  },
  {
    slug: "fs-ciclo-vida-peticion",
    category: "FULL_STACK",
    skillSlug: "apis",
    difficulty: "MEDIUM",
    prompt:
      "Describe el ciclo de vida completo de una petición HTTP desde el navegador hasta la base de datos.",
    expectedAnswer:
      "El navegador envía una petición HTTP (por ejemplo un fetch) que llega al servidor; pasa por middlewares (CORS, autenticación, parseo del body), luego el router la dirige al controlador correspondiente, que valida la entrada y llama a un servicio con la lógica de negocio; el servicio usa un repositorio/ORM para consultar la base de datos, transforma el resultado en la forma de respuesta esperada, y el controlador la devuelve como JSON con el código de estado HTTP adecuado, que el frontend recibe y usa para actualizar la interfaz.",
    concepts: [
      "middlewares",
      "controlador",
      "servicio",
      "base de datos",
      "respuesta json",
    ],
    commonMistakes: [
      "Saltarse capas (ir directo de la ruta a la base de datos) sin mencionar validación ni lógica de negocio.",
      "No mencionar los códigos de estado HTTP en la respuesta.",
    ],
  },

  // IT_SUPPORT
  {
    slug: "it-internet-no-funciona",
    category: "IT_SUPPORT",
    skillSlug: "networking",
    difficulty: "EASY",
    prompt:
      'Un usuario dice que "internet no funciona". ¿Qué pasos seguirías para diagnosticar el problema?',
    expectedAnswer:
      "Un buen diagnóstico sigue un orden de lo más simple a lo más complejo: primero confirmar qué significa exactamente 'no funciona' (¿ninguna web carga? ¿solo una?), comprobar la conexión física/Wi-Fi del equipo, verificar si otros dispositivos en la misma red tienen el mismo problema (para saber si es del equipo o del router/ISP), reiniciar el router si hace falta, y revisar la configuración de red (IP, DNS) del equipo si el problema persiste solo ahí.",
    concepts: [
      "aislar el problema",
      "otros dispositivos",
      "reiniciar router",
      "configuración de red",
    ],
    commonMistakes: [
      "Saltar directamente a reinstalar el sistema operativo sin diagnosticar primero.",
      "No comprobar si el problema afecta a un solo dispositivo o a toda la red.",
    ],
  },
  {
    slug: "it-explicar-vpn",
    category: "IT_SUPPORT",
    skillSlug: "networking",
    difficulty: "EASY",
    prompt: "¿Cómo explicarías a un usuario no técnico qué es una VPN?",
    expectedAnswer:
      "Una buena respuesta usa una analogía simple: una VPN es como un túnel privado y cifrado entre tu dispositivo y un servidor, de forma que nadie en el camino (por ejemplo en una red Wi-Fi pública) puede ver qué estás haciendo, y además tu conexión parece venir de otro lugar. Es importante adaptar el lenguaje: evitar tecnicismos como 'túnel IPsec' y centrarse en el beneficio (privacidad, acceso seguro) que entiende un usuario no técnico.",
    concepts: ["analogía simple", "privacidad", "cifrado", "lenguaje no técnico"],
    commonMistakes: [
      "Usar jerga técnica (protocolos, cifrado asimétrico) con un usuario que pidió una explicación simple.",
      "No dar ninguna analogía o ejemplo cotidiano.",
    ],
  },
  {
    slug: "it-ordenador-no-arranca",
    category: "IT_SUPPORT",
    skillSlug: "debugging",
    difficulty: "MEDIUM",
    prompt: "¿Qué harías si un ordenador no arranca y no muestra nada en pantalla?",
    expectedAnswer:
      "Un buen diagnóstico descarta causas de lo más común a lo menos común: comprobar que el equipo recibe corriente (cable, enchufe, fuente de alimentación), comprobar que el monitor está encendido y bien conectado (a veces el problema es el monitor, no el PC), escuchar si el equipo hace algún sonido/pitido al encender (indicador de un problema de hardware concreto), y si nada de eso funciona, revisar la memoria RAM y las conexiones internas.",
    concepts: ["descartar hardware básico", "monitor vs pc", "sonidos de arranque"],
    commonMistakes: [
      "Asumir directamente que es un problema grave de placa base sin descartar antes lo más simple (cables, monitor).",
      "No comprobar si el problema es del monitor y no del propio ordenador.",
    ],
  },
  {
    slug: "it-priorizar-tickets",
    category: "IT_SUPPORT",
    skillSlug: "communication",
    difficulty: "MEDIUM",
    prompt:
      "¿Cómo gestionarías una cola de varios tickets de soporte con distinta prioridad al mismo tiempo?",
    expectedAnswer:
      "Una buena respuesta prioriza según impacto (cuántas personas afectadas, si bloquea trabajo crítico) y urgencia, no solo por orden de llegada. Menciona comunicar tiempos de espera realistas a los usuarios con tickets de menor prioridad, documentar cada ticket para no perder contexto al cambiar entre ellos, y escalar los que superen el propio conocimiento en vez de bloquearse intentando resolverlos solo.",
    concepts: [
      "impacto y urgencia",
      "comunicar tiempos de espera",
      "escalar cuando corresponde",
    ],
    commonMistakes: [
      "Priorizar solo por orden de llegada sin considerar el impacto real.",
      "No mencionar cuándo escalar un ticket a otra persona con más experiencia.",
    ],
  },
];

interface InterviewSeed {
  slug: string;
  title: string;
  category: QuestionSeed["category"];
  durationMinutes: number;
  questionSlugs: string[];
}

const INTERVIEWS: InterviewSeed[] = [
  {
    slug: "entrevista-tecnica-general",
    title: "Entrevista Técnica General",
    category: "TECHNICAL",
    durationMinutes: 20,
    questionSlugs: [
      "tech-equality-operators-js",
      "tech-rest-api-principles",
      "tech-closures-js",
      "tech-sql-vs-nosql",
    ],
  },
  {
    slug: "entrevista-comportamental",
    title: "Entrevista de Comportamiento (Behavioral)",
    category: "BEHAVIORAL",
    durationMinutes: 20,
    questionSlugs: [
      "behav-conflicto-equipo",
      "behav-aprender-rapido",
      "behav-error-y-aprendizaje",
      "behav-priorizar-tareas",
    ],
  },
  {
    slug: "entrevista-frontend",
    title: "Entrevista Frontend",
    category: "FRONTEND",
    durationMinutes: 25,
    questionSlugs: [
      "fe-box-model",
      "fe-flexbox-vs-grid",
      "fe-virtual-dom",
      "fe-event-loop",
    ],
  },
  {
    slug: "entrevista-backend",
    title: "Entrevista Backend",
    category: "BACKEND",
    durationMinutes: 25,
    questionSlugs: [
      "be-middleware-express",
      "be-sql-injection",
      "be-autenticacion-vs-autorizacion",
      "be-indices-base-de-datos",
    ],
  },
  {
    slug: "entrevista-full-stack",
    title: "Entrevista Full Stack",
    category: "FULL_STACK",
    durationMinutes: 30,
    questionSlugs: [
      "fs-comunicacion-frontend-backend",
      "fs-cors",
      "fs-estado-autenticacion",
      "fs-ciclo-vida-peticion",
    ],
  },
  {
    slug: "entrevista-it-support",
    title: "Entrevista de IT Support",
    category: "IT_SUPPORT",
    durationMinutes: 20,
    questionSlugs: [
      "it-internet-no-funciona",
      "it-explicar-vpn",
      "it-ordenador-no-arranca",
      "it-priorizar-tickets",
    ],
  },
];

export async function seedInterviews(): Promise<number> {
  const questionIdBySlug = new Map<string, string>();

  for (const q of QUESTIONS) {
    const skill = q.skillSlug
      ? await prisma.skill.findUnique({ where: { slug: q.skillSlug } })
      : null;

    const question = await prisma.interviewQuestion.upsert({
      where: { slug: q.slug },
      update: {
        category: q.category,
        skillId: skill?.id,
        difficulty: q.difficulty,
        prompt: q.prompt,
        expectedAnswer: q.expectedAnswer,
        concepts: q.concepts,
        commonMistakes: q.commonMistakes,
      },
      create: {
        slug: q.slug,
        category: q.category,
        skillId: skill?.id,
        difficulty: q.difficulty,
        prompt: q.prompt,
        expectedAnswer: q.expectedAnswer,
        concepts: q.concepts,
        commonMistakes: q.commonMistakes,
      },
    });
    questionIdBySlug.set(q.slug, question.id);
  }

  for (const i of INTERVIEWS) {
    const interview = await prisma.interview.upsert({
      where: { slug: i.slug },
      update: {
        title: i.title,
        category: i.category,
        durationMinutes: i.durationMinutes,
      },
      create: {
        slug: i.slug,
        title: i.title,
        category: i.category,
        durationMinutes: i.durationMinutes,
      },
    });

    for (const [index, questionSlug] of i.questionSlugs.entries()) {
      const questionId = questionIdBySlug.get(questionSlug);
      if (!questionId)
        throw new Error(`Pregunta de entrevista desconocida: ${questionSlug}`);
      await prisma.interviewTemplateQuestion.upsert({
        where: { interviewId_questionId: { interviewId: interview.id, questionId } },
        update: { order: index + 1 },
        create: { interviewId: interview.id, questionId, order: index + 1 },
      });
    }
  }

  console.log(
    `  ✔ ${QUESTIONS.length} preguntas de entrevista y ${INTERVIEWS.length} plantillas (Technical/Behavioral/Frontend/Backend/Full Stack/IT Support)`,
  );
  return QUESTIONS.length;
}
