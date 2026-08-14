const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outScreens = path.join(__dirname, "..", "publish-kit", "zh_CN", "截图");
const outAssets = path.join(__dirname, "..", "publish-kit", "zh_CN", "素材");
for (const d of [outScreens, outAssets]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

const BG_DARK = "#0f172a";
const BG_CARD = "#1e293b";
const BG_INPUT = "#182232";
const PRIMARY = "#2563eb";
const PRIMARY_2 = "#4f46e5";
const ACCENT = "#10b981";
const LINK = "#38bdf8";
const TEXT = "#f8fafc";
const MUTED = "#94a3b8";
const BORDER = "rgba(255,255,255,0.12)";

function appHeader(subtitle) {
  return `<rect width="100%" height="72" fill="${BG_DARK}"/>
  <defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${PRIMARY}"/><stop offset="100%" stop-color="${PRIMARY_2}"/>
  </linearGradient></defs>
  <rect x="24" y="20" width="40" height="40" rx="10" fill="url(#brand)"/>
  <path d="M36 38a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M50 26a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="76" y="38" font-family="Arial, sans-serif" font-size="19" font-weight="800" fill="${TEXT}">htmlto.link</text>
  <text x="76" y="55" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">${subtitle}</text>`;
}

function screenshot1() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PRIMARY}"/><stop offset="100%" stop-color="${PRIMARY_2}"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="${BG_DARK}"/>
    </linearGradient></defs>
    <rect width="1280" height="800" fill="url(#bgGrad)"/>
    ${appHeader("HTML to URL 发布器 · v1.1.0")}
    <text x="24" y="120" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${TEXT}">把 HTML 或 AI 生成的代码发布为可分享链接</text>
    <text x="24" y="152" font-family="Arial, sans-serif" font-size="16" fill="${MUTED}">粘贴代码 → 点击发布 → 1 秒获得公开 URL</text>
    <rect x="24" y="180" width="620" height="560" rx="16" fill="${BG_CARD}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="52" y="208" width="130" height="30" rx="8" fill="${PRIMARY}"/>
    <text x="64" y="228" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#ffffff">HTML 网页</text>
    <rect x="188" y="208" width="130" height="30" rx="8" fill="rgba(255,255,255,0.05)" stroke="${BORDER}" stroke-width="1"/>
    <text x="200" y="228" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${MUTED}">Markdown</text>
    <rect x="52" y="256" width="564" height="240" rx="10" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="68" y="284" font-family="Consolas, monospace" font-size="15" fill="#7dd3fc">&lt;!DOCTYPE html&gt;</text>
    <text x="68" y="310" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;html lang="zh-CN"&gt;</text>
    <text x="68" y="336" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;head&gt;</text>
    <text x="68" y="362" font-family="Consolas, monospace" font-size="15" fill="#e2e8f0">  &lt;title&gt;落地页&lt;/title&gt;</text>
    <text x="68" y="388" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;/head&gt;</text>
    <text x="68" y="414" font-family="Consolas, monospace" font-size="15" fill="#e2e8f0">  &lt;h1&gt;你好，世界&lt;/h1&gt;</text>
    <text x="68" y="440" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;/html&gt;</text>
    <rect x="52" y="514" width="564" height="34" rx="8" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="64" y="535" font-family="Arial, sans-serif" font-size="13" fill="${MUTED}">文件名 (默认: index.html)</text>
    <rect x="52" y="562" width="564" height="44" rx="10" fill="url(#brand)"/>
    <text x="256" y="589" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#ffffff">🚀 发布生成公开 URL</text>
    <rect x="52" y="626" width="564" height="92" rx="10" fill="${BG_INPUT}" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
    <text x="68" y="650" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="${ACCENT}">✅ 发布成功</text>
    <rect x="68" y="662" width="380" height="30" rx="6" fill="${BG_DARK}" stroke="${BORDER}" stroke-width="1"/>
    <text x="80" y="682" font-family="Consolas, monospace" font-size="13" fill="${LINK}">https://htmlto.link/s/abc123</text>
    <rect x="458" y="662" width="70" height="30" rx="6" fill="${PRIMARY}"/>
    <text x="480" y="682" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#ffffff">复制</text>
    <text x="68" y="706" font-family="Arial, sans-serif" font-size="12" fill="${LINK}" text-decoration="underline">在新标签页打开 ↗</text>
    <text x="756" y="220" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="${TEXT}">三步使用</text>
    <rect x="756" y="244" width="460" height="96" rx="12" fill="${BG_CARD}" stroke="${BORDER}" stroke-width="1"/>
    <circle cx="792" cy="280" r="16" fill="url(#brand)"/>
    <text x="792" y="286" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">1</text>
    <text x="820" y="272" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${TEXT}">复制 AI 代码块</text>
    <text x="820" y="294" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">ChatGPT / Claude / DeepSeek / v0 / Kimi</text>
    <text x="820" y="312" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">自动在代码块上注入发布按钮</text>
    <text x="820" y="330" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">无需注册、无需服务器</text>
    <rect x="756" y="356" width="460" height="96" rx="12" fill="${BG_CARD}" stroke="${BORDER}" stroke-width="1"/>
    <circle cx="792" cy="392" r="16" fill="url(#brand)"/>
    <text x="792" y="398" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">2</text>
    <text x="820" y="384" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${TEXT}">点击发布</text>
    <text x="820" y="406" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">弹窗粘贴，一键即可发布</text>
    <text x="820" y="424" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">支持 Markdown 文档与多主题渲染</text>
    <text x="820" y="442" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">自定义 API 节点与 Token 绑定</text>
    <rect x="756" y="468" width="460" height="96" rx="12" fill="${BG_CARD}" stroke="${BORDER}" stroke-width="1"/>
    <circle cx="792" cy="504" r="16" fill="url(#brand)"/>
    <text x="792" y="510" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">3</text>
    <text x="820" y="496" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${TEXT}">分享公开 URL</text>
    <text x="820" y="518" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">https://htmlto.link/s/xxxx 自动复制</text>
    <text x="820" y="536" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">手机、同事、客户随时打开</text>
    <text x="820" y="554" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">发布历史随时复制复用</text>
    <text x="756" y="640" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#ffffff">别再截图发代码了。</text>
    <text x="756" y="672" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${LINK}">几秒发布真实可点击的网页。</text>
  </svg>`;
}

function screenshot2() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PRIMARY}"/><stop offset="100%" stop-color="${PRIMARY_2}"/>
    </linearGradient></defs>
    <rect width="1280" height="800" fill="${BG_DARK}"/>
    ${appHeader("在 AI 聊天页面自动注入发布按钮")}
    <text x="24" y="110" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${TEXT}">在 ChatGPT / Claude / DeepSeek / v0 / Kimi 的代码块上一键发布</text>
    <rect x="24" y="140" width="1232" height="24" rx="6" fill="#1a1f33"/>
    <text x="40" y="157" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">你：帮我生成一个产品落地页 HTML</text>
    <rect x="24" y="180" width="1232" height="480" rx="12" fill="#0d1424" stroke="${BORDER}" stroke-width="1"/>
    <rect x="24" y="180" width="1232" height="44" rx="12" fill="#161d31"/>
    <text x="40" y="208" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${TEXT}">HTML</text>
    <rect x="1010" y="188" width="230" height="28" rx="14" fill="url(#brand)"/>
    <text x="1028" y="207" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#ffffff">🚀 1秒生成链接 (htmlto.link)</text>
    <text x="48" y="268" font-family="Consolas, monospace" font-size="15" fill="#7dd3fc">&lt;!DOCTYPE html&gt;</text>
    <text x="48" y="296" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;html lang="zh-CN"&gt;</text>
    <text x="48" y="324" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;head&gt;</text>
    <text x="48" y="352" font-family="Consolas, monospace" font-size="15" fill="#e2e8f0">  &lt;meta charset="UTF-8"&gt;</text>
    <text x="48" y="380" font-family="Consolas, monospace" font-size="15" fill="#e2e8f0">  &lt;title&gt;我的产品落地页&lt;/title&gt;</text>
    <text x="48" y="408" font-family="Consolas, monospace" font-size="15" fill="#e2e8f0">  &lt;style&gt;</text>
    <text x="48" y="436" font-family="Consolas, monospace" font-size="15" fill="#93c5fd">    body { font-family: system-ui; margin: 0; }</text>
    <text x="48" y="464" font-family="Consolas, monospace" font-size="15" fill="#93c5fd">    .hero { background: linear-gradient(...); }</text>
    <text x="48" y="492" font-family="Consolas, monospace" font-size="15" fill="#e2e8f0">  &lt;/style&gt;</text>
    <text x="48" y="520" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;/head&gt;</text>
    <text x="48" y="548" font-family="Consolas, monospace" font-size="15" fill="#e2e8f0">  &lt;h1&gt;你好，世界&lt;/h1&gt;</text>
    <text x="48" y="576" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;/html&gt;</text>
    <text x="24" y="700" font-family="Arial, sans-serif" font-size="15" fill="${MUTED}">点击按钮后自动上传，URL 立即写入剪贴板，直接发给同事或手机打开。</text>
    <text x="24" y="730" font-family="Arial, sans-serif" font-size="15" fill="${MUTED}">支持：ChatGPT · Claude · DeepSeek · v0.dev · Kimi · 通义千问 · 豆包 · Gemini</text>
  </svg>`;
}

