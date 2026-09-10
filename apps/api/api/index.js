import { register } from "tsx/esm/api";

// El builder de Vercel para funciones serverless solo compila el árbol
// propio de apps/api; los paquetes del workspace (@codeforge/database,
// @codeforge/types, @codeforge/validators), resueltos vía node_modules,
// llegan sin transpilar y Node no puede ejecutarlos en tiempo de ejecución
// ("Cannot find module .../src/client.ts"). En Docker y en local todo se
// ejecuta siempre con tsx (ver apps/api/Dockerfile); aquí registramos el
// mismo loader antes de importar la app real, para que el código fuente
// sin compilar funcione igual en ambos sitios sin mantener un build propio
// para cada paquete del monorepo. Este archivo debe quedarse en JS puro:
// si fuera .ts, Vercel lo compilaría con su propio verificador de tipos
// aislado antes de que este registro llegue a ejecutarse.
register();

const { createApp } = await import("../src/app.js");

export default createApp();
