// Popup Script for HTML & Markdown To Link Extension

document.addEventListener("DOMContentLoaded", async () => {
  // UI Elements
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const formatBtns = document.querySelectorAll(".format-btn");

  const codeInput = document.getElementById("codeInput");
  const filenameInput = document.getElementById("filenameInput");
  const publishBtn = document.getElementById("publishBtn");
  const publishBtnText = document.getElementById("publishBtnText");

  const resultCard = document.getElementById("resultCard");
  const resultUrl = document.getElementById("resultUrl");
  const copyUrlBtn = document.getElementById("copyUrlBtn");
  const openUrlBtn = document.getElementById("openUrlBtn");
  const resultTime = document.getElementById("resultTime");

  const historyList = document.getElementById("historyList");
  const serverInput = document.getElementById("serverInput");
  const tokenInput = document.getElementById("tokenInput");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const serverBadge = document.getElementById("serverBadge");

  let currentFormat = "html";

  // Load Settings
  const settings = await chrome.storage.local.get(["apiServer", "apiToken"]);
  const currentServer = settings.apiServer || "https://htmlto.link";
  serverInput.value = currentServer;
  tokenInput.value = settings.apiToken || "";
  serverBadge.textContent = currentServer.replace(/^https?:\/\//, "");

  // Format Switch Handler (HTML vs Markdown)
  formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      formatBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentFormat = btn.getAttribute("data-format");
      if (currentFormat === "md") {
        codeInput.placeholder = "在此粘贴 Markdown 文本 (如 # 标题 \\n\\n 正文描述...)...";
        filenameInput.value = "document.md";
        filenameInput.placeholder = "文件名 (默认: document.md)";
        publishBtnText.textContent = "🚀 1秒发布 Markdown 生成 URL";
      } else {
        codeInput.placeholder = "在此粘贴 HTML 代码 (如 <h1>Hello World</h1>)...";
        filenameInput.value = "index.html";
        filenameInput.placeholder = "文件名 (默认: index.html)";
        publishBtnText.textContent = "🚀 1秒发布 HTML 生成 URL";
      }
    });
  });

  // Tab Switch Handler
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");

      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(`tab-${tabName}`).classList.add("active");

      if (tabName === "history") {
        loadHistory();
      }
    });
  });

  // Publish Button Click
  publishBtn.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    if (!code) {
      showToast(`请先输入或粘贴 ${currentFormat === "md" ? "Markdown" : "HTML"} 内容！`);
      return;
    }

    const defaultFilename = currentFormat === "md" ? "document.md" : "index.html";
    const filename = filenameInput.value.trim() || defaultFilename;
    const originalContent = publishBtn.innerHTML;

    publishBtn.disabled = true;
    publishBtn.innerHTML = `<span>⏳ 正在上传发布...</span>`;

    try {
      const response = await chrome.runtime.sendMessage({
        type: "UPLOAD_CONTENT",
        code,
        filename,
        format: currentFormat
      });

      if (response && response.success && response.url) {
        const url = response.url;
        resultUrl.value = url;
        openUrlBtn.href = url;
        resultTime.textContent = new Date().toLocaleTimeString();
        resultCard.classList.remove("hidden");

        await navigator.clipboard.writeText(url);
        showToast(`🎉 已成功发布 ${currentFormat === "md" ? "Markdown" : "HTML"} 并复制 URL 到剪贴板！`);
      } else {
        showToast(`❌ 发布失败: ${response?.error || "未知错误"}`);
      }
    } catch (err) {
      showToast(`❌ 发布出错: ${err.message}`);
    } finally {
      publishBtn.disabled = false;
      publishBtn.innerHTML = originalContent;
    }
  });

  // Copy Result URL
  copyUrlBtn.addEventListener("click", async () => {
    if (resultUrl.value) {
      await navigator.clipboard.writeText(resultUrl.value);
      showToast("已复制 URL 到剪贴板！");
    }
  });

  // Save Settings
  saveSettingsBtn.addEventListener("click", async () => {
    let server = serverInput.value.trim() || "https://htmlto.link";
    server = server.replace(/\/$/, "");
    const token = tokenInput.value.trim();

    await chrome.storage.local.set({ apiServer: server, apiToken: token });
    serverBadge.textContent = server.replace(/^https?:\/\//, "");
    showToast("设置保存成功！");
  });

  // Load History List
  async function loadHistory() {
    const data = await chrome.storage.local.get(["shareHistory"]);
    const list = data.shareHistory || [];

    if (list.length === 0) {
      historyList.innerHTML = `<div class="empty-state">暂无发布历史</div>`;
      return;
    }

    historyList.innerHTML = list
      .map(
        (item) => `
      <div class="history-item">
        <div class="history-info">
          <div class="history-title">
            ${escapeHtml(item.title || "文档")}
            <span class="history-type-badge">${item.type === "markdown" || item.title?.endsWith(".md") ? "MD" : "HTML"}</span>
          </div>
          <span class="history-url">${escapeHtml(item.url)}</span>
        </div>
        <div class="history-actions">
          <button type="button" class="history-btn copy-btn" data-url="${escapeHtml(item.url)}">复制</button>
          <a href="${escapeHtml(item.url)}" target="_blank" class="history-btn">打开</a>
        </div>
      </div>
    `
      )
      .join("");

    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const url = btn.getAttribute("data-url");
        if (url) {
          await navigator.clipboard.writeText(url);
          showToast("已复制链接！");
        }
      });
    });
  }

  function showToast(msg) {
    const toast = document.getElementById("popupToast");
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3000);
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
