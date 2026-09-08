import type { ModuleSeed } from "./helpers.js";

export const FUNDAMENTOS_MODULES: ModuleSeed[] = [
  {
    slug: "como-funciona-un-ordenador",
    title: "Cómo funciona un ordenador",
    description:
      "Hardware, software y cómo se relacionan para ejecutar cualquier programa.",
    order: 1,
    lessons: [
      {
        slug: "hardware-y-software",
        title: "Hardware y software",
        summary:
          "Qué son la CPU, la RAM y el almacenamiento, y cómo el software los usa.",
        order: 1,
        estimatedMinutes: 12,
        content: [
          {
            type: "theory",
            title: "Las dos mitades de un ordenador",
            body: "El hardware es todo lo físico: la CPU (que ejecuta instrucciones), la RAM (memoria temporal y rápida) y el almacenamiento (disco duro o SSD, donde se guardan los archivos aunque apagues el equipo). El software son las instrucciones que le dicen al hardware qué hacer: desde el sistema operativo hasta la aplicación que abres.",
          },
          {
            type: "technical",
            title: "El ciclo básico",
            body: "Cuando ejecutas un programa, el sistema operativo lo carga desde el almacenamiento a la RAM, y la CPU va leyendo y ejecutando sus instrucciones una a una (a una velocidad de miles de millones por segundo). La RAM es mucho más rápida que el disco pero se borra al apagar el equipo — por eso guardas tu trabajo.",
          },
          {
            type: "example",
            title: "Un ejemplo cotidiano",
            language: "text",
            code: "Abrir un editor de texto:\n1. Haces doble clic → el SO busca el programa en el disco\n2. El SO lo copia a la RAM\n3. La CPU empieza a ejecutar sus instrucciones\n4. Ves la ventana del editor en pantalla",
            body: "Esto pasa cada vez que abres cualquier aplicación, incluido tu navegador o tu editor de código.",
          },
          {
            type: "common_mistake",
            title: "Confundir memoria con almacenamiento",
            body: 'Es habitual pensar que "tener poca RAM" es lo mismo que "tener el disco lleno". Son cosas distintas: quedarte sin espacio en disco impide guardar archivos nuevos; quedarte sin RAM hace que los programas abiertos vayan lentos o se cierren, pero no borra tus archivos guardados.',
          },
          {
            type: "challenge",
            title: "Investiga tu propio equipo",
            body: "Abre el gestor de tareas (Ctrl+Shift+Esc en Windows, Activity Monitor en Mac) y anota cuánta RAM tienes y cuánta está en uso ahora mismo. ¿Qué programa consume más?",
          },
          {
            type: "real_application",
            title: "Por qué te importa como desarrollador/a",
            body: 'Cuando tu código "se queda pillado" o un servidor "se queda sin memoria" (verás este caso real en el módulo de Producción, más adelante), entender esta diferencia entre CPU, RAM y disco es la base para saber qué está fallando.',
          },
        ],
      },
      {
        slug: "archivos-carpetas-y-sistemas-operativos",
        title: "Archivos, carpetas y sistemas operativos",
        summary: "Cómo se organiza la información en un sistema de archivos jerárquico.",
        order: 2,
        estimatedMinutes: 12,
        content: [
          {
            type: "theory",
            body: "Un sistema operativo organiza los archivos en una estructura de árbol: carpetas (también llamadas directorios) que contienen archivos u otras carpetas. Todo parte de una carpeta raíz.",
          },
          {
            type: "technical",
            title: "Rutas absolutas y relativas",
            body: "Una ruta absoluta describe la ubicación completa desde la raíz (por ejemplo /home/usuario/proyecto en Linux/Mac, o C:\\Usuarios\\usuario\\proyecto en Windows). Una ruta relativa describe la ubicación desde donde estás ahora mismo (por ejemplo ./proyecto o ../otra-carpeta).",
          },
          {
            type: "example",
            language: "text",
            code: "/home/ana/proyectos/web/index.html\n\ndesde /home/ana/proyectos/ → ruta relativa: web/index.html\ndesde /home/ana/ → ruta relativa: proyectos/web/index.html",
            body: "La misma ubicación se puede describir de formas distintas según desde dónde partas.",
          },
          {
            type: "common_mistake",
            title: 'Rutas que funcionan "en mi ordenador" y en ningún otro',
            body: "Un error muy común al empezar es escribir una ruta absoluta de tu propio ordenador (como C:\\Users\\Ana\\...) dentro de un proyecto que vas a compartir. Funcionará solo en tu máquina. Las rutas relativas son las que hacen que un proyecto sea portable.",
          },
          {
            type: "challenge",
            title: "Dibuja tu árbol",
            body: "Abre el explorador de archivos de tu sistema y dibuja en papel (o en un editor de texto) el árbol de carpetas desde tu carpeta de usuario hasta una carpeta de proyecto que tengas, dos niveles de profundidad.",
          },
          {
            type: "real_application",
            body: 'Cuando en el curso de Terminal escribas comandos como cd o ls, y cuando en HTML enlaces una imagen con <img src="./img/foto.png">, estarás usando exactamente este concepto de rutas relativas.',
          },
        ],
      },
    ],
  },
  {
    slug: "logica-y-la-web",
    title: "Lógica y cómo funciona la web",
    description:
      "Pensamiento algorítmico e Internet: los dos cimientos antes de programar.",
    order: 2,
    lessons: [
      {
        slug: "pensamiento-logico-y-algoritmos",
        title: "Pensamiento lógico y algoritmos",
        summary: "Qué es un algoritmo y cómo descomponer un problema en pasos.",
        order: 1,
        estimatedMinutes: 15,
        content: [
          {
            type: "theory",
            body: "Un algoritmo es una secuencia ordenada y precisa de pasos para resolver un problema. Programar es, en esencia, traducir un algoritmo a un lenguaje que el ordenador entienda.",
          },
          {
            type: "technical",
            title: "Descomposición",
            body: 'La habilidad clave no es "saber sintaxis", es descomponer un problema grande en pasos pequeños y no ambiguos. Un ordenador no "intuye": necesita que cada paso esté completamente especificado.',
          },
          {
            type: "example",
            title: "Algoritmo para hacer un té",
            language: "text",
            code: "1. Llenar la tetera con agua\n2. Poner la tetera a calentar\n3. Esperar hasta que hierva\n4. Poner una bolsita de té en una taza\n5. Verter el agua caliente en la taza\n6. Esperar 3 minutos\n7. Retirar la bolsita",
            body: "Parece trivial para una persona, pero fíjate en que cada paso es concreto y en orden — así es como piensa un ordenador.",
          },
          {
            type: "common_mistake",
            title: 'Saltarse pasos "obvios"',
            body: 'Al escribir el primer algoritmo, mucha gente olvida pasos que da por sentados ("encender la tetera" antes de "esperar a que hierva"). Un ordenador no da nada por sentado: si no lo escribes, no pasa.',
          },
          {
            type: "challenge",
            title: "Escribe tu propio algoritmo",
            body: 'Escribe, paso a paso y sin ambigüedad, el algoritmo para "cruzar la calle de forma segura". Intenta que no falte ningún paso ni asuma nada.',
          },
          {
            type: "real_application",
            body: "Cuando en JavaScript escribas tu primera función, estarás haciendo exactamente esto: traducir una serie de pasos lógicos a instrucciones que el navegador ejecuta una a una.",
          },
        ],
      },
      {
        slug: "internet-y-como-funciona-la-web",
        title: "Internet y cómo funciona la web",
        summary: "Cliente, servidor, y qué pasa cuando escribes una URL en el navegador.",
        order: 2,
        estimatedMinutes: 15,
        content: [
          {
            type: "theory",
            body: "La web funciona con un modelo cliente-servidor: tu navegador (el cliente) pide contenido a un ordenador remoto (el servidor), que responde con los datos necesarios para mostrar la página.",
          },
          {
            type: "technical",
            title: "Qué pasa al pulsar Enter",
            body: "1) El navegador traduce el dominio (ej. codeforge.dev) a una IP mediante DNS. 2) Abre una conexión con el servidor en esa IP. 3) Envía una petición HTTP pidiendo el recurso. 4) El servidor responde con HTML/CSS/JS y datos. 5) El navegador construye y muestra la página.",
          },
          {
            type: "example",
            language: "text",
            code: "GET /index.html HTTP/1.1\nHost: ejemplo.com\n\n→ Respuesta:\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<html>...</html>",
            body: "Esta es, simplificada, la conversación real que ocurre entre tu navegador y un servidor web.",
          },
          {
            type: "common_mistake",
            title: 'Pensar que "internet" y "la web" son lo mismo',
            body: "Internet es la red de redes que conecta ordenadores en todo el mundo; la web (HTTP/HTML) es solo uno de los servicios que corre sobre Internet — el email o la mensajería instantánea son otros, con sus propios protocolos.",
          },
          {
            type: "challenge",
            title: "Observa las peticiones reales",
            body: 'Abre las herramientas de desarrollador de tu navegador (F12), ve a la pestaña "Red"/"Network", recarga cualquier página y observa cuántas peticiones se hacen para cargar una sola página.',
          },
          {
            type: "real_application",
            body: "Este modelo cliente-servidor es exactamente lo que construirás en los cursos de Node.js y APIs REST: tu propio servidor respondiendo peticiones de un cliente (el navegador, o una app).",
          },
        ],
      },
    ],
  },
];
