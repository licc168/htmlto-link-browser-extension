const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outScreens = path.join(__dirname, "..", "publish-kit", "zh_CN", "截图");
const outAssets = path.join(__dirname, "..", "publish-kit", "zh_CN", "素材");
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
    <text x="48" y="56" font-family="Microsoft YaHei, Arial, sans-serif" font-size="28" font-weight="800" fill="${TEXT}">ChatGPT 做好了网页，点一下。</text>
    <text x="48" y="88" font-family="Microsoft YaHei, Arial, sans-serif" font-size="16" fill="${MUTED}">代码块上会出现「生成链接」按钮。</text>
    <rect x="48" y="120" width="1184" height="56" rx="12" fill="#10a37f"/>
    <text x="72" y="154" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">ChatGPT</text>
    <text x="180" y="154" font-family="Microsoft YaHei, Arial, sans-serif" font-size="15" fill="rgba(255,255,255,0.85)">帮我做一页给妈妈的生日祝福</text>
    <rect x="48" y="192" width="1184" height="520" rx="16" fill="#0d1424" stroke="${BORDER}" stroke-width="1"/>
    <rect x="48" y="192" width="1184" height="52" fill="#161d31"/>
    <text x="72" y="224" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${TEXT}">HTML</text>
    <rect x="860" y="204" width="250" height="28" rx="14" fill="url(#brand)"/>
    <text x="910" y="223" font-family="Microsoft YaHei, Arial, sans-serif" font-size="13" font-weight="700" fill="#fff">生成链接</text>
    <text x="72" y="280" font-family="Consolas, monospace" font-size="16" fill="#7dd3fc">&lt;!DOCTYPE html&gt;</text>
    <text x="72" y="312" font-family="Consolas, monospace" font-size="16" fill="${TEXT}">&lt;title&gt;妈妈生日快乐&lt;/title&gt;</text>
    <text x="72" y="344" font-family="Consolas, monospace" font-size="16" fill="#93c5fd">&lt;h1&gt;生日快乐！&lt;/h1&gt;</text>
    <text x="48" y="750" font-family="Microsoft YaHei, Arial, sans-serif" font-size="16" fill="${MUTED}">也支持 Claude、Gemini、豆包、Kimi。不用建网站。</text>
  </svg>`;
}

function screenshot2() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    ${brandDef}
    <rect width="1280" height="800" fill="${BG}"/>
    <text x="48" y="56" font-family="Microsoft YaHei, Arial, sans-serif" font-size="28" font-weight="800" fill="${TEXT}">链接已复制，发出去就行。</text>
    <text x="48" y="88" font-family="Microsoft YaHei, Arial, sans-serif" font-size="16" fill="${MUTED}">不要发代码。发这个链接，对方手机就能打开。</text>
    <rect x="240" y="160" width="800" height="420" rx="24" fill="${CARD}" stroke="${BORDER}" stroke-width="1"/>
    <text x="640" y="280" font-family="Arial, sans-serif" font-size="40" font-weight="800" fill="${ACCENT}" text-anchor="middle">✓</text>
    <text x="640" y="340" font-family="Microsoft YaHei, Arial, sans-serif" font-size="22" font-weight="700" fill="${TEXT}" text-anchor="middle">链接已复制</text>
    <rect x="340" y="370" width="600" height="56" rx="12" fill="${INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="640" y="406" font-family="Consolas, monospace" font-size="20" fill="${LINK}" text-anchor="middle">https://htmlto.link/s/mom-bday</text>
    <text x="640" y="470" font-family="Microsoft YaHei, Arial, sans-serif" font-size="16" fill="${MUTED}" text-anchor="middle">发到微信、短信、邮件都可以</text>
    <text x="640" y="530" font-family="Microsoft YaHei, Arial, sans-serif" font-size="14" fill="${MUTED}" text-anchor="middle">未登录约 24 小时有效 · 登录后可长期保存</text>
  </svg>`;
}