function screenshot3() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PRIMARY}"/><stop offset="100%" stop-color="${PRIMARY_2}"/>
    </linearGradient></defs>
    <rect width="1280" height="800" fill="${BG_DARK}"/>
    ${appHeader("弹窗发布、历史记录与设置")}
    <text x="24" y="118" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${TEXT}">弹窗一键粘贴发布，支持 Markdown 与多主题渲染</text>
    <rect x="24" y="150" width="610" height="600" rx="16" fill="${BG_CARD}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="52" y="178" width="130" height="30" rx="8" fill="rgba(255,255,255,0.05)" stroke="${BORDER}" stroke-width="1"/>
    <text x="64" y="198" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${MUTED}">粘贴代码</text>
    <rect x="188" y="178" width="130" height="30" rx="8" fill="${PRIMARY}"/>
    <text x="200" y="198" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#ffffff">历史链接</text>
    <rect x="324" y="178" width="130" height="30" rx="8" fill="rgba(255,255,255,0.05)" stroke="${BORDER}" stroke-width="1"/>
    <text x="336" y="198" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${MUTED}">设置</text>
    <rect x="52" y="230" width="554" height="74" rx="10" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="68" y="258" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${TEXT}">产品落地页</text>
    <text x="68" y="280" font-family="Consolas, monospace" font-size="12" fill="${LINK}">https://htmlto.link/s/abc123</text>
    <rect x="470" y="244" width="50" height="24" rx="6" fill="rgba(255,255,255,0.05)" stroke="${BORDER}" stroke-width="1"/>
    <text x="478" y="260" font-family="Arial, sans-serif" font-size="10" fill="${MUTED}">HTML</text>
    <rect x="540" y="244" width="50" height="24" rx="6" fill="${PRIMARY}"/>
    <text x="552" y="260" font-family="Arial, sans-serif" font-size="10" fill="#ffffff">复制</text>
    <rect x="52" y="318" width="554" height="74" rx="10" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="68" y="346" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${TEXT}">README.md</text>
    <text x="68" y="368" font-family="Consolas, monospace" font-size="12" fill="${LINK}">https://htmlto.link/s/def456</text>
    <rect x="470" y="332" width="50" height="24" rx="6" fill="rgba(255,255,255,0.05)" stroke="${BORDER}" stroke-width="1"/>
    <text x="478" y="348" font-family="Arial, sans-serif" font-size="10" fill="${MUTED}">MD</text>
    <rect x="540" y="332" width="50" height="24" rx="6" fill="${PRIMARY}"/>
    <text x="552" y="348" font-family="Arial, sans-serif" font-size="10" fill="#ffffff">复制</text>
    <rect x="52" y="406" width="554" height="74" rx="10" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="68" y="434" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${TEXT}">AI 生成落地页</text>
    <text x="68" y="456" font-family="Consolas, monospace" font-size="12" fill="${LINK}">https://htmlto.link/s/ghi789</text>
    <rect x="470" y="420" width="50" height="24" rx="6" fill="rgba(255,255,255,0.05)" stroke="${BORDER}" stroke-width="1"/>
    <text x="478" y="436" font-family="Arial, sans-serif" font-size="10" fill="${MUTED}">HTML</text>
    <rect x="540" y="420" width="50" height="24" rx="6" fill="${PRIMARY}"/>
    <text x="552" y="436" font-family="Arial, sans-serif" font-size="10" fill="#ffffff">复制</text>
    <rect x="52" y="494" width="554" height="74" rx="10" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="68" y="522" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${TEXT}">Markdown 备忘</text>
    <text x="68" y="544" font-family="Consolas, monospace" font-size="12" fill="${LINK}">https://htmlto.link/s/jkl012</text>
    <rect x="470" y="508" width="50" height="24" rx="6" fill="rgba(255,255,255,0.05)" stroke="${BORDER}" stroke-width="1"/>
    <text x="478" y="524" font-family="Arial, sans-serif" font-size="10" fill="${MUTED}">MD</text>
    <rect x="540" y="508" width="50" height="24" rx="6" fill="${PRIMARY}"/>
    <text x="552" y="524" font-family="Arial, sans-serif" font-size="10" fill="#ffffff">复制</text>
    <rect x="680" y="150" width="576" height="600" rx="16" fill="${BG_CARD}" stroke="${BORDER}" stroke-width="1"/>
    <text x="708" y="190" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="${TEXT}">⚙️ 设置</text>
    <text x="708" y="230" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="${TEXT}">服务节点地址 (API Server)</text>
    <rect x="708" y="242" width="520" height="38" rx="8" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="720" y="266" font-family="Consolas, monospace" font-size="13" fill="${LINK}">https://htmlto.link</text>
    <text x="708" y="296" font-family="Arial, sans-serif" font-size="11" fill="${MUTED}">生产节点: https://htmlto.link / 本地测试: http://localhost:3000</text>
    <text x="708" y="330" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="${TEXT}">API Token (可选)</text>
    <rect x="708" y="342" width="520" height="38" rx="8" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <circle cx="732" cy="361" r="3" fill="${MUTED}"/><circle cx="744" cy="361" r="3" fill="${MUTED}"/><circle cx="756" cy="361" r="3" fill="${MUTED}"/><circle cx="768" cy="361" r="3" fill="${MUTED}"/><circle cx="780" cy="361" r="3" fill="${MUTED}"/>
    <text x="708" y="398" font-family="Arial, sans-serif" font-size="11" fill="${MUTED}">登录 htmlto.link 后在设置中心生成个人 API Token</text>
    <rect x="708" y="420" width="180" height="40" rx="8" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="756" y="445" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="${TEXT}">保存设置</text>
    <text x="708" y="500" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${TEXT}">Markdown 模板</text>
    <rect x="708" y="520" width="520" height="54" rx="10" fill="${BG_INPUT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="724" y="546" font-family="Arial, sans-serif" font-size="13" fill="${TEXT}">9 种内置渲染模板，一键切换风格</text>
    <text x="724" y="564" font-family="Arial, sans-serif" font-size="11" fill="${MUTED}">简洁 · 备忘录 · 暗黑科技 · 波普艺术 · 阿里橙…</text>
    <text x="708" y="614" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${TEXT}">支持平台</text>
    <text x="708" y="646" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">ChatGPT · Claude · DeepSeek · v0.dev · Kimi · Gemini</text>
    <text x="708" y="668" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">通义千问 · 豆包 · 百度文心 · 腾讯元宝</text>
  </svg>`;
}

function promoSmall() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280">
    <defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PRIMARY}"/><stop offset="100%" stop-color="${PRIMARY_2}"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="${BG_DARK}"/>
    </linearGradient></defs>
    <rect width="440" height="280" fill="url(#bgGrad)"/>
    <rect x="16" y="16" width="64" height="64" rx="14" fill="url(#brand)"/>
    <path d="M33 46a9 9 0 0 0 13.6 1l5.4-5.4a9 9 0 0 0-12.7-12.7l-3.1 3.1" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M47 34a9 9 0 0 0-13.6-1L28 38.4A9 9 0 0 0 40.7 51l3.1-3.1" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="96" y="48" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#ffffff">htmlto.link</text>
    <text x="96" y="68" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">HTML 转 URL 发布器</text>
    <text x="16" y="120" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="${TEXT}">把 HTML / AI 代码</text>
    <text x="16" y="144" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="${LINK}">1 秒发布成可分享链接</text>
    <text x="16" y="178" font-family="Arial, sans-serif" font-size="12" fill="${MUTED}">粘贴代码 · 点击发布 · 1 秒获得公开 URL</text>
    <rect x="16" y="200" width="176" height="34" rx="17" fill="url(#brand)"/>
    <text x="60" y="223" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#ffffff">🚀 立即安装</text>
  </svg>`;
}

