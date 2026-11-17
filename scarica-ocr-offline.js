// Scarica i file di Tesseract.js (motore + lingue italiano e inglese) nella cartella vendor/tesseract/
// così la lettura del documento funziona senza internet.
// Uso: dalla cartella del repository, con Node.js installato:   node scarica-ocr-offline.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const tmp = path.join(__dirname, ".ocr-tmp");
const out = path.join(__dirname, "vendor", "tesseract");
const langOut = path.join(out, "lang");

function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log("  copiato", path.relative(__dirname, to));
}
function findFile(dir, name) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { const r = findFile(p, name); if (r) return r; }
    else if (e.name === name) return p;
  }
  return null;
}

console.log("Scarico i pacchetti (serve internet solo adesso)...");
fs.mkdirSync(tmp, { recursive: true });
execSync("npm install --no-save --no-audit --no-fund --prefix .ocr-tmp tesseract.js@5.1.1 @tesseract.js-data/ita @tesseract.js-data/eng", { stdio: "inherit", cwd: __dirname });

const nm = path.join(tmp, "node_modules");
console.log("Copio i file in vendor/tesseract/ ...");
copy(path.join(nm, "tesseract.js", "dist", "tesseract.min.js"), path.join(out, "tesseract.min.js"));
copy(path.join(nm, "tesseract.js", "dist", "worker.min.js"), path.join(out, "worker.min.js"));

const core = path.join(nm, "tesseract.js-core");
for (const f of fs.readdirSync(core)) {
  if (/^tesseract-core.*\.(js|wasm)$/.test(f)) copy(path.join(core, f), path.join(out, f));
}
for (const l of ["ita", "eng"]) {
  const f = findFile(path.join(nm, "@tesseract.js-data", l), l + ".traineddata.gz");
  if (!f) { console.error("File lingua non trovato per", l); process.exit(1); }
  copy(f, path.join(langOut, l + ".traineddata.gz"));
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log("\nFatto. Carica su GitHub la cartella vendor/ insieme a index.html.");
