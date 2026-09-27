const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outScreens = path.join(__dirname, "素材", "en", "screenshots");
const outAssets = path.join(__dirname, "素材", "en", "promo");
for (const d of [outScreens, outAssets]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  for (const file of fs.readdirSync(d)) {
    if (file.endsWith(".png")) fs.unlinkSync(path.join(d, file));
  }
}

const BRAND = "#3451C7";
const TEXT = "#17191f";
const MUTED = "#6b7280";
const LINE = "#e6e8ee";
const PAGE = "#f3f5f9";
const PAPER = "#f6f1e7";
const FONT = "PingFang SC, Hiragino Sans GB, sans-serif";

function panel(x, y, previewOn) {
  const previewFill = previewOn ? BRAND : "#fff";
  const previewText = previewOn ? "#fff" : BRAND;
  const previewLabel = previewOn ? "Exit preview" : "Preview";
  return `
    <g font-family="${FONT}">
      <rect x="${x}" y="${y}" width="292" height="392" rx="12" fill="#fff" stroke="${LINE}" stroke-width="1"/>
      <text x="${x + 16}" y="${y + 32}" font-size="13" fill="#b0b6c2">⋮⋮</text>
      <text x="${x + 40}" y="${y + 32}" font-size="15" font-weight="650" fill="${TEXT}">HTML to URL</text>
      <rect x="${x + 16}" y="${y + 52}" width="260" height="36" rx="8" fill="#fff" stroke="${LINE}"/>
      <text x="${x + 146}" y="${y + 75}" font-size="14" fill="${TEXT}" text-anchor="middle">Copy chat Markdown</text>
      <text x="${x + 16}" y="${y + 112}" font-size="12" fill="${MUTED}">Template</text>
      <rect x="${x + 16}" y="${y + 122}" width="260" height="36" rx="8" fill="#fff" stroke="${LINE}"/>
      <text x="${x + 28}" y="${y + 145}" font-size="14" fill="${TEXT}">Memo</text>
      <text x="${x + 16}" y="${y + 182}" font-size="12" fill="${MUTED}">Theme</text>
      <rect x="${x + 16}" y="${y + 192}" width="260" height="36" rx="8" fill="#fff" stroke="${LINE}"/>
      <text x="${x + 28}" y="${y + 215}" font-size="14" fill="${TEXT}">Bright</text>
      <rect x="${x + 16}" y="${y + 248}" width="260" height="36" rx="8" fill="${previewFill}" stroke="${BRAND}"/>
      <text x="${x + 146}" y="${y + 271}" font-size="14" font-weight="650" fill="${previewText}" text-anchor="middle">${previewLabel}</text>
      <rect x="${x + 16}" y="${y + 296}" width="260" height="36" rx="8" fill="${BRAND}"/>
      <text x="${x + 146}" y="${y + 319}" font-size="14" font-weight="650" fill="#fff" text-anchor="middle">Publish chat</text>
      <rect x="${x + 16}" y="${y + 344}" width="260" height="32" rx="8" fill="#fff" stroke="${LINE}"/>
      <text x="${x + 146}" y="${y + 365}" font-size="13" fill="${MUTED}" text-anchor="middle">Hide code buttons</text>
    </g>`;
}

