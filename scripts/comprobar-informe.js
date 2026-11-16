const fs = require("node:fs");

const informe = JSON.parse(fs.readFileSync("gl-sast-report.json", "utf8"));
const hallazgos = informe.vulnerabilities;

for (const h of hallazgos) {
  const donde = h.location ? h.location.file + ":" + h.location.start_line : "?";
  console.error("- [" + h.severity + "] " + h.name + " en " + donde);
}

if (hallazgos.length > 0) {
  console.error("SAST: hallazgos encontrados: " + hallazgos.length);
  process.exit(1);
}
console.log("SAST: sin hallazgos");