// Background Service Worker for HTML & Markdown To Link Extension

const DEFAULT_API_SERVER = "https://htmlto.link";

// Register context menus on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "htmlto_link_publish_html",
    title: "🌐 发布选中 HTML 为网页链接 (htmlto.link)",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "htmlto_link_publish_md",
    title: "📝 发布选中 Markdown 为网页链接 (htmlto.link)",
    contexts: ["selection"]
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) return;

  const isMd = info.menuItemId === "htmlto_link_publish_md";
  const filename = isMd ? "selection.md" : "selection.html";
  const label = isMd ? "Markdown" : "HTML";

  try {
    const result = await uploadContent(info.selectionText, filename);
    if (result.success && result.url) {
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "SHOW_TOAST",
          message: `🎉 已成功生成 ${label} 在线链接并复制到剪贴板！\n${result.url}`,
          url: result.url
        });
      }
      await saveToHistory(result.url, `选中 ${label} 片段`, isMd ? "markdown" : "html");
    }
  } catch (err) {
    console.error("Failed to publish selection:", err);
  }
});

// Listen for upload requests from content.js and popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "UPLOAD_CONTENT" || request.type === "UPLOAD_HTML") {
    const filename = request.filename || (request.format === "md" ? "document.md" : "index.html");
    uploadContent(request.code, filename)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === "GET_HISTORY") {
    chrome.storage.local.get(["shareHistory"], (data) => {
      sendResponse({ history: data.shareHistory || [] });
    });
    return true;
  }
});

// Helper: Upload HTML or Markdown Code to API
async function uploadContent(codeContent, filename = "index.html") {
  const settings = await chrome.storage.local.get(["apiServer", "apiToken"]);
  const baseUrl = (settings.apiServer || DEFAULT_API_SERVER).replace(/\/$/, "");
  const token = settings.apiToken || "";

  const isMd = filename.endsWith(".md") || filename.endsWith(".markdown");
  const mimeType = isMd ? "text/markdown" : "text/html";

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Primary endpoint: /api/upload
  // Secondary fallback endpoint: /api/skill/deploy
  const endpoints = [`${baseUrl}/api/upload`, `${baseUrl}/api/skill/deploy`];

  for (const endpoint of endpoints) {
    try {
      const formData = new FormData();
      const fileBlob = new Blob([codeContent], { type: mimeType });
      formData.append("file", fileBlob, filename);

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: formData
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (data.url || data.link || data.data?.url) {
        const finalUrl = data.url || data.link || data.data?.url;
        await saveToHistory(finalUrl, filename, isMd ? "markdown" : "html");
        return {
          success: true,
          url: finalUrl,
          manageUrl: data.manageUrl || "",
          expiresAt: data.expiresAt || null
        };
      }
    } catch (err) {
      console.warn(`Endpoint ${endpoint} failed, trying fallback...`, err);
    }
  }

  throw new Error("上传发布服务响应异常，请检查网络或 API 节点设置。");
}

// Save share record to local storage
async function saveToHistory(url, title, type = "html") {
  const data = await chrome.storage.local.get(["shareHistory"]);
  const list = data.shareHistory || [];
  const newItem = {
    id: Date.now().toString(36),
    url,
    title: title || (type === "markdown" ? "Markdown Document" : "HTML Snippet"),
    type,
    createdAt: new Date().toISOString()
  };

  const updated = [newItem, ...list.filter(item => item.url !== url)].slice(0, 30);
  await chrome.storage.local.set({ shareHistory: updated });
}
