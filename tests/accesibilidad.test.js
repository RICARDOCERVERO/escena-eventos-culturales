const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;

const base = pathToFileURL(path.join(__dirname, "..", "src", "index.html")).href;
const etiquetas = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const vistas = [
  { nombre: "Inicio", hash: "" },
  { nombre: "Detalle del evento", hash: "#/evento/3" },
  { nombre: "Mi lista", hash: "#/mi-lista" }
];

let navegador;

before(async () => {
  // En tu ordenador usa Chrome; en GitLab se deja vacío para usar el navegador de la imagen
  const canal = process.env.CI ? undefined : "chrome";
  navegador = await chromium.launch(canal ? { channel: canal } : {});
});

after(async () => {
  await navegador.close();
});

vistas.forEach((vista) => {
  test("axe: " + vista.nombre + " sin infracciones de WCAG A y AA", async () => {
const contexto = await navegador.newContext();
const pagina = await contexto.newPage();
    await pagina.goto(base + vista.hash);
    const resultado = await new AxeBuilder({ page: pagina })
      .withTags(etiquetas)
      .analyze();
    const resumen = resultado.violations
      .map((v) => v.id + ": " + v.help + " (" + v.nodes.length + " elementos)")
      .join("\n");
    await contexto.close();
    assert.equal(resultado.violations.length, 0, "\n" + resumen);
  });
});