// Popup Logic for HTML & Markdown To Link Chrome Extension

document.addEventListener("DOMContentLoaded", async () => {
  const DEFAULT_API_SERVER = "https://htmlto.link";
  const t = (key) => chrome.i18n.getMessage(key) || key;

  // Apply i18n to all data-i18n / data-i18n-placeholder / data-i18n-title nodes
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

  // Navigation
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const formatBtns = document.querySelectorAll(".format-btn");

  // Elements
  const codeInput = document.getElementById("codeInput");
  const filenameInput = document.getElementById("filenameInput");
  const publishBtn = document.getElementById("publishBtn");
  const publishBtnText = document.getElementById("publishBtnText");
  const templateRow = document.getElementById("templateRow");
  const templateSelect = document.getElementById("templateSelect");
  const editorPreviewLink = document.getElementById("editorPreviewLink");

  const resultCard = document.getElementById("resultCard");
  const resultUrlInput = document.getElementById("resultUrl");
  const resultTimeSpan = document.getElementById("resultTime");
  const copyUrlBtn = document.getElementById("copyUrlBtn");
  const openUrlBtn = document.getElementById("openUrlBtn");

  const historyList = document.getElementById("historyList");
  const serverInput = document.getElementById("serverInput");
  const tokenInput = document.getElementById("tokenInput");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const serverBadge = document.getElementById("serverBadge");
  const popupToast = document.getElementById("popupToast");

  let currentFormat = "html"; // "html" or "md"

  // Load Settings
  const settings = await chrome.storage.local.get(["apiServer", "apiToken"]);
  const apiServer = settings.apiServer || DEFAULT_API_SERVER;
  serverInput.value = apiServer;
  tokenInput.value = settings.apiToken || "";
  serverBadge.textContent = apiServer;
  if (editorPreviewLink) {
    editorPreviewLink.href = `${apiServer.replace(/\/$/, "")}/editor`;
  }

  // Tab switching
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

  // Format Switcher (HTML vs Markdown)
  formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      formatBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentFormat = btn.dataset.format;
      if (currentFormat === "md") {
        templateRow.classList.remove("hidden");
        codeInput.placeholder = chrome.i18n.getMessage("mdPlaceholder");
        filenameInput.value = "document.md";
        publishBtnText.textContent = chrome.i18n.getMessage("publishMdBtn");
      } else {
        templateRow.classList.add("hidden");
        codeInput.placeholder = chrome.i18n.getMessage("htmlPlaceholder");
        filenameInput.value = "index.html";
        publishBtnText.textContent = chrome.i18n.getMessage("publishHtmlBtn");
      }
    });
  });

  // Publish Button
  publishBtn.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    if (!code) {
      showToast(chrome.i18n.getMessage("emptyInput"));
      return;
    }

    const filename = filenameInput.value.trim() || (currentFormat === "md" ? "document.md" : "index.html");
    const selectedTemplate = currentFormat === "md" ? (templateSelect.value || "plain") : undefined;

    publishBtn.disabled = true;
    publishBtnText.textContent = chrome.i18n.getMessage("publishing");

    try {
      const response = await chrome.runtime.sendMessage({
        type: "UPLOAD_CONTENT",
        code,
        filename,
        format: currentFormat,
        templateId: selectedTemplate
      });

      if (response && response.success && response.url) {
        resultUrlInput.value = response.url;
        openUrlBtn.href = response.url;
        resultTimeSpan.textContent = new Date().toLocaleTimeString();
        resultCard.classList.remove("hidden");

        await copyToClipboard(response.url);

        await saveToHistory({
          url: response.url,
          filename,
          format: currentFormat,
          templateId: selectedTemplate,
          timestamp: Date.now()
        });

        showToast(chrome.i18n.getMessage("publishSuccess"));
      } else {
        throw new Error(response?.error || chrome.i18n.getMessage("publishFailed"));
      }
    } catch (err) {
      showToast(`❌ ${err.message}`);
    } finally {
      publishBtn.disabled = false;
      publishBtnText.textContent = currentFormat === "md" ? chrome.i18n.getMessage("publishMdBtn") : chrome.i18n.getMessage("publishHtmlBtn");
    }
  });

  // Copy Result URL
  copyUrlBtn.addEventListener("click", async () => {
    if (resultUrlInput.value) {
      await copyToClipboard(resultUrlInput.value);
      showToast(chrome.i18n.getMessage("linkCopied"));
    }
  });

  // Save Settings
  saveSettingsBtn.addEventListener("click", async () => {
    let server = serverInput.value.trim().replace(/\/$/, "");
    if (!server) server = DEFAULT_API_SERVER;

    await chrome.storage.local.set({
      apiServer: server,
      apiToken: tokenInput.value.trim()
    });

    serverBadge.textContent = server;
    if (editorPreviewLink) {
      editorPreviewLink.href = `${server}/editor`;
    }
    showToast(chrome.i18n.getMessage("settingsSaved"));
  });

  // Local History Management
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
      historyList.innerHTML = `<div class="empty-state">${chrome.i18n.getMessage("emptyHistory")}</div>`;
      return;
    }

    historyList.innerHTML = list
      .map(
        (item) => `
      <div class="history-item">
        <div class="history-info">
          <div class="history-title">${escapeHtml(item.filename)} <span class="history-type-badge">${(item.format || "html").toUpperCase()}</span></div>
          <div class="history-url">${escapeHtml(item.url)}</div>
        </div>
        <div class="history-actions">
          <button class="history-btn copy-btn" data-url="${escapeHtml(item.url)}">${chrome.i18n.getMessage("copy")}</button>
        </div>
      </div>
    `
      )
      .join("");

    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const url = btn.dataset.url;
        await copyToClipboard(url);
        showToast(chrome.i18n.getMessage("historyCopied"));
      });
    });
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
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
    setTimeout(() => {
      popupToast.classList.add("hidden");
    }, 3000);
  }

  function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
});
