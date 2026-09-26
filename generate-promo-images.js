const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outScreens = path.join(__dirname, "素材", "en", "screenshots");
const outAssets = path.join(__dirname, "素材", "en", "promo");
for (const d of [outScreens, outAssets]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

const PRIMARY = "#2563eb";
const PRIMARY_2 = "#4f46e5";
const ACCENT = "#10b981";
const LINK = "#38bdf8";
const TEXT = "#f8fafc";
const MUTED = "#94a3b8";
const BG = "#0f172a";
const CARD = "#1e293b";
const INPUT = "#182232";
const BORDER = "rgba(255,255,255,0.12)";

const brandDef = `<defs>
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${PRIMARY}"/>
    <stop offset="100%" stop-color="${PRIMARY_2}"/>
  </linearGradient>
</defs>`;

function screenshot1() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    ${brandDef}
    <rect width="1280" height="800" fill="${BG}"/>
    <text x="48" y="56" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="${TEXT}">ChatGPT made a page. Click once.</text>
    <text x="48" y="88" font-family="Arial, sans-serif" font-size="16" fill="${MUTED}">A “Generate link” button appears on the code block.</text>
    <rect x="48" y="120" width="1184" height="56" rx="12" fill="#10a37f"/>
    <text x="72" y="154" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">ChatGPT</text>
    <text x="180" y="154" font-family="Arial, sans-serif" font-size="15" fill="rgba(255,255,255,0.85)">Make a birthday page for my mom</text>
    <rect x="48" y="192" width="1184" height="520" rx="16" fill="#0d1424" stroke="${BORDER}" stroke-width="1"/>
    <rect x="48" y="192" width="1184" height="52" fill="#161d31"/>
    <text x="72" y="224" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${TEXT}">HTML</text>
    <rect x="860" y="204" width="250" height="28" rx="14" fill="url(#brand)"/>
    <text x="888" y="223" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#fff">Generate link</text>
    <text x="72" y="280" font-family="Consolas, monospace" font-size="16" fill="#7dd3fc">&lt;!DOCTYPE html&gt;</text>
    <text x="72" y="312" font-family="Consolas, monospace" font-size="16" fill="${TEXT}">&lt;title&gt;Happy Birthday, Mom&lt;/title&gt;</text>
    <text x="72" y="344" font-family="Consolas, monospace" font-size="16" fill="#93c5fd">&lt;h1&gt;Happy Birthday!&lt;/h1&gt;</text>
    <text x="72" y="376" font-family="Consolas, monospace" font-size="16" fill="${MUTED}">&lt;p&gt;A page you can open on any phone.&lt;/p&gt;</text>
    <text x="48" y="750" font-family="Arial, sans-serif" font-size="16" fill="${MUTED}">Also works on Claude and Gemini. No website. No code knowledge.</text>
  </svg>`;
}

function screenshot2() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    ${brandDef}
    <rect width="1280" height="800" fill="${BG}"/>
    <text x="48" y="56" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="${TEXT}">The link is copied. Send it.</text>
    <text x="48" y="88" font-family="Arial, sans-serif" font-size="16" fill="${MUTED}">Anyone can open it. You do not send the code.</text>
    <rect x="240" y="160" width="800" height="420" rx="24" fill="${CARD}" stroke="${BORDER}" stroke-width="1"/>
    <circle cx="640" cy="250" r="44" fill="rgba(16,185,129,0.2)"/>
    <text x="640" y="266" font-family="Arial, sans-serif" font-size="40" font-weight="800" fill="${ACCENT}" text-anchor="middle">✓</text>
    <text x="640" y="340" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${TEXT}" text-anchor="middle">Link copied</text>
    <rect x="340" y="370" width="600" height="56" rx="12" fill="${INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="640" y="406" font-family="Consolas, monospace" font-size="20" fill="${LINK}" text-anchor="middle">https://htmlto.link/s/mom-bday</text>
    <text x="640" y="470" font-family="Arial, sans-serif" font-size="16" fill="${MUTED}" text-anchor="middle">Paste into WhatsApp, iMessage, or email</text>
    <text x="640" y="530" font-family="Arial, sans-serif" font-size="14" fill="${MUTED}" text-anchor="middle">Guest links last about 24 hours · Sign in to keep them</text>
  </svg>`;
}

