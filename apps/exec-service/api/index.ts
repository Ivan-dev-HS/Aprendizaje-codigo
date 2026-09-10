import { createApp } from "../src/app.js";

// Vercel: cada invocación reutiliza esta instancia de Express mientras la
// función serverless siga "caliente" (no se crea una app por request).
export default createApp();
