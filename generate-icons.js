const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const iconsDir = path.join(__dirname, "icons");
const svgPath = path.join(iconsDir, "icon.svg");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];

(async () => {
  for (const size of sizes) {
    const outPath = path.join(iconsDir, `icon${size}.png`);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${path.basename(outPath)} (${size}x${size})`);
  }
  console.log("Icons generated successfully.");
})().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
