// Content Script for Dual HTML & Markdown Support on AI Platforms (ChatGPT, Claude, DeepSeek, v0, Kimi, etc.)

(function () {
  console.log("HTML & Markdown To Link extension content script active.");

  const CONTAINER_CLASS = "htmlto-link-btn-container";
  const BUTTON_CLASS = "htmlto-link-inject-btn";
  const PROCESSED_ATTR = "data-htmlto-link-processed";

  let scanTimer = null;
  const observer = new MutationObserver(() => {
    if (scanTimer) return;
    scanTimer = setTimeout(() => {
      scanTimer = null;
      scanAndInjectButtons();
    }, 300);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  scanAndInjectButtons();

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SHOW_TOAST") {
      showToast(msg.message, msg.url);
    }
  });

  function scanAndInjectButtons() {
    const codeBlocks = document.querySelectorAll("pre code, pre");
    codeBlocks.forEach((block) => {
      if (block.getAttribute(PROCESSED_ATTR)) return;

      const codeText = block.innerText || block.textContent || "";
      const format = detectCodeFormat(codeText);
      if (!format) return;

      block.setAttribute(PROCESSED_ATTR, "true");

      const parentPre = block.tagName.toLowerCase() === "pre" ? block : block.closest("pre");
      if (!parentPre) return;

      const isMd = format === "md";
      const iconSvg = isMd
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 14h10"/><path d="M16 4h2a2 2 0 0 1 2 2v1.344"/><path d="m17 18 4-4-4-4"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`;

      const labelText = isMd ? chrome.i18n.getMessage("genMdLink") : chrome.i18n.getMessage("genHtmlLink");
      const filename = isMd ? "ai-generated-document.md" : "ai-generated-page.html";

      // Container for button + template select
      const container = document.createElement("div");
      container.className = CONTAINER_CLASS;

      const btn = document.createElement("button");
      btn.className = `${BUTTON_CLASS} ${isMd ? "htmlto-link-btn-md" : ""}`;
      btn.type = "button";
      btn.innerHTML = `${iconSvg}<span>${labelText}</span>`;

      let tplSelect = null;
      if (isMd) {
        tplSelect = document.createElement("select");
        tplSelect.className = "htmlto-link-tpl-select";
        tplSelect.title = chrome.i18n.getMessage("tplSelectTitle");
        tplSelect.innerHTML = `
          <option value="plain" selected>${chrome.i18n.getMessage("tplPlain")}</option>
          <option value="memo">${chrome.i18n.getMessage("tplMemo")}</option>
          <option value="bytedance">${chrome.i18n.getMessage("tplBytedance")}</option>
          <option value="darktech">${chrome.i18n.getMessage("tplDarktech")}</option>
          <option value="coilnotebook">${chrome.i18n.getMessage("tplCoilnotebook")}</option>
          <option value="traditionalchinese">${chrome.i18n.getMessage("tplTraditionalchinese")}</option>
          <option value="popart">${chrome.i18n.getMessage("tplPopart")}</option>
          <option value="warm">${chrome.i18n.getMessage("tplWarm")}</option>
          <option value="alibaba">${chrome.i18n.getMessage("tplAlibaba")}</option>
        `;
        // Prevent click events on select from triggering parent events
        tplSelect.addEventListener("click", (e) => e.stopPropagation());
      }

      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedTemplate = tplSelect ? tplSelect.value : (isMd ? "plain" : undefined);
        const originalText = btn.innerHTML;
        const freshCode = block.innerText || block.textContent || "";
        const fmtName = isMd ? chrome.i18n.getMessage("fmtMdName") : chrome.i18n.getMessage("fmtHtmlName");
        btn.disabled = true;
        btn.innerHTML = `
          <svg class="htmlto-link-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span>${chrome.i18n.getMessage("publishing")}</span>
        `;

        try {
          const response = await chrome.runtime.sendMessage({
            type: "UPLOAD_CONTENT",
            code: freshCode,
            filename,
            format,
            templateId: selectedTemplate
          });

          if (response && response.success && response.url) {
            btn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              <span>${chrome.i18n.getMessage("copiedLink", [fmtName])}</span>
            `;
            btn.classList.add("htmlto-link-success");

            await copyToClipboard(response.url);

            showToast(chrome.i18n.getMessage("publishSuccessToast", [fmtName]), response.url);

            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.disabled = false;
              btn.classList.remove("htmlto-link-success");
            }, 3500);
          } else {
            throw new Error(response?.error || chrome.i18n.getMessage("publishFailed"));
          }
        } catch (err) {
          btn.innerHTML = `❌ ${chrome.i18n.getMessage("publishFailed")}`;
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }, 3000);
        }
      });

      container.appendChild(btn);
      if (tplSelect) {
        container.appendChild(tplSelect);
      }

      if (getComputedStyle(parentPre).position === "static") {
        parentPre.style.position = "relative";
      }
      parentPre.appendChild(container);
    });
  }

  // Detect format (HTML or Markdown)
  function detectCodeFormat(code) {
    const trimmed = code.trim();
    const lower = trimmed.toLowerCase();

    // HTML detection
    if (lower.startsWith("<!doctype html") || lower.startsWith("<html")) return "html";
    if (lower.includes("<body") && lower.includes("</body>")) return "html";
    if (lower.includes("<div") && (lower.includes("class=") || lower.includes("id="))) return "html";
    if (lower.includes("</html>") || lower.includes("</script>") || lower.includes("</style>")) return "html";

    // Markdown detection
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) return "md";
    if (trimmed.includes("\n# ") || trimmed.includes("\n## ") || trimmed.includes("\n### ")) return "md";
    if (trimmed.includes("| --- |") || trimmed.includes("|--- |") || trimmed.includes("| ---|")) return "md";
    if (trimmed.startsWith("- ") && trimmed.includes("\n- ") && trimmed.includes("**")) return "md";
    if (trimmed.startsWith("```markdown") || trimmed.startsWith("```md")) return "md";

    return null;
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

  function showToast(message, linkUrl) {
    let toast = document.getElementById("htmlto-link-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "htmlto-link-toast";
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="htmlto-link-toast-content">
        <p>${escapeHtml(message)}</p>
        ${linkUrl ? `<a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkUrl)}</a>` : ""}
      </div>
    `;

    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 4500);
  }

  function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
