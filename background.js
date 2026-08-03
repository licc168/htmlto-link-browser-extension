// Background Service Worker for HTML & Markdown To Link Extension

const DEFAULT_API_SERVER = "https://htmlto.link";

// Setup Right-Click Context Menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "upload-selected-html",
    title: "🌐 发布选中 HTML",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "upload-selected-md",
    title: "📝 发布选中 Markdown (简洁)",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) return;

  const isMd = info.menuItemId === "upload-selected-md";
  const filename = isMd ? "selected-document.md" : "selected-page.html";
  const format = isMd ? "md" : "html";
  const templateId = isMd ? "plain" : undefined;

  try {
    const result = await uploadContent(info.selectionText, filename, format, templateId);
    if (result.success && result.url) {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "SHOW_TOAST",
          message: `🎉 已发布选中文本并生成 ${isMd ? "Markdown" : "HTML"} 链接！`,
          url: result.url
        });
      }
    }
  } catch (err) {
    console.error("Context menu upload error:", err);
  }
});

// Handle Messages from Content Script & Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "UPLOAD_CONTENT") {
    uploadContent(request.code, request.filename, request.format, request.templateId)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function uploadContent(codeContent, filename = "index.html", format = "html", templateId = "plain") {
  const settings = await chrome.storage.local.get(["apiServer", "apiToken"]);
  const baseUrl = (settings.apiServer || DEFAULT_API_SERVER).replace(/\/$/, "");
  const token = settings.apiToken || "";

  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const endpoint = `${baseUrl}/api/upload`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        code: codeContent,
        filename,
        format,
        templateId: format === "md" ? (templateId || "plain") : undefined
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const finalUrl = data.url || data.shareUrl || data.link || data.data?.url;

    if (finalUrl) {
      return {
        success: true,
        url: finalUrl,
        manageUrl: data.manageUrl || ""
      };
    } else {
      throw new Error(data.error || data.message || "未能生成有效链接");
    }
  } catch (err) {
    console.error("Upload error via /api/upload:", err);
    throw err;
  }
}
