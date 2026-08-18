// Popup Logic for HTML & Markdown To Link Chrome Extension

document.addEventListener("DOMContentLoaded", async () => {
  const DEFAULT_API_SERVER = "https://htmlto.link";
  const REVIEW_URL = "https://chromewebstore.google.com/detail/htmltolink-html-to-url-pu/bmbgkkgaadbankkjngemdljnbjbjlbbl/reviews";
  const t = (key, substitutions) => chrome.i18n.getMessage(key, substitutions) || key;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const msg = t(el.getAttribute("data-i18n"));
    if (msg) el.textContent = msg;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const msg = t(el.getAttribute("data-i18n-placeholder"));
    if (msg) el.placeholder = msg;
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const msg = t(el.getAttribute("data-i18n-title"));
    if (msg) el.title = msg;
  });
  document.title = t("extName");

  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const formatBtns = document.querySelectorAll(".format-btn");

  const codeInput = document.getElementById("codeInput");
  const filenameInput = document.getElementById("filenameInput");
  const publishBtn = document.getElementById("publishBtn");
  const publishBtnText = document.getElementById("publishBtnText");
  const tryDemoBtn = document.getElementById("tryDemoBtn");
  const publishLocalBtn = document.getElementById("publishLocalBtn");
  const publishLocalBtnText = document.getElementById("publishLocalBtnText");
  const localFileCard = document.getElementById("localFileCard");
  const localFileName = document.getElementById("localFileName");
  const localFileHint = document.getElementById("localFileHint");
  const localFileOpenDetails = document.getElementById("localFileOpenDetails");
  const templateRow = document.getElementById("templateRow");
  const templateSelect = document.getElementById("templateSelect");
  const editorPreviewLink = document.getElementById("editorPreviewLink");

  const resultCard = document.getElementById("resultCard");
  const resultUrlInput = document.getElementById("resultUrl");
  const resultTimeSpan = document.getElementById("resultTime");
  const copyUrlBtn = document.getElementById("copyUrlBtn");
  const openUrlBtn = document.getElementById("openUrlBtn");
  const expiryNotice = document.getElementById("expiryNotice");
  const keepLongTermBtn = document.getElementById("keepLongTermBtn");
  const reviewLink = document.getElementById("reviewLink");

  const historyList = document.getElementById("historyList");
  const serverInput = document.getElementById("serverInput");
  const tokenInput = document.getElementById("tokenInput");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const autoInjectToggle = document.getElementById("autoInjectToggle");
  const serverBadge = document.getElementById("serverBadge");
  const popupToast = document.getElementById("popupToast");
  const autoInjectOffBanner = document.getElementById("autoInjectOffBanner");
  const reEnableBtn = document.getElementById("reEnableBtn");
  const pinHint = document.getElementById("pinHint");
  const pinHintDismiss = document.getElementById("pinHintDismiss");
  const loginBtn = document.getElementById("loginBtn");
  const accountStatus = document.getElementById("accountStatus");

  let currentFormat = "html";

  const settings = await chrome.storage.local.get([
    "apiServer",
    "apiToken",
    "autoInject",
    "pinHintDismissed"
  ]);
  const apiServer = settings.apiServer || DEFAULT_API_SERVER;
  serverInput.value = apiServer;
  tokenInput.value = settings.apiToken || "";
  autoInjectToggle.checked = settings.autoInject !== false;
  if (editorPreviewLink) {
    editorPreviewLink.href = `${apiServer.replace(/\/$/, "")}/editor`;
  }
  loginBtn.href = `${apiServer.replace(/\/$/, "")}/settings`;
  reviewLink.href = REVIEW_URL;
  reviewLink.addEventListener("click", () => {
    chrome.storage.local.set({ reviewPromptDismissed: true });
  });

  if (apiServer.replace(/\/$/, "") !== DEFAULT_API_SERVER) {
    serverBadge.textContent = apiServer;
    serverBadge.classList.remove("hidden");
  }

  function isSignedIn() {
    return Boolean(tokenInput.value.trim());
  }

  function updateAccountStatus() {
    accountStatus.textContent = isSignedIn() ? t("accountBound") : t("accountGuest");
  }
  updateAccountStatus();

  function updateAutoInjectBanner() {
    if (autoInjectToggle.checked) {
      autoInjectOffBanner.classList.add("hidden");
    } else {
      autoInjectOffBanner.classList.remove("hidden");
    }
  }
  updateAutoInjectBanner();

  if (!settings.pinHintDismissed) {
    pinHint.classList.remove("hidden");
  }
  pinHintDismiss.addEventListener("click", async () => {
    pinHint.classList.add("hidden");
    await chrome.storage.local.set({ pinHintDismissed: true });
  });

  autoInjectToggle.addEventListener("change", async () => {
    await chrome.storage.local.set({ autoInject: autoInjectToggle.checked });
    updateAutoInjectBanner();
    showToast(t("settingsSaved"));
  });

  reEnableBtn.addEventListener("click", async () => {
    autoInjectToggle.checked = true;
    await chrome.storage.local.set({ autoInject: true });
    updateAutoInjectBanner();
    showToast(t("settingsSaved"));
  });

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (targetPanel) targetPanel.classList.add("active");

      if (btn.dataset.tab === "history") {
        renderHistory();
      }
    });
  });

  formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      formatBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentFormat = btn.dataset.format;
      if (currentFormat === "md") {
        templateRow.classList.remove("hidden");
        codeInput.placeholder = t("mdPlaceholder");
        filenameInput.value = "document.md";
        publishBtnText.textContent = t("publishMdBtn");
      } else {
        templateRow.classList.add("hidden");
        codeInput.placeholder = t("htmlPlaceholder");
        filenameInput.value = "index.html";
        publishBtnText.textContent = t("publishHtmlBtn");
      }
    });
  });

  tryDemoBtn.addEventListener("click", async () => {
    const demoRes = await fetch(chrome.runtime.getURL("demo.html"));
    codeInput.value = await demoRes.text();
    currentFormat = "html";
    formatBtns.forEach((b) => b.classList.toggle("active", b.dataset.format === "html"));
    templateRow.classList.add("hidden");
    filenameInput.value = "index.html";
    publishBtnText.textContent = t("publishHtmlBtn");
    codeInput.focus();
  });

  await setupLocalFileCard();

  publishBtn.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    if (!code) {
      showToast(t("emptyInput"));
      return;
    }

    const filename = filenameInput.value.trim() || (currentFormat === "md" ? "document.md" : "index.html");
    const selectedTemplate = currentFormat === "md" ? (templateSelect.value || "plain") : undefined;

    publishBtn.disabled = true;
    publishBtnText.textContent = t("publishing");

    try {
      const response = await chrome.runtime.sendMessage({
        type: "UPLOAD_CONTENT",
        code,
        filename,
        format: currentFormat,
        templateId: selectedTemplate
      });

      if (response && response.success && response.url) {
        await showPublishResult(response, filename, selectedTemplate);
        showToast(t("publishSuccess"));
      } else {
        throw new Error(response?.error || t("publishFailed"));
      }
    } catch (err) {
      showToast(err.message);
    } finally {
      publishBtn.disabled = false;
      publishBtnText.textContent = currentFormat === "md" ? t("publishMdBtn") : t("publishHtmlBtn");
    }
  });

  copyUrlBtn.addEventListener("click", async () => {
    if (resultUrlInput.value) {
      await copyToClipboard(resultUrlInput.value);
      showToast(t("linkCopied"));
    }
  });

  saveSettingsBtn.addEventListener("click", async () => {
    let server = serverInput.value.trim().replace(/\/$/, "");
    if (!server) server = DEFAULT_API_SERVER;

    await chrome.storage.local.set({
      apiServer: server,
      apiToken: tokenInput.value.trim()
    });

    if (server !== DEFAULT_API_SERVER) {
      serverBadge.textContent = server;
      serverBadge.classList.remove("hidden");
    } else {
      serverBadge.classList.add("hidden");
    }
    loginBtn.href = `${server}/settings`;
    if (editorPreviewLink) {
      editorPreviewLink.href = `${server}/editor`;
    }
    updateAccountStatus();
    showToast(t("settingsSaved"));
  });

  async function showPublishResult(response, filename, selectedTemplate) {
    resultUrlInput.value = response.url;
    openUrlBtn.href = response.url;
    resultTimeSpan.textContent = new Date().toLocaleTimeString();
    resultCard.classList.remove("hidden");

    const guest = !isSignedIn() || response.temporary;
    expiryNotice.textContent = guest
      ? formatExpiryNotice(response.expiresAt)
      : t("loggedInNotice");

    if (guest) {
      keepLongTermBtn.href = response.manageUrl || `${(serverInput.value || DEFAULT_API_SERVER).replace(/\/$/, "")}/settings`;
      keepLongTermBtn.classList.remove("hidden");
    } else {
      keepLongTermBtn.classList.add("hidden");
    }

    await copyToClipboard(response.url);

    const stored = await chrome.storage.local.get(["publishCount", "reviewPromptDismissed"]);
    const publishCount = (stored.publishCount || 0) + 1;
    await chrome.storage.local.set({ publishCount });
    if (publishCount >= 2 && !stored.reviewPromptDismissed) {
      reviewLink.classList.remove("hidden");
    }

    await saveToHistory({
      url: response.url,
      filename,
      format: currentFormat,
      templateId: selectedTemplate,
      timestamp: Date.now(),
      expiresAt: response.expiresAt || null,
      manageUrl: response.manageUrl || "",
      temporary: guest
    });
  }

  function formatExpiryNotice(expiresAt) {
    if (!expiresAt) return t("expiryNotice");
    const ms = new Date(expiresAt).getTime() - Date.now();
    if (Number.isNaN(ms) || ms <= 0) return t("linkExpired");
    const hours = Math.max(1, Math.round(ms / 3600000));
    return t("expiryInHours", [String(hours)]);
  }

  async function saveToHistory(item) {
    const data = await chrome.storage.local.get(["uploadHistory"]);
    const list = data.uploadHistory || [];
    list.unshift(item);
    if (list.length > 30) list.pop();
    await chrome.storage.local.set({ uploadHistory: list });
  }

  async function renderHistory() {
    const data = await chrome.storage.local.get(["uploadHistory"]);
    const list = data.uploadHistory || [];

    if (list.length === 0) {
      historyList.innerHTML = `<div class="empty-state">${t("emptyHistory")}</div>`;
      return;
    }

    historyList.innerHTML = list
      .map((item) => {
        const expiry = item.temporary === false ? t("historyKept") : formatExpiryNotice(item.expiresAt);
        const expired = expiry === t("linkExpired");
        return `
      <div class="history-item${expired ? " expired" : ""}">
        <div class="history-info">
          <div class="history-title">${escapeHtml(item.filename)} <span class="history-type-badge">${escapeHtml((item.format || "html").toUpperCase())}</span></div>
          <div class="history-url">${escapeHtml(item.url)}</div>
          <div class="history-expiry">${escapeHtml(expiry)}</div>
        </div>
        <div class="history-actions">
          <button class="history-btn copy-btn" data-url="${escapeHtml(item.url)}">${t("copy")}</button>
          <a class="history-btn" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${t("open")}</a>
        </div>
      </div>`;
      })
      .join("");

    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await copyToClipboard(btn.dataset.url);
        showToast(t("historyCopied"));
      });
    });
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  function showToast(msg) {
    popupToast.textContent = msg;
    popupToast.classList.remove("hidden");
    popupToast.classList.toggle("toast-error", /失败|failed|error|网络|timeout|quota/i.test(msg));
    setTimeout(() => {
      popupToast.classList.add("hidden");
    }, 3000);
  }

  function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function filenameFromUrl(url) {
    try {
      const path = decodeURIComponent(new URL(url).pathname || "");
      return path.split(/[/\\]/).filter(Boolean).pop() || "index.html";
    } catch {
      return "index.html";
    }
  }

  function isLocalTabUrl(url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "file:") return true;
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
      return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname);
    } catch {
      return false;
    }
  }

  function capturePageHtml() {
    const path = decodeURIComponent(location.pathname || "");
    const name = path.split(/[/\\]/).filter(Boolean).pop() || "index.html";
    const isHtml =
      document.contentType === "text/html" ||
      document.contentType === "application/xhtml+xml" ||
      /\.html?$/i.test(name) ||
      Boolean(document.doctype);
    if (!isHtml) return null;
    const dt = document.doctype;
    const doctype = dt ? `<!DOCTYPE ${dt.name}>\n` : "<!DOCTYPE html>\n";
    return {
      html: doctype + document.documentElement.outerHTML,
      filename: /\.html?$/i.test(name) ? name : `${name}.html`
    };
  }

  async function captureTabHtml(tabId) {
    try {
      const page = await chrome.tabs.sendMessage(tabId, { type: "GET_PAGE_HTML" });
      if (page?.html) return page;
    } catch {
      // content script not injected (file URL access off, or localhost)
    }

    const [injected] = await chrome.scripting.executeScript({
      target: { tabId },
      func: capturePageHtml
    });
    if (!injected?.result?.html) {
      throw new Error(t("localFileCaptureFailed"));
    }
    return injected.result;
  }

  async function setupLocalFileCard() {
    if (!localFileCard) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !isLocalTabUrl(tab.url)) return;

    localFileCard.classList.remove("hidden");
    localFileName.textContent = filenameFromUrl(tab.url);

    if (tab.url.startsWith("file:")) {
      let allowed = true;
      try {
        allowed = await new Promise((resolve) => {
          chrome.extension.isAllowedFileSchemeAccess(resolve);
        });
      } catch {
        allowed = true;
      }
      if (!allowed) {
        localFileHint.classList.remove("hidden");
        localFileOpenDetails.classList.remove("hidden");
      }
    }

    localFileOpenDetails.addEventListener("click", () => {
      chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
    });

    publishLocalBtn.addEventListener("click", async () => {
      publishLocalBtn.disabled = true;
      publishLocalBtnText.textContent = t("publishing");
      try {
        const page = await captureTabHtml(tab.id);
        filenameInput.value = page.filename;
        currentFormat = "html";
        formatBtns.forEach((b) => b.classList.toggle("active", b.dataset.format === "html"));
        templateRow.classList.add("hidden");

        const response = await chrome.runtime.sendMessage({
          type: "UPLOAD_CONTENT",
          code: page.html,
          filename: page.filename,
          format: "html"
        });
        if (!response?.success || !response.url) {
          throw new Error(response?.error || t("publishFailed"));
        }
        await showPublishResult(response, page.filename);
        showToast(t("publishSuccess"));
      } catch (err) {
        if (tab.url.startsWith("file:")) {
          localFileHint.classList.remove("hidden");
          localFileOpenDetails.classList.remove("hidden");
        }
        showToast(err.message || t("localFileCaptureFailed"));
      } finally {
        publishLocalBtn.disabled = false;
        publishLocalBtnText.textContent = t("localFileBtn");
      }
    });
  }
});
