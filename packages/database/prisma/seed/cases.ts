import { prisma } from "../../src/client.js";

/**
 * Secciones 23/25/26/27 de SPEC.md: Debugging Lab, IT Support, Networking y
 * Simulador de Producción. Se siembran 14 casos reales (no plantillas
 * vacías) repartidos entre los 4 tipos — igual decisión de alcance que el
 * resto del contenido (ver docs/CONTENT_BACKLOG.md): menos casos, pero cada
 * uno con síntomas/entorno/logs/opciones/pistas/explicación reales y
 * verificables, en vez de los 40+40+25 casos mínimos de la sección 68.
 */
interface CaseSeed {
  slug: string;
  kind: "DEBUGGING" | "IT_SUPPORT" | "NETWORKING" | "PRODUCTION_INCIDENT";
  domain:
    | "HTML"
    | "CSS"
    | "JAVASCRIPT"
    | "GIT"
    | "IT_HARDWARE"
    | "IT_WINDOWS"
    | "IT_NETWORKING"
    | "IT_ACCOUNTS"
    | "NETWORKING"
    | "PRODUCTION";
  severity?: "P0" | "P1" | "P2" | "P3";
  skillSlug?: string;
  title: string;
  symptoms: string;
  environment: string;
  code?: string;
  logs?: string;
  expected: string;
  actual: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  hints: [string, string, string];
  explanation: string;
  points: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

const CASES: CaseSeed[] = [
  {
    slug: "debug-html-footer-en-sidebar",
    kind: "DEBUGGING",
    domain: "HTML",
    skillSlug: "html-fundamentals",
    title: "El pie de página aparece dentro de la barra lateral",
    symptoms:
      "El <footer> se está renderizando visualmente dentro de la sección <aside>, con el mismo fondo gris y la misma sangría, aunque en el HTML aparecen como elementos hermanos.",
    environment: "HTML5 estático, sin CSS de posicionamiento absoluto ni flotantes.",
    code: `<div class="layout">
  <aside class="sidebar">
    <nav>Menú</nav>
  <main class="content">
    <h1>Artículo</h1>
    <p>Contenido del artículo...</p>
  </main>
</div>
<footer>© 2026 Mi sitio</footer>`,
    expected:
      "El footer debería aparecer como un bloque independiente, fuera de la barra lateral.",
    actual:
      "El footer (y el main) se muestran con el fondo y la sangría de la barra lateral.",
    options: [
      { id: "a", label: "Falta la etiqueta de cierre </aside> antes de <main>" },
      { id: "b", label: 'El <footer> debería estar dentro de <div class="layout">' },
      {
        id: "c",
        label:
          "Los navegadores no permiten anidar <main> dentro de <aside>, hay que usar JavaScript",
      },
      { id: "d", label: "El problema es el orden de los atributos class" },
    ],
    correctOptionId: "a",
    hints: [
      "Cuenta las etiquetas de apertura y cierre de <aside>: ¿coinciden?",
      "Los navegadores son permisivos: si no cierras una etiqueta, el contenido siguiente puede quedar anidado dentro de ella sin avisarte con ningún error.",
      "Falta un </aside> justo después de <nav>Menú</nav>.",
    ],
    explanation:
      "El navegador nunca marca error cuando falta una etiqueta de cierre: simplemente sigue anidando el contenido siguiente dentro del último elemento abierto. Aquí, como <aside> nunca se cierra, <main> (y con él, todo lo que sigue en el flujo) queda dentro de <aside>, heredando sus estilos visuales. La solución es añadir </aside> justo después de <nav>Menú</nav>.",
    points: 15,
    difficulty: "EASY",
  },
  {
    slug: "debug-css-boton-no-centrado",
    kind: "DEBUGGING",
    domain: "CSS",
    skillSlug: "flexbox",
    title: "El botón no se centra horizontalmente",
    symptoms:
      "El botón debería quedar centrado horizontalmente dentro de su contenedor flex, pero aparece pegado al borde izquierdo.",
    environment: "CSS con Flexbox, contenedor con display: flex.",
    code: `.toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
}`,
    expected: "El botón aparece centrado horizontalmente en la barra.",
    actual: "El botón aparece pegado al borde izquierdo de la barra.",
    options: [
      {
        id: "a",
        label:
          "Falta justify-content: center (align-items solo centra en el eje transversal)",
      },
      { id: "b", label: "Hay que quitar display: flex" },
      {
        id: "c",
        label: "El botón necesita margin: auto en vez de cualquier propiedad flex",
      },
      {
        id: "d",
        label: "Flexbox no puede centrar contenido horizontalmente, solo verticalmente",
      },
    ],
    correctOptionId: "a",
    hints: [
      "En un contenedor flex con flex-direction: row hay dos ejes: principal (horizontal) y transversal (vertical). ¿Qué propiedad controla cada uno?",
      "align-items centra en el eje transversal (aquí, vertical). Para el eje principal (horizontal) se usa otra propiedad distinta.",
      "La propiedad que falta es justify-content: center.",
    ],
    explanation:
      "align-items controla la alineación en el eje transversal (perpendicular a flex-direction), mientras que justify-content controla el eje principal (la misma dirección que flex-direction). Como flex-direction es row, el eje principal es horizontal, así que centrar horizontalmente requiere justify-content: center, no align-items.",
    points: 15,
    difficulty: "EASY",
  },
  {
    slug: "debug-js-total-undefined",
    kind: "DEBUGGING",
    domain: "JAVASCRIPT",
    skillSlug: "async-javascript",
    title: "El precio final se muestra como undefined",
    symptoms:
      "Al pulsar 'Calcular total', la página muestra 'El total es: undefined' en vez de un número.",
    environment: "JavaScript en el navegador, fetch a una API que devuelve el precio.",
    code: `function calcularTotal() {
  let total;
  fetch("/api/precio")
    .then(res => res.json())
    .then(data => {
      total = data.precio;
    });
  console.log("El total es: " + total);
}`,
    logs: "Consola: 'El total es: undefined' aparece de inmediato; unos milisegundos después no hay ningún otro mensaje.",
    expected: "Debería mostrar 'El total es: 49.99' (o el precio real).",
    actual: "Muestra 'El total es: undefined'.",
    options: [
      {
        id: "a",
        label: "El console.log se ejecuta antes de que la promesa del fetch se resuelva",
      },
      { id: "b", label: "data.precio no existe en la respuesta de la API" },
      { id: "c", label: "Hace falta usar var en vez de let para total" },
      { id: "d", label: "fetch no funciona con rutas relativas como /api/precio" },
    ],
    correctOptionId: "a",
    hints: [
      "fetch es asíncrono: ¿en qué orden se ejecutan realmente las líneas de este código?",
      "El console.log de la última línea no espera a que termine el .then(...) de arriba.",
      "La solución es mover el console.log dentro del segundo .then(), o usar async/await con un await fetch(...).",
    ],
    explanation:
      "fetch() devuelve una promesa inmediatamente y el código sigue ejecutándose sin esperar a que la respuesta llegue. Por eso console.log('El total es: ' + total) se ejecuta ANTES de que total reciba su valor dentro del .then(). Para arreglarlo, el código que depende de total debe ir dentro del .then() donde se asigna, o la función debe reescribirse con async/await.",
    points: 20,
    difficulty: "MEDIUM",
  },
  {
    slug: "debug-git-cambios-no-visibles",
    kind: "DEBUGGING",
    domain: "GIT",
    skillSlug: "git",
    title: "El equipo no ve mis cambios después de hacer push",
    symptoms:
      "Hice cambios, los confirmé y los subí con git push, pero mis compañeros dicen que no ven los archivos nuevos en el repositorio remoto.",
    environment: "Terminal, repositorio Git con GitHub como remoto.",
    logs: `$ git status
On branch feature/login
nothing to commit, working tree clean
$ git push
Everything up-to-date`,
    expected: "Los compañeros deberían ver los cambios en la rama principal del remoto.",
    actual:
      "git push dice 'Everything up-to-date' pero los compañeros no ven nada nuevo.",
    options: [
      {
        id: "a",
        label:
          "Los cambios están confirmados en feature/login, pero nadie ha hecho merge de esa rama a main",
      },
      { id: "b", label: "git push está roto, hay que reinstalar Git" },
      { id: "c", label: "Hay que hacer git push --force para que se suban los cambios" },
      {
        id: "d",
        label:
          "El repositorio remoto tiene un límite de tamaño y rechaza los cambios en silencio",
      },
    ],
    correctOptionId: "a",
    hints: [
      "'Everything up-to-date' significa que Git sí subió los commits. La pregunta es: ¿a qué rama?",
      "Mira la primera línea de git status: ¿en qué rama se estaba trabajando?",
      "Los compañeros probablemente están mirando 'main', pero los commits están en 'feature/login'. Falta abrir un Pull Request y hacer merge.",
    ],
    explanation:
      "git push subió correctamente los commits, pero a la rama feature/login, no a main. Si los compañeros están revisando la rama main del remoto, no verán los cambios hasta que se abra un Pull Request de feature/login hacia main y se haga merge. No hay ningún error técnico: es un malentendido sobre en qué rama vive el trabajo.",
    points: 15,
    difficulty: "EASY",
  },
  {
    slug: "it-hardware-portatil-no-enciende",
    kind: "IT_SUPPORT",
    domain: "IT_HARDWARE",
    title: "El portátil no enciende",
    symptoms:
      "El usuario reporta: 'Pulso el botón de encendido y no pasa nada, ni la luz se enciende.'",
    environment:
      "Portátil de empresa; el usuario dice que ayer funcionaba con normalidad.",
    logs: "Ticket del usuario: 'Lo dejé cargando toda la noche enchufado a la pared y esta mañana no enciende ni con el cable puesto.'",
    expected: "El portátil debería encender al pulsar el botón.",
    actual: "No hay ninguna luz ni respuesta al pulsar el botón de encendido.",
    options: [
      {
        id: "a",
        label:
          "Probar con otro cable/cargador y otro enchufe antes de asumir que la placa está dañada",
      },
      {
        id: "b",
        label:
          "Pedir un portátil nuevo directamente, seguro que la placa base está frita",
      },
      { id: "c", label: "Reinstalar el sistema operativo desde un USB booteable" },
      {
        id: "d",
        label: "Decirle al usuario que actualice los drivers de la tarjeta gráfica",
      },
    ],
    correctOptionId: "a",
    hints: [
      "Antes de sospechar de un fallo grave de hardware, ¿qué es lo más simple y rápido de comprobar?",
      "El usuario dice que 'ni la luz se enciende': eso apunta a un problema de alimentación, no del sistema operativo.",
      "El primer paso ante 'no enciende' es descartar el cargador y el enchufe probando con otros que sepamos que funcionan.",
    ],
    explanation:
      "En soporte IT, el principio es descartar primero lo más simple y probable. Un portátil que no da ninguna señal de vida (ni luces) casi siempre apunta a un problema de alimentación: cargador defectuoso, cable dañado o enchufe sin corriente. Reinstalar el sistema operativo o pedir hardware nuevo son pasos prematuros y costosos que solo tienen sentido después de confirmar que el equipo sí recibe alimentación.",
    points: 10,
    difficulty: "EASY",
  },
  {
    slug: "it-windows-disco-al-100",
    kind: "IT_SUPPORT",
    domain: "IT_WINDOWS",
    title: "El ordenador va muy lento",
    symptoms:
      "El usuario dice que Windows tarda minutos en abrir cualquier programa desde ayer.",
    environment: "Windows 11, portátil de oficina con 3 años de uso.",
    logs: "Administrador de tareas: CPU 15%, memoria RAM 40%, uso de disco 100% de forma constante.",
    expected: "Los programas deberían abrir en segundos.",
    actual:
      "Los programas tardan minutos en abrir; el disco está al 100% de uso constantemente.",
    options: [
      {
        id: "a",
        label:
          "El disco al 100% sostenido (no CPU ni RAM) apunta a un proceso en segundo plano saturándolo (Windows Update, antivirus o indexado)",
      },
      {
        id: "b",
        label:
          "Hay que comprar más memoria RAM, el problema es que el 40% ya es demasiado",
      },
      {
        id: "c",
        label: "El procesador está sobrecalentado, hay que cambiar la pasta térmica",
      },
      { id: "d", label: "Es un virus, hay que formatear el equipo inmediatamente" },
    ],
    correctOptionId: "a",
    hints: [
      "Fíjate en cuál de los tres recursos (CPU, RAM, disco) está realmente saturado según el Administrador de tareas.",
      "CPU al 15% y RAM al 40% son valores normales. El disco al 100% sostenido es la pista real.",
      "En la pestaña 'Disco' del Administrador de tareas se puede ver qué proceso concreto genera esa actividad (a menudo Windows Update, el antivirus indexando, o el buscador de Windows).",
    ],
    explanation:
      "Un disco al 100% de uso sostenido, con CPU y RAM en valores normales, casi siempre indica un proceso en segundo plano leyendo/escribiendo intensivamente: actualizaciones descargándose e instalándose, un análisis completo del antivirus, o el indexado de búsqueda reconstruyéndose. La solución es identificar ese proceso en la pestaña 'Disco' del Administrador de tareas antes de tomar medidas drásticas como formatear o comprar hardware nuevo.",
    points: 15,
    difficulty: "MEDIUM",
  },
  {
    slug: "it-networking-sin-internet-con-red-local",
    kind: "IT_SUPPORT",
    domain: "IT_NETWORKING",
    skillSlug: "networking",
    title: "No hay internet pero sí acceso a la carpeta compartida",
    symptoms:
      "El usuario puede acceder a los archivos compartidos de la oficina, pero ninguna página web carga en el navegador.",
    environment: "Red de oficina, Windows 10, conexión por cable Ethernet.",
    logs: "ping 192.168.1.1 (router) → responde correctamente. ping google.com → 'No se puede encontrar la dirección IP del servidor'.",
    expected: "El usuario debería poder navegar por internet con normalidad.",
    actual: "Las páginas web no cargan, aunque la red local sí funciona.",
    options: [
      {
        id: "a",
        label:
          "El acceso a la red local funciona pero falla la resolución de nombres (DNS) hacia internet",
      },
      { id: "b", label: "El cable de red está dañado" },
      { id: "c", label: "El navegador está desactualizado y hay que reinstalarlo" },
      { id: "d", label: "El firewall de Windows está bloqueando todo el tráfico de red" },
    ],
    correctOptionId: "a",
    hints: [
      "Si el ping al router funciona, la conexión física y la red local están bien. ¿Qué falla entonces, específicamente?",
      "El error del segundo ping dice 'no se puede encontrar la dirección IP', no 'tiempo de espera agotado'. Esa es una pista sobre qué servicio falla.",
      "Ese mensaje es típico de un fallo de DNS: el sistema no logra traducir 'google.com' a una dirección IP.",
    ],
    explanation:
      "El ping exitoso al router confirma que la conectividad física y la red local funcionan. El ping fallido a google.com con el mensaje 'no se puede encontrar la dirección IP' (en vez de un timeout) es la firma típica de un problema de DNS. La solución habitual es revisar o cambiar el servidor DNS configurado (por ejemplo a 8.8.8.8) o ejecutar ipconfig /flushdns.",
    points: 20,
    difficulty: "MEDIUM",
  },
  {
    slug: "it-accounts-contrasena-incorrecta",
    kind: "IT_SUPPORT",
    domain: "IT_ACCOUNTS",
    title: "No puedo iniciar sesión, dice que la contraseña es incorrecta",
    symptoms:
      "El usuario jura que escribe la contraseña correctamente pero el sistema la rechaza cada vez.",
    environment: "Windows, inicio de sesión de dominio corporativo.",
    logs: "El usuario dice: 'Escribo la misma contraseña que uso desde hace meses. Antes de ayer funcionaba perfectamente.'",
    expected: "El usuario debería poder iniciar sesión con su contraseña habitual.",
    actual: "El sistema rechaza la contraseña como incorrecta en cada intento.",
    options: [
      {
        id: "a",
        label:
          "Comprobar si Bloq Mayús está activado, ya que las contraseñas distinguen mayúsculas de minúsculas",
      },
      {
        id: "b",
        label: "La cuenta ha sido hackeada, hay que avisar a seguridad inmediatamente",
      },
      { id: "c", label: "El teclado está roto y hay que sustituirlo" },
      { id: "d", label: "Windows tiene un error interno y hace falta reinstalarlo" },
    ],
    correctOptionId: "a",
    hints: [
      "¿Qué comprobación simple y rápida se hace siempre antes de asumir que la contraseña realmente cambió?",
      "Las contraseñas distinguen mayúsculas de minúsculas: una tecla del teclado puede alterar silenciosamente lo que se escribe.",
      "Revisa si Bloq Mayús está activado, especialmente si el usuario cambió de teclado o portátil recientemente.",
    ],
    explanation:
      "Antes de investigar causas más graves (cuenta bloqueada, contraseña caducada, cuenta comprometida), el primer paso estándar ante 'la contraseña es incorrecta' es verificar Bloq Mayús: como las contraseñas distinguen mayúsculas de minúsculas, tenerlo activado sin darse cuenta produce exactamente este síntoma, y es rápido de comprobar.",
    points: 10,
    difficulty: "EASY",
  },
  {
    slug: "net-ping-ip-si-dominio-no",
    kind: "NETWORKING",
    domain: "NETWORKING",
    skillSlug: "networking",
    title: "Ping por IP funciona pero por nombre de dominio no",
    symptoms: "ping 8.8.8.8 responde correctamente, pero ping google.com falla.",
    environment: "Red doméstica.",
    logs: "ping 8.8.8.8 → 4 paquetes enviados, 4 recibidos. ping google.com → 'No se pudo encontrar el host google.com'.",
    expected: "Ambos comandos deberían funcionar si hay conexión a internet.",
    actual: "Solo funciona el ping por dirección IP directa.",
    options: [
      {
        id: "a",
        label:
          "Es un problema de resolución DNS: el nombre de dominio no se está traduciendo a IP",
      },
      {
        id: "b",
        label: "8.8.8.8 y google.com son servidores distintos, es normal que uno falle",
      },
      {
        id: "c",
        label: "Hay que reiniciar el router para regenerar la tabla de enrutamiento",
      },
      {
        id: "d",
        label:
          "El firewall bloquea específicamente los nombres de dominio pero no las IPs",
      },
    ],
    correctOptionId: "a",
    hints: [
      "¿Qué hace exactamente un servidor DNS? ¿Qué paso falta cuando escribes 'google.com' en vez de una IP?",
      "Si la IP funciona, la conectividad de red está bien. El fallo está en un nivel más arriba.",
      "DNS traduce nombres como 'google.com' a direcciones IP. Si ese servicio falla, los nombres no resuelven aunque las IPs sí funcionen.",
    ],
    explanation:
      "DNS es el servicio responsable de traducir nombres de dominio legibles por humanos a direcciones IP que usan los routers para enrutar el tráfico. Que ping funcione con una IP directa pero no con un nombre de dominio aísla el problema exactamente a la resolución DNS. La solución típica es cambiar el DNS del sistema a uno público conocido (8.8.8.8 o 1.1.1.1).",
    points: 15,
    difficulty: "EASY",
  },
  {
    slug: "net-ip-sin-gateway",
    kind: "NETWORKING",
    domain: "NETWORKING",
    skillSlug: "networking",
    title: "El dispositivo tiene IP pero no navega",
    symptoms:
      "El portátil muestra una IP asignada (192.168.1.45) y máscara de subred correctos, pero ninguna página carga.",
    environment: "Red de oficina con router/gateway en 192.168.1.1.",
    logs: "ipconfig → IPv4: 192.168.1.45, Máscara: 255.255.255.0, Puerta de enlace: (en blanco). ping 192.168.1.1 → tiempo de espera agotado.",
    expected: "Debería poder navegar por internet usando el gateway de la red.",
    actual: "No hay puerta de enlace configurada, y el ping al router falla.",
    options: [
      {
        id: "a",
        label:
          "Falta la puerta de enlace (gateway) predeterminada: sin ella no hay forma de salir de la red local",
      },
      {
        id: "b",
        label: "La máscara de subred 255.255.255.0 es incorrecta para esta red",
      },
      { id: "c", label: "La dirección IP 192.168.1.45 está fuera de rango" },
      { id: "d", label: "El problema es que el dispositivo usa IPv4 en vez de IPv6" },
    ],
    correctOptionId: "a",
    hints: [
      "Compara los tres datos de red de ipconfig: IP, máscara y puerta de enlace. ¿Cuál falta?",
      "La puerta de enlace es la 'puerta de salida' de la red local hacia el resto de internet.",
      "Sin puerta de enlace, el dispositivo se comunica dentro de su propia red local, pero no tiene forma de enviar tráfico fuera de ella.",
    ],
    explanation:
      "La puerta de enlace predeterminada es la dirección a la que un dispositivo envía todo el tráfico destinado a redes fuera de la suya. Tener IP y máscara válidas pero ninguna puerta de enlace configurada explica exactamente este síntoma: la LAN funciona pero nada externo es alcanzable. Se soluciona configurando el gateway (normalmente la IP del router) o revisando por qué el DHCP no lo asignó.",
    points: 20,
    difficulty: "MEDIUM",
  },
  {
    slug: "net-localhost-si-red-no",
    kind: "NETWORKING",
    domain: "NETWORKING",
    skillSlug: "networking",
    title: "La web funciona en localhost pero no desde otro ordenador de la red",
    symptoms:
      "Un servidor en http://localhost:3000 funciona perfectamente. Un compañero en la misma red accede a http://192.168.1.20:3000 y la conexión se rechaza.",
    environment: "Red local de oficina, servidor Node.js/Express en desarrollo.",
    logs: "Compañero: 'ERR_CONNECTION_REFUSED' al intentar acceder desde su navegador.",
    expected:
      "El compañero debería poder acceder al servidor usando la IP de la máquina en la red local.",
    actual:
      "La conexión es rechazada desde cualquier máquina que no sea la que ejecuta el servidor.",
    options: [
      {
        id: "a",
        label:
          "El firewall del sistema operativo bloquea conexiones entrantes al puerto 3000 desde fuera de la propia máquina",
      },
      {
        id: "b",
        label: "El servidor Node.js no soporta múltiples conexiones simultáneas",
      },
      { id: "c", label: "El compañero necesita estar conectado por cable, no por WiFi" },
      {
        id: "d",
        label:
          "Node.js solo permite conexiones desde localhost por diseño, es imposible cambiarlo",
      },
    ],
    correctOptionId: "a",
    hints: [
      "'localhost' y la IP de red apuntan a la misma máquina física. Si uno funciona y el otro no, ¿qué capa intermedia podría estar filtrando el tráfico?",
      "ERR_CONNECTION_REFUSED significa que la conexión llega a la máquina pero algo la rechaza activamente, no es un problema de enrutamiento.",
      "Revisa las reglas de entrada del firewall para el puerto en cuestión.",
    ],
    explanation:
      "Cuando localhost funciona pero la IP de red no, el firewall del sistema operativo suele permitir conexiones locales por defecto pero bloquear conexiones entrantes desde otras máquinas de la red a menos que exista una regla explícita. La solución es crear una regla de firewall que permita tráfico entrante en el puerto usado.",
    points: 20,
    difficulty: "MEDIUM",
  },
  {
    slug: "prod-funciona-en-local-no-en-produccion",
    kind: "PRODUCTION_INCIDENT",
    domain: "PRODUCTION",
    severity: "P1",
    skillSlug: "debugging",
    title: "Funciona en local pero no en producción",
    symptoms:
      "La aplicación funciona perfectamente en el entorno de desarrollo del programador, pero al desplegar a producción, todas las peticiones a la base de datos fallan.",
    environment: "Node.js + Express + PostgreSQL, desplegado en un servidor en la nube.",
    logs: "Error: connect ECONNREFUSED 127.0.0.1:5432\n    at TCPConnectWrap.afterConnect",
    expected: "La aplicación debería conectarse a la base de datos de producción.",
    actual:
      "Falla al conectar a 127.0.0.1:5432 (localhost), que no existe en el servidor de producción.",
    options: [
      {
        id: "a",
        label:
          "La variable de entorno DATABASE_URL no se configuró en producción, así que el código usa un valor por defecto de localhost",
      },
      { id: "b", label: "PostgreSQL no está instalado en el servidor de producción" },
      {
        id: "c",
        label:
          "El código tiene un bug y hay que reescribir la conexión a la base de datos",
      },
      { id: "d", label: "El servidor de producción no tiene suficiente memoria RAM" },
    ],
    correctOptionId: "a",
    hints: [
      "El error dice que intenta conectar a 127.0.0.1 (localhost). ¿Por qué el código de producción intentaría conectar a 'sí mismo'?",
      "Es habitual que el código tenga un valor por defecto para desarrollo local cuando no encuentra cierta configuración.",
      "Revisa si DATABASE_URL está definida en la configuración del servidor de producción, no solo en el .env local que nunca se sube al repositorio.",
    ],
    explanation:
      "Este es uno de los incidentes de 'funciona en mi máquina' más comunes: el código lee la URL de conexión de una variable de entorno, y cuando esa variable no existe, cae a un valor por defecto pensado solo para desarrollo local. El archivo .env con la configuración real casi nunca se sube al repositorio, así que es fácil olvidar configurar esas mismas variables en el proveedor de hosting.",
    points: 25,
    difficulty: "MEDIUM",
  },
  {
    slug: "prod-500-intermitentes-bajo-carga",
    kind: "PRODUCTION_INCIDENT",
    domain: "PRODUCTION",
    severity: "P1",
    skillSlug: "debugging",
    title: "Errores 500 intermitentes bajo carga",
    symptoms:
      "Durante las horas de más tráfico, un porcentaje de las peticiones a la API devuelve error 500. Fuera de horas punta, todo funciona con normalidad.",
    environment:
      "API Node.js con un pool de conexiones a PostgreSQL, tráfico variable a lo largo del día.",
    logs: "Error: sorry, too many clients already\n    at Connection.parseE (pg/lib/connection.js)\n\nError: timeout exceeded when trying to connect (pool)",
    expected: "La API debería manejar picos de tráfico sin fallar.",
    actual:
      "Bajo carga alta, las peticiones empiezan a fallar con errores relacionados con el pool de conexiones.",
    options: [
      {
        id: "a",
        label:
          "El pool de conexiones a la base de datos se está agotando: hay más peticiones simultáneas que conexiones disponibles",
      },
      { id: "b", label: "El servidor necesita más núcleos de CPU" },
      { id: "c", label: "Hay un ataque DDoS en curso" },
      { id: "d", label: "El código JavaScript tiene una fuga de memoria (memory leak)" },
    ],
    correctOptionId: "a",
    hints: [
      "Los mensajes de error mencionan explícitamente 'too many clients' y 'timeout... pool'. ¿A qué recurso concreto se refieren?",
      "Un pool de conexiones tiene un número máximo configurado de conexiones simultáneas. ¿Qué pasa cuando se pide una y no queda ninguna libre?",
      "Bajo carga alta, si el pool está mal dimensionado o las conexiones no se liberan correctamente, las peticiones nuevas esperan hasta hacer timeout.",
    ],
    explanation:
      "El pool de conexiones limita cuántas conexiones simultáneas a la base de datos puede tener la aplicación. 'too many clients already' y 'timeout... pool' son la firma clásica de un pool agotado bajo tráfico alto. Las soluciones típicas son aumentar el tamaño del pool con cuidado, liberar correctamente cada conexión tras usarla, y añadir reintentos/colas para picos de tráfico.",
    points: 30,
    difficulty: "HARD",
  },
  {
    slug: "prod-cors-solo-en-produccion",
    kind: "PRODUCTION_INCIDENT",
    domain: "PRODUCTION",
    severity: "P2",
    skillSlug: "debugging",
    title: "Error de CORS solo en producción",
    symptoms:
      "El frontend, desplegado en https://miapp.com, no puede hacer peticiones a la API en https://api.miapp.com. En desarrollo local, todo funciona sin problema.",
    environment: "Frontend en Vercel, API en un servidor Node.js/Express aparte.",
    logs: "Access to fetch at 'https://api.miapp.com/data' from origin 'https://miapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
    expected:
      "El frontend de producción debería poder consumir la API de producción con normalidad.",
    actual:
      "El navegador bloquea las peticiones con un error de CORS, solo en producción.",
    options: [
      {
        id: "a",
        label:
          "El middleware CORS del backend solo tiene configurado localhost como origen permitido, no el dominio real de producción",
      },
      {
        id: "b",
        label: "HTTPS no es compatible con peticiones fetch entre dominios distintos",
      },
      {
        id: "c",
        label:
          "El frontend necesita usar XMLHttpRequest en vez de fetch para evitar CORS",
      },
      {
        id: "d",
        label:
          "El problema es que el frontend y la API están en dominios distintos, y eso nunca puede funcionar",
      },
    ],
    correctOptionId: "a",
    hints: [
      "El error de CORS lo genera el navegador comprobando si el servidor autorizó explícitamente ese origen. ¿Dónde se configura qué orígenes están permitidos?",
      "Si en desarrollo local funciona, el middleware CORS del backend probablemente sí tiene 'localhost' en su lista de orígenes permitidos.",
      "Revisa la configuración de CORS del backend y confirma si incluye el dominio real de producción, no solo localhost.",
    ],
    explanation:
      "CORS es una medida de seguridad del navegador: el servidor debe declarar explícitamente qué orígenes tienen permiso para leer sus respuestas mediante la cabecera Access-Control-Allow-Origin. Es muy común configurar CORS con localhost durante el desarrollo y olvidar añadir el dominio real de producción al desplegar. La solución es actualizar la configuración de CORS del backend para incluir el dominio de producción del frontend, idealmente vía una variable de entorno.",
    points: 20,
    difficulty: "MEDIUM",
  },
];

export async function seedCases(): Promise<number> {
  let count = 0;
  for (const c of CASES) {
    const skill = c.skillSlug
      ? await prisma.skill.findUnique({ where: { slug: c.skillSlug } })
      : null;

    await prisma.case.upsert({
      where: { slug: c.slug },
      update: {
        kind: c.kind,
        domain: c.domain,
        severity: c.severity,
        skillId: skill?.id,
        title: c.title,
        symptoms: c.symptoms,
        environment: c.environment,
        code: c.code,
        logs: c.logs,
        expected: c.expected,
        actual: c.actual,
        options: c.options as unknown as object,
        hints: c.hints as unknown as object,
        solution: c.correctOptionId,
        explanation: c.explanation,
        points: c.points,
        difficulty: c.difficulty,
      },
      create: {
        slug: c.slug,
        kind: c.kind,
        domain: c.domain,
        severity: c.severity,
        skillId: skill?.id,
        title: c.title,
        symptoms: c.symptoms,
        environment: c.environment,
        code: c.code,
        logs: c.logs,
        expected: c.expected,
        actual: c.actual,
        options: c.options as unknown as object,
        hints: c.hints as unknown as object,
        solution: c.correctOptionId,
        explanation: c.explanation,
        points: c.points,
        difficulty: c.difficulty,
      },
    });
    count += 1;
  }
  console.log(`  ✔ ${count} casos reales (Debugging/IT Support/Networking/Producción)`);
  return count;
}
