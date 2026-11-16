const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Carga EVENTOS desde src/js/eventos.js sin necesitar un navegador
const ruta = path.join(__dirname, "..", "src", "js", "eventos.js");
const codigo = fs.readFileSync(ruta, "utf8");
const EVENTOS = vm.runInNewContext(codigo + "\nEVENTOS;");

const CATEGORIAS = ["teatro", "musica", "cine", "exposicion"];

test("hay al menos 40 eventos", () => {
  assert.ok(EVENTOS.length >= 40);
});

test("los ids son únicos", () => {
  const ids = EVENTOS.map((evento) => evento.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("todos los eventos tienen los campos de texto rellenos", () => {
  EVENTOS.forEach((evento) => {
    ["titulo", "lugar", "descripcion"].forEach((campo) => {
      assert.equal(typeof evento[campo], "string", campo + " en id " + evento.id);
      assert.ok(evento[campo].trim().length > 0, campo + " vacío en id " + evento.id);
    });
  });
});

test("la categoría es válida", () => {
  EVENTOS.forEach((evento) => {
    assert.ok(CATEGORIAS.includes(evento.categoria), "categoría en id " + evento.id);
  });
});

test("la fecha es real y tiene formato AAAA-MM-DD", () => {
  EVENTOS.forEach((evento) => {
    assert.match(evento.fecha, /^\d{4}-\d{2}-\d{2}$/, "formato en id " + evento.id);
    const fecha = new Date(evento.fecha + "T00:00:00Z");
    assert.equal(fecha.toISOString().slice(0, 10), evento.fecha, "fecha irreal en id " + evento.id);
  });
});

test("la hora tiene formato HH:MM válido", () => {
  EVENTOS.forEach((evento) => {
    assert.match(evento.hora, /^([01]\d|2[0-3]):[0-5]\d$/, "hora en id " + evento.id);
  });
});

test("el precio es un número entero igual o mayor que 0", () => {
  EVENTOS.forEach((evento) => {
    assert.ok(Number.isInteger(evento.precio) && evento.precio >= 0, "precio en id " + evento.id);
  });
});