function promoMarquee() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560">
    <defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PRIMARY}"/><stop offset="100%" stop-color="${PRIMARY_2}"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1020"/><stop offset="55%" stop-color="${BG_DARK}"/><stop offset="100%" stop-color="#111c3a"/>
    </linearGradient></defs>
    <rect width="1400" height="560" fill="url(#bgGrad)"/>
    <rect x="60" y="60" width="84" height="84" rx="18" fill="url(#brand)"/>
    <path d="M92 96a12 12 0 0 0 18 1.4l7.2-7.2a12 12 0 0 0-17-17l-4.1 4.1" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M124 80a12 12 0 0 0-18-1.4l-7.2 7.2a12 12 0 0 0 17 17l4.1-4.1" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="168" y="100" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff">htmlto.link</text>
    <text x="168" y="132" font-family="Arial, sans-serif" font-size="17" fill="${MUTED}">HTML 转 URL 发布器 · Chrome / Edge 扩展</text>
    <text x="60" y="240" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#ffffff">把 HTML / AI 代码</text>
    <text x="60" y="300" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="${LINK}">1 秒发布成可分享在线链接</text>
    <text x="60" y="352" font-family="Arial, sans-serif" font-size="20" fill="${MUTED}">粘贴代码 · 点击发布 · 1 秒获得公开 URL</text>
    <text x="60" y="386" font-family="Arial, sans-serif" font-size="20" fill="${MUTED}">支持 ChatGPT · Claude · DeepSeek · v0.dev · Kimi · Gemini</text>
    <rect x="60" y="420" width="240" height="56" rx="28" fill="url(#brand)"/>
    <text x="128" y="455" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">🚀 立即安装</text>
    <g transform="translate(760,40)">
      <rect x="0" y="0" width="520" height="440" rx="20" fill="#141d33" stroke="${BORDER}" stroke-width="1"/>
      <rect x="24" y="24" width="472" height="30" rx="8" fill="url(#brand)"/>
      <text x="160" y="45" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#fff">🚀 1秒生成链接 (htmlto.link)</text>
      <text x="24" y="92" font-family="Consolas, monospace" font-size="15" fill="#7dd3fc">&lt;!DOCTYPE html&gt;</text>
      <text x="24" y="118" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;html lang="zh-CN"&gt;</text>
      <text x="24" y="144" font-family="Consolas, monospace" font-size="15" fill="#e2e8f0">  &lt;h1&gt;你好，世界&lt;/h1&gt;</text>
      <text x="24" y="170" font-family="Consolas, monospace" font-size="15" fill="#f8fafc">&lt;/html&gt;</text>
      <rect x="24" y="216" width="472" height="76" rx="10" fill="${BG_INPUT}" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
      <text x="40" y="244" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="${ACCENT}">✅ 发布成功</text>
      <text x="40" y="272" font-family="Consolas, monospace" font-size="14" fill="${LINK}">https://htmlto.link/s/abc123</text>
      <rect x="300" y="234" width="90" height="32" rx="8" fill="${PRIMARY}"/>
      <text x="322" y="255" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#fff">复制链接</text>
      <text x="24" y="336" font-family="Arial, sans-serif" font-size="13" fill="${MUTED}">三步使用：</text>
      <text x="24" y="366" font-family="Arial, sans-serif" font-size="13" fill="${TEXT}">1. 在 AI 对话页复制 HTML 代码</text>
      <text x="24" y="392" font-family="Arial, sans-serif" font-size="13" fill="${TEXT}">2. 点击代码块上的发布按钮</text>
      <text x="24" y="418" font-family="Arial, sans-serif" font-size="13" fill="${TEXT}">3. 自动复制 URL，发给同事/手机打开</text>
    </g>
  </svg>`;
}

async function render(svg, file, dir) {
  const buf = Buffer.from(svg);
  await sharp(buf)
    .flatten({ background: "#0f172a" })
    .png({ palette: false })
    .toFile(path.join(dir, file));
  console.log(`Generated ${file}`);
}

(async () => {
  await render(screenshot1(), "screenshot-1-publish.png", outScreens);
  await render(screenshot2(), "screenshot-2-ai-code-block.png", outScreens);
  await render(screenshot3(), "screenshot-3-settings-history.png", outScreens);
  await render(promoSmall(), "promo-tile-440x280.png", outAssets);
  await render(promoMarquee(), "promo-tile-1400x560.png", outAssets);
  console.log("All zh_CN promo images generated.");
})().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