function screenshot1() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <rect width="1280" height="800" fill="${PAGE}"/>
    <text x="64" y="58" font-family="${FONT}" font-size="28" font-weight="700" fill="${TEXT}">Select the turns, then publish a link.</text>
    <text x="64" y="92" font-family="${FONT}" font-size="16" fill="${MUTED}">Preview it, and pick a page style first.</text>
    <rect x="64" y="120" width="820" height="640" rx="16" fill="#fff" stroke="${LINE}"/>
    <rect x="390" y="156" width="450" height="64" rx="16" fill="#eef2ff"/>
    <text x="414" y="194" font-family="${FONT}" font-size="16" fill="${TEXT}">Turn today's notes into a page I can send.</text>
    <rect x="96" y="260" width="18" height="18" rx="4" fill="${BRAND}"/>
    <path d="M100 269 l4 4 l8 -9" fill="none" stroke="#fff" stroke-width="2"/>
    <text x="128" y="276" font-family="${FONT}" font-size="18" font-weight="700" fill="${TEXT}">Meeting notes</text>
    <text x="128" y="316" font-family="${FONT}" font-size="16" fill="${TEXT}">1. Publish the notes page next week</text>
    <text x="128" y="348" font-family="${FONT}" font-size="16" fill="${TEXT}">2. Preview the style, then make the link</text>
    <text x="128" y="380" font-family="${FONT}" font-size="16" fill="${TEXT}">3. Send the link to the group</text>
    <rect x="96" y="420" width="18" height="18" rx="4" fill="${BRAND}"/>
    <path d="M100 429 l4 4 l8 -9" fill="none" stroke="#fff" stroke-width="2"/>
    <text x="128" y="436" font-family="${FONT}" font-size="16" fill="${TEXT}">I'll send it like this.</text>
    ${panel(940, 120, false)}
  </svg>`;
}

function screenshot2() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <rect width="1280" height="800" fill="${PAPER}"/>
    <rect x="160" y="48" width="700" height="704" rx="8" fill="#fffdf8" stroke="#e7dcc8"/>
    <text x="200" y="120" font-family="${FONT}" font-size="28" font-weight="700" fill="#3f3426">Meeting notes</text>
    <text x="200" y="168" font-family="${FONT}" font-size="14" fill="#8a7560">Memo · Bright</text>
    <text x="200" y="230" font-family="${FONT}" font-size="16" font-weight="700" fill="#3f3426">Me</text>
    <text x="200" y="262" font-family="${FONT}" font-size="16" fill="#3f3426">Turn today's notes into a page I can send.</text>
    <text x="200" y="320" font-family="${FONT}" font-size="16" font-weight="700" fill="#3f3426">Reply</text>
    <text x="200" y="352" font-family="${FONT}" font-size="16" fill="#3f3426">1. Publish the notes page next week</text>
    <text x="200" y="384" font-family="${FONT}" font-size="16" fill="#3f3426">2. Preview the style, then make the link</text>
    <text x="200" y="416" font-family="${FONT}" font-size="16" fill="#3f3426">3. Send the link to the group</text>
    ${panel(900, 48, true)}
  </svg>`;
}

function screenshot3() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <rect width="1280" height="800" fill="${PAGE}"/>
    <text x="64" y="58" font-family="${FONT}" font-size="28" font-weight="700" fill="${TEXT}">The link is copied. Send it.</text>
    <text x="64" y="92" font-family="${FONT}" font-size="16" fill="${MUTED}">Anyone can open it on a phone.</text>
    <rect x="64" y="140" width="560" height="150" rx="12" fill="#fff" stroke="${BRAND}"/>
    <text x="88" y="188" font-family="${FONT}" font-size="18" font-weight="700" fill="${TEXT}">Link copied</text>
    <text x="88" y="228" font-family="ui-monospace, Menlo, monospace" font-size="16" fill="${BRAND}">https://htmlto.link/s/notes</text>
    <rect x="88" y="248" width="88" height="28" rx="6" fill="${BRAND}"/>
    <text x="132" y="267" font-family="${FONT}" font-size="13" fill="#fff" text-anchor="middle">Open</text>
    ${panel(760, 140, false)}
  </svg>`;
}

function screenshot4() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <rect width="1280" height="800" fill="${PAGE}"/>
    <text x="64" y="58" font-family="${FONT}" font-size="28" font-weight="700" fill="${TEXT}">They open the link. No app to install.</text>
    <text x="64" y="92" font-family="${FONT}" font-size="16" fill="${MUTED}">It is a normal web page.</text>
    <rect x="470" y="130" width="340" height="620" rx="36" fill="#111827"/>
    <rect x="486" y="168" width="308" height="548" rx="24" fill="${PAPER}"/>
    <text x="640" y="214" font-family="${FONT}" font-size="13" fill="#8a7560" text-anchor="middle">htmlto.link</text>
    <text x="510" y="280" font-family="${FONT}" font-size="26" font-weight="700" fill="#3f3426">Meeting notes</text>
    <text x="510" y="330" font-family="${FONT}" font-size="14" font-weight="700" fill="#3f3426">Me</text>
    <text x="510" y="356" font-family="${FONT}" font-size="14" fill="#3f3426">Turn today's notes into a page.</text>
    <text x="510" y="400" font-family="${FONT}" font-size="14" font-weight="700" fill="#3f3426">Reply</text>
    <text x="510" y="426" font-family="${FONT}" font-size="14" fill="#3f3426">1. Publish the notes page</text>
    <text x="510" y="452" font-family="${FONT}" font-size="14" fill="#3f3426">2. Preview, then make the link</text>
    <text x="510" y="478" font-family="${FONT}" font-size="14" fill="#3f3426">3. Send the link</text>
  </svg>`;
}

