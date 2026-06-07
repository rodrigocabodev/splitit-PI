import { defineConfig } from "vitest/config";
import path from "node:path";

// Configuración mínima de Vitest: alias "@/" como en Next y entorno Node
// (los tests cubren lógica pura, sin DOM ni componentes React).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
