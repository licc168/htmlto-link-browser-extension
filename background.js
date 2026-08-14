// Background Service Worker for HTML & Markdown To Link Extension

const DEFAULT_API_SERVER = "https://htmlto.link";
const UNINSTALL_SURVEY_URL = "https://htmlto.link/uninstall-survey";

chrome.runtime.onInstalled.addListener((details) => {
  // 用户卸载时打开调查页，收集真实反馈
  chrome.runtime.setUninstallURL(UNINSTALL_SURVEY_URL);

  // 首次安装时打开引导页（仅首次，更新时不打扰）
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
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

const MAX_UPLOAD_ATTEMPTS = 3;
const RETRY_DELAY_MS = 900;
const FETCH_TIMEOUT_MS = 15000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableHttpStatus(status) {
  return status >= 500 || status === 408 || status === 429;
}

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
  const body = JSON.stringify({
    code: codeContent,
    filename,
    format,
    templateId: format === "md" ? (templateId || "plain") : undefined
  });

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt++) {
    let httpStatus = 0;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body,
        signal: controller.signal
      });
      httpStatus = response.status;

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
      }
      throw new Error(data.error || data.message || chrome.i18n.getMessage("invalidLink"));
    } catch (err) {
      lastError = err;
      // 无 httpStatus = 网络层错误（断网 / 抖动 / 超时），一律重试；
      // 有 httpStatus 则只有 5xx / 408 / 429 这类服务端瞬时错误才重试，4xx 直接失败。
      const retryable = httpStatus ? isRetryableHttpStatus(httpStatus) : true;
      if (retryable && attempt < MAX_UPLOAD_ATTEMPTS) {
        console.warn(`[htmlto.link] 上传第 ${attempt}/${MAX_UPLOAD_ATTEMPTS} 次失败，${RETRY_DELAY_MS * attempt}ms 后重试`, err);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error("upload failed");
}
