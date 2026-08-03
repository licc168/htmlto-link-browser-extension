// Background Service Worker for HTML To Link Extension

const DEFAULT_API_SERVER = "https://htmlto.link";

// Register context menu on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "htmlto_link_publish_selection",
    title: "🚀 发布选中 HTML 为在线链接 (htmlto.link)",
    contexts: ["selection"]
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "htmlto_link_publish_selection" && info.selectionText) {
    try {
      const result = await uploadHtmlCode(info.selectionText, "selection.html");
      if (result.success && result.url) {
        // Copy to clipboard via message or active tab injection
        if (tab && tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: "SHOW_TOAST",
            message: `🎉 已成功生成链接并复制到剪贴板！\n${result.url}`,
            url: result.url
          });
        }
        
        // Save to history
        await saveToHistory(result.url, "选中文本片段.html");
      }
    } catch (err) {
      console.error("Failed to publish selection:", err);
    }
  }
});

// Listen for upload requests from content.js and popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "UPLOAD_HTML") {
    uploadHtmlCode(request.code, request.filename || "index.html")
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (request.type === "GET_HISTORY") {
    chrome.storage.local.get(["shareHistory"], (data) => {
      sendResponse({ history: data.shareHistory || [] });
    });
    return true;
  }
});

// Helper: Upload HTML Code to API
async function uploadHtmlCode(codeContent, filename = "index.html") {
  const settings = await chrome.storage.local.get(["apiServer", "apiToken"]);
  const baseUrl = (settings.apiServer || DEFAULT_API_SERVER).replace(/\/$/, "");
  const token = settings.apiToken || "";

  const formData = new FormData();
  const fileBlob = new Blob([codeContent], { type: "text/html" });
  formData.append("file", fileBlob, filename);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    headers,
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  if (data.url || data.link || data.data?.url) {
    const finalUrl = data.url || data.link || data.data?.url;
    
    // Copy URL to clipboard
    try {
      await chrome.offscreen?.createDocument({
        url: 'offscreen.html',
        reasons: ['CLIPBOARD'],
        justification: 'Copy URL to clipboard',
      });
    } catch (e) {
      // Ignore if offscreen doc exists
    }

    await saveToHistory(finalUrl, filename);

    return {
      success: true,
      url: finalUrl,
      manageUrl: data.manageUrl || "",
      expiresAt: data.expiresAt || null
    };
  }

  return { success: false, error: data.error || "未知错误" };
}

// Save share record to local storage
async function saveToHistory(url, title) {
  const data = await chrome.storage.local.get(["shareHistory"]);
  const list = data.shareHistory || [];
  const newItem = {
    id: Date.now().toString(36),
    url,
    title: title || "HTML Snippet",
    createdAt: new Date().toISOString()
  };

  // Keep last 30 items
  const updated = [newItem, ...list.filter(item => item.url !== url)].slice(0, 30);
  await chrome.storage.local.set({ shareHistory: updated });
}
