import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/js/app.js"],
    languageOptions: {
      sourceType: "script",
      globals: { ...globals.browser, EVENTOS: "readonly" }
    }
  },
  {
    files: ["src/js/eventos.js"],
    languageOptions: { sourceType: "script" },
    rules: { "no-unused-vars": "off" }
  }
];