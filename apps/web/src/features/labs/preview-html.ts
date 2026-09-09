/** Evita que el JS del usuario cierre prematuramente la etiqueta <script> del preview. */
function escapeClosingScriptTag(code: string): string {
  return code.replace(/<\/script/gi, "<\\/script");
}

export function buildPreviewHtml(html: string, css: string, js: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>${css}</style>
</head>
<body>
${html}
<script>${escapeClosingScriptTag(js)}</script>
</body>
</html>`;
}
