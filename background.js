// Background Service Worker for HTML & Markdown To Link Extension

const DEFAULT_API_SERVER = "https://htmlto.link";
const UNINSTALL_SURVEY_URL = "https://htmlto.link/uninstall-survey";

chrome.runtime.onInstalled.addListener((details) => {
  chrome.runtime.setUninstallURL(UNINSTALL_SURVEY_URL);

  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
  }
});

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

function t(key) {
  return chrome.i18n.getMessage(key) || key;
}

function humanizeUploadError(err, httpStatus, errorText) {
  const raw = `${errorText || ""} ${err && err.message ? err.message : ""}`;

  if (httpStatus === 401) return t("errorInvalidToken");
  if (httpStatus === 429 || /QUOTA_EXCEEDED/i.test(raw)) return t("errorQuota");
  if (err && err.name === "AbortError") return t("errorTimeout");
  if (!httpStatus) return t("errorNetwork");
  if (httpStatus >= 500) return t("errorServer");

  const jsonMatch = String(errorText || "").match(/"message"\s*:\s*"([^"]+)"/)
    || String(errorText || "").match(/"error"\s*:\s*"([^"]+)"/);
  if (jsonMatch && jsonMatch[1]) return jsonMatch[1];

  return t("publishFailed");
}

function buildManageUrl(baseUrl, shareUrl) {
  try {
    const parsed = new URL(shareUrl);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const hash = parts[parts.length - 1];
    if (hash) return `${baseUrl}/my/${encodeURIComponent(hash)}`;
  } catch {
    // fall through
  }
  return `${baseUrl}/my`;
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
    templateId: format === "md" ? (templateId || "plain") : undefined,
    channel: "extension"
  });

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt++) {
    let httpStatus = 0;
    let errorText = "";
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
        errorText = await response.text();
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const finalUrl = data.url || data.shareUrl || data.link || data.data?.url;

      if (finalUrl) {
        return {
          success: true,
          url: finalUrl,
          manageUrl: data.manageUrl || buildManageUrl(baseUrl, finalUrl),
          expiresAt: data.expiresAt || null,
          temporary: data.temporary === true || !token
        };
      }
      throw new Error(data.error || data.message || t("invalidLink"));
    } catch (err) {
      lastError = err;
      const retryable = httpStatus ? isRetryableHttpStatus(httpStatus) : true;
      if (retryable && attempt < MAX_UPLOAD_ATTEMPTS) {
        console.warn(`[htmlto.link] upload ${attempt}/${MAX_UPLOAD_ATTEMPTS} failed, retrying`, err);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      throw new Error(humanizeUploadError(err, httpStatus, errorText));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error(t("publishFailed"));
}
