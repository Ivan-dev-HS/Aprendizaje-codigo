import "@testing-library/jest-dom/vitest";

// jsdom no implementa matchMedia. Se define un stub mínimo para que el código
// que detecta `prefers-color-scheme` (ThemeProvider) sea testeable.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
