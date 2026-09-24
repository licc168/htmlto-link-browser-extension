# 🚀 HTML To Link - 浏览器插件 (Chrome / Edge Extension)

把 ChatGPT（以及 Claude / Gemini）做好的网页，一键变成可分享链接。商店文案与截图见 `store-listing-copy.md`。

---

## ✨ 核心功能亮点

1. **🤖 AI 聊天页面自动注入**：
   - 自动识别 **ChatGPT、Claude、DeepSeek、v0.dev、Kimi、通义千问、豆包** 等平台的代码块。
   - 在 HTML 代码块右上角注入 **`[🚀 1秒生成链接 (htmlto.link)]`** 浮动按钮，点击直接生成 URL 并自动复制剪贴板！

2. **📋 插件弹窗一键粘贴发布**：
   - 点击浏览器右上角插件图标，弹窗内粘贴 HTML 代码，一键发布。
   - 自定义文件名 (`index.html`)、实时分享历史记录及 1 键复制功能。

3. **📄 本地 HTML 一键发布**：
   - 用 Chrome 打开电脑上的 `.html` 文件，页面右上角会出现「发布此页面」。
   - 需在 `chrome://extensions` → htmlto.link → 打开 **允许访问文件网址**，然后刷新该 HTML。
   - 点工具栏图标也可以发布当前本地页；弹窗里的粘贴 / Markdown / 历史仍可用。

4. **⚙️ 支持自定义 API 节点与 Token 账号绑定**：
   - 可无缝切换线上生产节点 (`https://htmlto.link`) 或本地开发节点 (`http://localhost:3000`)。

---

## 🛠️ 安装与使用教程

### 方式一：Chrome Web Store 一键安装（推荐）

已在 Chrome 应用商店上架，点击即可安装：

> 🔗 **Chrome Web Store**：https://chromewebstore.google.com/detail/htmltolink-html-to-url-pu/bmbgkkgaadbankkjngemdljnbjbjlbbl

- **Chrome / Brave / Opera**：直接点上面链接 → 添加扩展。
- **Edge**：打开上面链接后，Edge 会提示"允许来自其他商店的扩展"→ 允许即可安装。

安装后请把插件固定到工具栏（拼图图标 → 图钉），然后可以先发布一个示例页面。匿名链接约 24 小时有效，登录 htmlto.link 并绑定 Token 后可长期保存。

### 方式二：开发者模式 / 解压加载

### 步骤 1：打开浏览器扩展管理页面
- **Chrome / Edge / Brave / Opera** 浏览器地址栏输入：
  ```text
  chrome://extensions/  （Chrome / Brave）
  edge://extensions/    （Edge）
  ```

### 步骤 2：开启“开发者模式”
- 在扩展管理页面右上角，勾选并开启 **【开发者模式 (Developer mode)】**。

### 步骤 3：加载已解压的扩展程序
- 点击左上角 **【加载已解压的扩展程序 (Load unpacked)】** 按钮。
- 选择本项目所在文件夹目录：`d:\licc\htmltolink\htmlto-link-browser-extension`。

### 步骤 4：开始体验！
1. 打开 **ChatGPT** 或 **Claude** 对话框，生成一份 HTML 落地页代码，你会发现代码块右上角多了 **生成链接** 按钮。
2. 点击按钮，获得形如 `https://htmlto.link/s/xxxx` 的在线链接。

---

## 📦 打包上传 Chrome Web Store

**不要把整个项目文件夹打成 zip。** `node_modules`（sharp）和宣传图会把体积撑到约 8MB，用户会因此卸载。

```bash
npm run pack
```

上传生成的 `dist/htmlto-link-extension.zip`（应小于 100KB）。商店详情文案见 `store-listing-copy.md`。

---

## 📁 目录结构

```text
htmlto-link-browser-extension/
├── manifest.json         # Manifest V3 配置文件
├── background.js          # 后台 Service Worker (API 上传)
├── content.js             # 平台无关的注入、发布、复制与 Toast 核心
├── platforms/             # 各 AI 平台独立 DOM 适配器，互不影响
│   ├── chatgpt.js
│   ├── deepseek.js
│   └── ...
├── content.css            # 注入按钮与 Toast 样式
├── popup.html             # 插件弹窗 HTML 界面
├── popup.js               # 插件弹窗交互逻辑
├── popup.css              # 插件弹窗样式
└── icons/                 # 插件图标 (16x16, 32x32, 48x48, 128x128)
```
