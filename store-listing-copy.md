# Chrome Web Store listing copy

Paste this into the Chrome Web Store developer dashboard.
English is the default listing. Chinese is for the zh_CN locale.

Do not mention Markdown themes, API tokens, or developer endpoints on the listing.
Anonymous links last about 24 hours; signed-in users can keep them.

Upload the zip from `npm run pack` only.

---

## English (default)

### Title (max 45 characters)

```
Share ChatGPT pages as a link
```

### Short description (max 132 characters)

```
ChatGPT made a page? Click once and get a link anyone can open on their phone.
```

### Detailed description

```
ChatGPT made a webpage. Send it as a link.

If you asked ChatGPT for a birthday page, a quiz, a menu, or a class handout, the other person cannot open the code. This extension turns that page into a normal link.

How to use
1. Install and pin the extension.
2. Open ChatGPT (also works on Claude and Gemini).
3. When you see a webpage code block, click “Generate link”.
4. The link is copied. Send it. They open it on any phone.

You can also click the toolbar icon and paste the code yourself.

Guest links last about 24 hours. Sign in at htmlto.link to keep a page longer.

Privacy
- Code is sent to https://htmlto.link only when you click publish.
- The extension does not read your chats in the background.
- You can turn off the in-page button and still publish from the popup.

Website: https://htmlto.link
```

### Screenshots (upload in this order)

1. `screenshot-1-chatgpt-button.png` — ChatGPT code block with “Generate link”
2. `screenshot-2-link-copied.png` — link copied, ready to send
3. `screenshot-3-phone-opens.png` — the other person opens it on a phone

Promo tiles: `promo-tile-440x280.png`, `promo-tile-1400x560.png`

---

## 中文（zh_CN 语言）

### 名称（最多 45 个字符）

```
ChatGPT 网页一键变成链接
```

### 简短描述

```
ChatGPT 做好的网页，点一下变成链接，发给谁都能在手机打开。
```

### 详细描述

```
ChatGPT 做好了一页网页，发给别人时请发链接，不要发代码。

生日页、菜单、测验、课件，对方打不开代码。装上插件后，在 ChatGPT 代码块上点「生成链接」，链接会复制好，发到微信或短信就能打开。

使用步骤
1. 安装并把插件固定到工具栏
2. 打开 ChatGPT（也支持 Claude、Gemini、豆包、Kimi）
3. 看到网页代码时，点「生成链接」
4. 把链接发出去即可

也可以点浏览器右上角图标，自己粘贴代码再发布。

未登录的链接大约 24 小时后失效。到 htmlto.link 登录后可以长期保存。

隐私
- 只有你点发布时，代码才会发到 https://htmlto.link
- 不会在后台读取你的对话
- 可以关掉页面上的按钮，仍可从弹窗发布

网站：https://htmlto.link
```

---

## Permission justifications (keep)

| Permission | Why |
|---|---|
| Read and change data on listed sites | Only adds a “Generate link” button on code blocks. Does not read chat text. Can be turned off. |
| file:// access | Only if you open a local HTML file and click “Publish this page”. |
| activeTab | After you click the toolbar icon, to publish the current local HTML page. |
| scripting | Reads the current page HTML when you choose to publish it. |
| storage | Saves publish history and whether the in-page button is on. |
| clipboardWrite | Copies the new link after publish. |
| htmlto.link host permission | Uploads the page so it can become a public link. |
