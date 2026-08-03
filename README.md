# 🚀 HTML To Link - 浏览器插件 (Chrome / Edge Extension)

一款极其高效的浏览器扩展插件，帮助开发者、设计师与 AI 使用者一键将 HTML 代码、AI 网页生成结果（ChatGPT / Claude / DeepSeek / v0 / Kimi）或网页选中文本转换为**可在线分享的公开 URL** (https://htmlto.link/s/xxxxx)。

---

## ✨ 核心功能亮点

1. **🤖 AI 聊天页面自动注入**：
   - 自动识别 **ChatGPT、Claude、DeepSeek、v0.dev、Kimi、通义千问、豆包** 等平台的代码块。
   - 在 HTML 代码块右上角注入 **`[🚀 1秒生成链接 (htmlto.link)]`** 浮动按钮，点击直接生成 URL 并自动复制剪贴板！

2. **📋 插件弹窗一键粘贴发布**：
   - 点击浏览器右上角插件图标，弹窗内粘贴 HTML 代码，一键发布。
   - 自定义文件名 (`index.html`)、实时分享历史记录及 1 键复制功能。

3. **🖱️ 鼠标右键选中即发布**：
   - 选中文本/代码 -> 右键菜单 **`🚀 发布选中 HTML 为在线链接 (htmlto.link)`** -> 自动上传并提示生成链接。

4. **⚙️ 支持自定义 API 节点与 Token 账号绑定**：
   - 可无缝切换线上生产节点 (`https://htmlto.link`) 或本地开发节点 (`http://localhost:3000`)。

---

## 🛠️ 安装与使用教程 (开发者模式/解压加载)

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
1. 打开 **ChatGPT** 或 **Claude** 对话框，生成一份 HTML 落地页代码，你会发现代码块右上角多了 **`[🚀 1秒生成链接]`** 按钮！
2. 点击按钮，瞬间获得形如 `https://htmlto.link/s/xxxx` 的在线链接，直接发给同事或手机打开！

---

## 📁 目录结构

```text
htmlto-link-browser-extension/
├── manifest.json         # Manifest V3 配置文件
├── background.js          # 后台 Service Worker (右键菜单 / API 上传)
├── content.js             # AI 页面代码块识别注入 & Toast 提示
├── content.css            # 注入按钮与 Toast 样式
├── popup.html             # 插件弹窗 HTML 界面
├── popup.js               # 插件弹窗交互逻辑
├── popup.css              # 插件弹窗样式
└── icons/                 # 插件图标 (16x16, 32x32, 48x48, 128x128)
```