function screenshot3() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    ${brandDef}
    <rect width="1280" height="800" fill="${BG}"/>
    <text x="48" y="56" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="${TEXT}">They open it on their phone.</text>
    <text x="48" y="88" font-family="Arial, sans-serif" font-size="16" fill="${MUTED}">No app to install. It is just a normal link.</text>
    <rect x="460" y="130" width="360" height="620" rx="40" fill="#111827" stroke="${BORDER}" stroke-width="2"/>
    <rect x="476" y="168" width="328" height="540" rx="24" fill="#fff7ed"/>
    <text x="640" y="230" font-family="Arial, sans-serif" font-size="18" fill="#9a3412" text-anchor="middle">htmlto.link</text>
    <text x="640" y="340" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="#9a3412" text-anchor="middle">Happy</text>
    <text x="640" y="386" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="#9a3412" text-anchor="middle">Birthday</text>
    <text x="640" y="430" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="#9a3412" text-anchor="middle">Mom!</text>
    <text x="640" y="500" font-family="Arial, sans-serif" font-size="16" fill="#c2410c" text-anchor="middle">A page anyone can open</text>
    <rect x="540" y="540" width="200" height="48" rx="24" fill="#ea580c"/>
    <text x="640" y="570" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">Open card</text>
  </svg>`;
}

function promoSmall() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280">
    ${brandDef}
    <rect width="440" height="280" fill="${BG}"/>
    <rect x="20" y="20" width="56" height="56" rx="14" fill="url(#brand)"/>
    <text x="48" y="56" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#fff" text-anchor="middle">&lt;/&gt;</text>
    <text x="90" y="44" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#fff">htmlto.link</text>
    <text x="90" y="66" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">Share a ChatGPT page</text>
    <text x="20" y="130" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="${TEXT}">ChatGPT → link</text>
    <text x="20" y="162" font-family="Arial, sans-serif" font-size="16" fill="${LINK}">One click. Anyone can open it.</text>
    <rect x="20" y="200" width="180" height="40" rx="20" fill="url(#brand)"/>
    <text x="110" y="226" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">Add to Chrome</text>
  </svg>`;
}

function promoMarquee() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560">
    ${brandDef}
    <rect width="1400" height="560" fill="${BG}"/>
    <rect x="64" y="64" width="84" height="84" rx="20" fill="url(#brand)"/>
    <text x="106" y="118" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="#fff" text-anchor="middle">&lt;/&gt;</text>
    <text x="172" y="108" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="#fff">htmlto.link</text>
    <text x="172" y="140" font-family="Arial, sans-serif" font-size="18" fill="${MUTED}">Share ChatGPT pages as a link</text>
    <text x="64" y="250" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="#fff">ChatGPT made a page.</text>
    <text x="64" y="312" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="${LINK}">Send it as a link.</text>
    <text x="64" y="372" font-family="Arial, sans-serif" font-size="22" fill="${MUTED}">One click on ChatGPT. Open on any phone.</text>
    <rect x="64" y="420" width="280" height="56" rx="28" fill="url(#brand)"/>
    <text x="204" y="456" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">Add to Chrome</text>
    <rect x="820" y="80" width="500" height="400" rx="24" fill="${CARD}" stroke="${BORDER}" stroke-width="1"/>
    <text x="852" y="130" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="${TEXT}">ChatGPT</text>
    <rect x="1040" y="108" width="240" height="32" rx="16" fill="url(#brand)"/>
    <text x="1160" y="130" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">Generate link</text>
    <text x="852" y="190" font-family="Consolas, monospace" font-size="16" fill="#7dd3fc">&lt;h1&gt;Happy Birthday&lt;/h1&gt;</text>
    <rect x="852" y="240" width="436" height="80" rx="12" fill="${INPUT}" stroke="rgba(16,185,129,0.35)" stroke-width="1"/>
    <text x="872" y="274" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${ACCENT}">Link copied</text>
    <text x="872" y="300" font-family="Consolas, monospace" font-size="16" fill="${LINK}">https://htmlto.link/s/mom-bday</text>
  </svg>`;
}

async function render(svg, file, dirs) {
  const buf = Buffer.from(svg);
  for (const dir of dirs) {
    await sharp(buf).flatten({ background: BG }).png({ palette: false }).toFile(path.join(dir, file));
  }
  console.log("Generated", file);
}

(async () => {
  await render(screenshot1(), "screenshot-1-chatgpt-button.png", [outScreens]);
  await render(screenshot2(), "screenshot-2-link-copied.png", [outScreens]);
  await render(screenshot3(), "screenshot-3-phone-opens.png", [outScreens]);
  await render(promoSmall(), "promo-tile-440x280.png", [outAssets]);
  await render(promoMarquee(), "promo-tile-1400x560.png", [outAssets]);
  console.log("All EN promo images generated.");
})().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