function screenshot3() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    ${brandDef}
    <rect width="1280" height="800" fill="${BG}"/>
    <text x="48" y="56" font-family="Microsoft YaHei, Arial, sans-serif" font-size="28" font-weight="800" fill="${TEXT}">对方用手机打开就行。</text>
    <text x="48" y="88" font-family="Microsoft YaHei, Arial, sans-serif" font-size="16" fill="${MUTED}">不用装 App，就是一个普通链接。</text>
    <rect x="460" y="130" width="360" height="620" rx="40" fill="#111827" stroke="${BORDER}" stroke-width="2"/>
    <rect x="476" y="168" width="328" height="540" rx="24" fill="#fff7ed"/>
    <text x="640" y="230" font-family="Arial, sans-serif" font-size="18" fill="#9a3412" text-anchor="middle">htmlto.link</text>
    <text x="640" y="360" font-family="Microsoft YaHei, Arial, sans-serif" font-size="36" font-weight="800" fill="#9a3412" text-anchor="middle">妈妈</text>
    <text x="640" y="410" font-family="Microsoft YaHei, Arial, sans-serif" font-size="36" font-weight="800" fill="#9a3412" text-anchor="middle">生日快乐</text>
    <rect x="540" y="540" width="200" height="48" rx="24" fill="#ea580c"/>
    <text x="640" y="570" font-family="Microsoft YaHei, Arial, sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">打开祝福</text>
  </svg>`;
}

function promoSmall() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280">
    ${brandDef}
    <rect width="440" height="280" fill="${BG}"/>
    <rect x="20" y="20" width="56" height="56" rx="14" fill="url(#brand)"/>
    <text x="48" y="56" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#fff" text-anchor="middle">&lt;/&gt;</text>
    <text x="90" y="44" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#fff">htmlto.link</text>
    <text x="90" y="66" font-family="Microsoft YaHei, Arial, sans-serif" font-size="12" fill="${MUTED}">ChatGPT 网页变链接</text>
    <text x="20" y="140" font-family="Microsoft YaHei, Arial, sans-serif" font-size="22" font-weight="800" fill="${TEXT}">点一下，发出去</text>
    <text x="20" y="172" font-family="Microsoft YaHei, Arial, sans-serif" font-size="16" fill="${LINK}">手机就能打开</text>
    <rect x="20" y="204" width="180" height="40" rx="20" fill="url(#brand)"/>
    <text x="110" y="230" font-family="Microsoft YaHei, Arial, sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">添加至 Chrome</text>
  </svg>`;
}

function promoMarquee() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560">
    ${brandDef}
    <rect width="1400" height="560" fill="${BG}"/>
    <text x="64" y="120" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="#fff">htmlto.link</text>
    <text x="64" y="250" font-family="Microsoft YaHei, Arial, sans-serif" font-size="48" font-weight="800" fill="#fff">ChatGPT 做好了网页。</text>
    <text x="64" y="314" font-family="Microsoft YaHei, Arial, sans-serif" font-size="48" font-weight="800" fill="${LINK}">发一个链接就够了。</text>
    <text x="64" y="380" font-family="Microsoft YaHei, Arial, sans-serif" font-size="22" fill="${MUTED}">在 ChatGPT 里点一下，手机就能打开。</text>
    <rect x="64" y="420" width="280" height="56" rx="28" fill="url(#brand)"/>
    <text x="204" y="456" font-family="Microsoft YaHei, Arial, sans-serif" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">添加至 Chrome</text>
  </svg>`;
}

async function render(svg, file, dir) {
  await sharp(Buffer.from(svg)).flatten({ background: BG }).png({ palette: false }).toFile(path.join(dir, file));
  console.log("Generated", file);
}

(async () => {
  await render(screenshot1(), "screenshot-1-chatgpt-button.png", outScreens);
  await render(screenshot2(), "screenshot-2-link-copied.png", outScreens);
  await render(screenshot3(), "screenshot-3-phone-opens.png", outScreens);
  await render(promoSmall(), "promo-tile-440x280.png", outAssets);
  await render(promoMarquee(), "promo-tile-1400x560.png", outAssets);
  console.log("All ZH promo images generated.");
})().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
