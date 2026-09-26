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
  if (request.type === "READ_EXTENSION_TEXT") {
    const path = String(request.path || "");
    if (!path.startsWith("preview/") || path.includes("..") || path.includes("\\")) {
      sendResponse({ ok: false, error: "bad preview path" });
      return false;
    }
    fetch(chrome.runtime.getURL(path))
      .then((response) => {
        if (!response.ok) throw new Error(`preview asset ${response.status}`);
        return response.text();
      })
      .then((text) => sendResponse({ ok: true, text }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (request.type === "READ_CHATGPT_NATIVE") {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: "MAIN",
      func: readChatgptConversationInPage
    }).then((results) => sendResponse({ turns: results?.[0]?.result || null }))
      .catch((err) => sendResponse({ turns: null, error: err.message }));
    return true;
  }

  if (request.type === "UPLOAD_CONTENT") {
    uploadContent(request.code, request.filename, request.format, request.templateId, request.themeClass)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

const MAX_UPLOAD_ATTEMPTS = 3;
const RETRY_DELAY_MS = 900;
const FETCH_TIMEOUT_MS = 15000;

async function readChatgptConversationInPage() {
  const messages = [...document.querySelectorAll('[data-message-author-role="user"], [data-message-author-role="assistant"]')];
  const clipboard = navigator.clipboard;
  const originalWriteText = clipboard?.writeText?.bind(clipboard);
  const originalWrite = clipboard?.write?.bind(clipboard);
  const captured = [];
  const take = (text) => {
    const value = String(text ?? "").trim();
    if (value) captured.push(value);
  };
  if (originalWriteText) {
    clipboard.writeText = async (text) => {
      take(text);
      try { return await originalWriteText(text); } catch { return undefined; }
    };
  }
  if (originalWrite) {
    clipboard.write = async (items) => {
      for (const item of items || []) {
        try {
          const blob = await item.getType("text/plain");
          take(await blob.text());
        } catch { /* 这项不是纯文本 */ }
      }
      try { return await originalWrite(items); } catch { return undefined; }
    };
  }
  const onCopy = (event) => take(event.clipboardData?.getData("text/plain"));
  document.addEventListener("copy", onCopy, true);
  const isReplyCopy = (item) => {
    const label = `${item.getAttribute("aria-label") || ""} ${item.getAttribute("title") || ""} ${item.getAttribute("data-testid") || ""}`;
    return /copy-turn|复制回复|复制回答|Copy response|Copy message|^复制$|^Copy$/i.test(label);
  };
  const copied = [];
  for (const message of messages) {
    const role = message.getAttribute("data-message-author-role");
    let scope = message;
    scope.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    scope.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 80));
    let button = null;
    for (let depth = 0; depth < 8 && scope && !button; depth += 1) {
      button = [...scope.querySelectorAll("button")].find(isReplyCopy) || null;
      scope = scope.parentElement;
    }
    const before = captured.length;
    button?.click();
    if (button) await new Promise((resolve) => setTimeout(resolve, 200));
    const markdown = captured.length > before ? captured[captured.length - 1] : "";
    copied.push({ role, markdown: markdown || null });
  }
  document.removeEventListener("copy", onCopy, true);
  if (originalWriteText) clipboard.writeText = originalWriteText;
  if (originalWrite) clipboard.write = originalWrite;
  if (copied.some((turn) => turn.markdown)) return copied;

  const match = location.pathname.match(/\/c\/([^/?#]+)/);
  if (!match) return null;
  let headers = { accept: "application/json" };
  try {
    const session = await fetch("/api/auth/session", { credentials: "include" }).then((res) => res.json());
    if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;
  } catch { /* 没有登录态时继续用 cookie */ }
  const response = await fetch(`/backend-api/conversation/${match[1]}`, { credentials: "include", headers });
  if (!response.ok) return null;
  const data = await response.json();
  const mapping = data.mapping || {};
  const chain = [];
  const seen = new Set();
  let id = data.current_node;
  while (id && mapping[id] && !seen.has(id)) {
    seen.add(id);
    chain.push(mapping[id]);
    id = mapping[id].parent;
  }
  chain.reverse();
  const turns = [];
  chain.forEach((node) => {
    const message = node.message;
    const role = message?.author?.role;
    if (role !== "user" && role !== "assistant") return;
    if (message.metadata?.is_visually_hidden_from_conversation) return;
    const parts = Array.isArray(message.content?.parts) ? message.content.parts : [];
    const markdown = parts.map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part.text === "string") return part.text;
      return "";
    }).filter(Boolean).join("\n\n").trim();
    if (!markdown) return;
    turns.push({ role, markdown });
  });
  return turns.length ? turns : null;
}

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

async function uploadContent(codeContent, filename = "index.html", format = "html", templateId = "plain", themeClass = "") {
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
    themeClass: format === "md" ? (themeClass || "") : undefined,
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
