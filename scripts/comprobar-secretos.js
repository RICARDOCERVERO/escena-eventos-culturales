const fs = require("node:fs");

const informe = JSON.parse(
  fs.readFileSync("gl-secret-detection-report.json", "utf8")
);
const total = informe.vulnerabilities.length;

if (total > 0) {
  console.error("Secretos encontrados: " + total);
  process.exit(1);
}
console.log("Sin secretos");