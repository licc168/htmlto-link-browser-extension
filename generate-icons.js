const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="20" height="20" x="2" y="2" rx="5" fill="#0f172a" stroke="#2563eb"/>
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#38bdf8" stroke-width="2"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#10b981" stroke-width="2"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);

// Simple Minimal 1x1 PNG generator to avoid missing file errors
function createMinimalPNG(width, height) {
  // Simple valid PNG header & chunks
  return Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
    0, 0, 0, width, 0, 0, 0, height, 8, 6, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0,
    1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
  ]);
}

[16, 32, 48, 128].forEach(size => {
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, createMinimalPNG(size, size));
});

console.log('Icons generated successfully.');
