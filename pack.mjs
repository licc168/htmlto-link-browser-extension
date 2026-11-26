import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "dist");
const stage = path.join(dist, "stage");
const zipPath = path.join(dist, "htmlto-link-extension.zip");

const requiredFiles = [
  "manifest.json",
  "background.js",
  "content.js",
  "content.css",
  "popup.html",
  "popup.js",
  "popup.css",
  "options.html",
  "options.js",
  "options.css",
  "welcome.html",
  "welcome.js",
  "demo.html",
  "page-i18n.js",
  "file-publish.js",
  "file-publish.css",
];

const requiredDirs = ["icons", "_locales", "platforms", "preview"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

for (const file of requiredFiles) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing required file: ${file}`);
  }
  fs.copyFileSync(src, path.join(stage, file));
}

for (const dir of requiredDirs) {
  const src = path.join(root, dir);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing required directory: ${dir}`);
  }
  fs.cpSync(src, path.join(stage, dir), { recursive: true });
}

const iconSvg = path.join(stage, "icons", "icon.svg");
if (fs.existsSync(iconSvg)) {
  fs.rmSync(iconSvg, { force: true });
}

execFileSync("zip", ["-rq", zipPath, "."], { cwd: stage, stdio: "inherit" });
const sizeKb = (fs.statSync(zipPath).size / 1024).toFixed(1);
console.log(`Packed ${zipPath} (${sizeKb} KB)`);