function promoSmall() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280">
    <rect width="440" height="280" fill="#0f172a"/>
    <rect x="24" y="24" width="52" height="52" rx="14" fill="${BRAND}"/>
    <path d="M40 50 h8 a8 8 0 0 1 0 16 h-8 a8 8 0 0 1 0 -16 M52 42 h8 a8 8 0 0 1 0 16 h-8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <text x="88" y="46" font-family="${FONT}" font-size="18" font-weight="700" fill="#fff">htmlto.link</text>
    <text x="88" y="68" font-family="${FONT}" font-size="12" fill="#94a3b8">HTML to URL</text>
    <text x="24" y="140" font-family="${FONT}" font-size="26" font-weight="700" fill="#fff">A chat, as a link</text>
    <text x="24" y="176" font-family="${FONT}" font-size="16" fill="#93c5fd">Preview it, then send it.</text>
    <rect x="24" y="208" width="168" height="40" rx="20" fill="${BRAND}"/>
    <text x="108" y="234" font-family="${FONT}" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">Add to Chrome</text>
  </svg>`;
}

function promoMarquee() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560">
    <rect width="1400" height="560" fill="#0f172a"/>
    <text x="72" y="150" font-family="${FONT}" font-size="22" font-weight="700" fill="#93c5fd">htmlto.link</text>
    <text x="72" y="240" font-family="${FONT}" font-size="52" font-weight="700" fill="#fff">Turn a whole chat</text>
    <text x="72" y="312" font-family="${FONT}" font-size="52" font-weight="700" fill="#fff">into one link.</text>
    <text x="72" y="372" font-family="${FONT}" font-size="22" fill="#94a3b8">Preview the page style, then copy the link.</text>
    <rect x="72" y="420" width="240" height="56" rx="28" fill="${BRAND}"/>
    <text x="192" y="456" font-family="${FONT}" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">Add to Chrome</text>
    <rect x="860" y="80" width="460" height="400" rx="16" fill="#fff"/>
    <text x="892" y="132" font-family="${FONT}" font-size="18" font-weight="700" fill="${TEXT}">HTML to URL</text>
    <rect x="892" y="160" width="396" height="44" rx="8" fill="#fff" stroke="${LINE}"/>
    <text x="1090" y="188" font-family="${FONT}" font-size="16" fill="${TEXT}" text-anchor="middle">Memo · Bright</text>
    <rect x="892" y="220" width="396" height="48" rx="8" fill="#fff" stroke="${BRAND}"/>
    <text x="1090" y="250" font-family="${FONT}" font-size="16" font-weight="650" fill="${BRAND}" text-anchor="middle">Preview</text>
    <rect x="892" y="284" width="396" height="48" rx="8" fill="${BRAND}"/>
    <text x="1090" y="314" font-family="${FONT}" font-size="16" font-weight="650" fill="#fff" text-anchor="middle">Publish chat</text>
    <text x="892" y="390" font-family="${FONT}" font-size="16" font-weight="700" fill="${BRAND}">https://htmlto.link/s/notes</text>
    <text x="892" y="424" font-family="${FONT}" font-size="14" fill="${MUTED}">Link copied</text>
  </svg>`;
}

async function render(svg, file, dir) {
  await sharp(Buffer.from(svg)).flatten({ background: "#ffffff" }).png().toFile(path.join(dir, file));
  console.log("Generated", path.relative(__dirname, path.join(dir, file)));
}

(async () => {
  await render(screenshot1(), "screenshot-1-panel.png", outScreens);
  await render(screenshot2(), "screenshot-2-preview.png", outScreens);
  await render(screenshot3(), "screenshot-3-link-copied.png", outScreens);
  await render(screenshot4(), "screenshot-4-phone.png", outScreens);
  await render(promoSmall(), "promo-tile-440x280.png", outAssets);
  await render(promoMarquee(), "promo-tile-1400x560.png", outAssets);
  console.log("All EN promo images generated.");
})().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
