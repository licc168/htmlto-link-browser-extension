// Shared content-script core. Platform DOM knowledge lives in platforms/*.js.

(function () {
  if (globalThis.__htmlToLinkCoreLoaded) return;
  globalThis.__htmlToLinkCoreLoaded = true;

  const engine = globalThis.htmltoLinkPlatformEngine;
  if (!engine) {
    console.warn("[htmlto.link] No platform engine registered for this page.");
    return;
  }

  console.log(`[htmlto.link] ${engine.id} platform engine active.`);

  const t = (key, substitutions) =>
    (typeof htmltoLinkT === "function" ? htmltoLinkT(key, substitutions) : chrome.i18n.getMessage(key, substitutions)) || key;

  const CONTAINER_CLASS = "htmlto-link-btn-container";
  const BUTTON_CLASS = "htmlto-link-inject-btn";
  const UI_SELECTOR = '[data-htmlto-link-ui="true"]';

  let scanTimer = null;
  let autoInjectEnabled = true;

  const observer = new MutationObserver(() => {
    if (!autoInjectEnabled || scanTimer) return;
    scanTimer = setTimeout(() => {
      scanTimer = null;
      scanAndInjectButtons();
    }, 300);
  });

  chrome.storage.local.get({ autoInject: true }).then((cfg) => {
    autoInjectEnabled = cfg.autoInject !== false;
    if (autoInjectEnabled) startObserver();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.autoInject) return;

    autoInjectEnabled = changes.autoInject.newValue !== false;
    if (autoInjectEnabled) {
      startObserver();
    } else {
      observer.disconnect();
      removeInjectedUi();
    }
  });

  function startObserver() {
    observer.disconnect();
    const root = document.documentElement;
    if (!root) {
      setTimeout(startObserver, 50);
      return;
    }

    // documentElement survives SPA body replacement. characterData catches
    // platforms that stream into existing syntax-highlighted text nodes.
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    scanAndInjectButtons();
  }

  function scanAndInjectButtons() {
    if (!autoInjectEnabled) return;

    const blocks = engine.findCodeBlocks(document) || [];
    Array.from(blocks).forEach((block) => {
      if (!(block instanceof Element) || !block.isConnected) return;

      const codeEl = engine.getCodeElement(block);
      const mountTarget = engine.getMountTarget(block);
      if (!(codeEl instanceof Element) || !(mountTarget instanceof Element) || !mountTarget.isConnected) return;

      // Never trust a permanent "processed" marker: frameworks may rewrite the
      // injected node while leaving its attributes behind. A real button is truth.
      if (findLiveUi(mountTarget)) return;

      const codeText = readCodeText(codeEl);
      const format = detectCodeFormat(codeText, getLanguageHint(block, codeEl));
      if (!format) return;

      injectButton({ block, codeEl, mountTarget, format });
    });
  }

  function findLiveUi(mountTarget) {
    return Array.from(mountTarget.querySelectorAll(UI_SELECTOR)).find((node) =>
      node.querySelector(`.${BUTTON_CLASS}`)
    );
  }

  function injectButton({ block, mountTarget, format }) {
    const isMd = format === "md";
    const iconSvg = isMd
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 14h10"/><path d="M16 4h2a2 2 0 0 1 2 2v1.344"/><path d="m17 18 4-4-4-4"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`;

    const labelText = isMd ? t("genMdLink") : t("genHtmlLink");
    const filename = isMd ? "ai-generated-document.md" : "ai-generated-page.html";
    const container = document.createElement("div");
    container.className = CONTAINER_CLASS;
    container.dataset.htmltoLinkUi = "true";
    container.dataset.htmltoLinkPlatform = engine.id;

    const btn = document.createElement("button");
    btn.className = `${BUTTON_CLASS} ${isMd ? "htmlto-link-btn-md" : ""}`;
    btn.type = "button";
    btn.innerHTML = `${iconSvg}<span>${labelText}</span>`;

    let tplSelect = null;
    if (isMd) {
      tplSelect = document.createElement("select");
      tplSelect.className = "htmlto-link-tpl-select";
      tplSelect.title = t("tplSelectTitle");
      tplSelect.innerHTML = `
        <option value="plain" selected>${t("tplPlain")}</option>
        <option value="memo">${t("tplMemo")}</option>
        <option value="bytedance">${t("tplBytedance")}</option>
        <option value="darktech">${t("tplDarktech")}</option>
        <option value="coilnotebook">${t("tplCoilnotebook")}</option>
        <option value="traditionalchinese">${t("tplTraditionalchinese")}</option>
        <option value="popart">${t("tplPopart")}</option>
        <option value="warm">${t("tplWarm")}</option>
        <option value="alibaba">${t("tplAlibaba")}</option>
      `;
      tplSelect.addEventListener("click", (event) => event.stopPropagation());
    }

    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const selectedTemplate = tplSelect ? tplSelect.value : (isMd ? "plain" : undefined);
      const originalText = btn.innerHTML;
      const freshCodeEl = engine.getCodeElement(block);
      const freshCode = freshCodeEl instanceof Element ? readCodeText(freshCodeEl) : "";
      const fmtName = isMd ? t("fmtMdName") : t("fmtHtmlName");
      btn.disabled = true;
      btn.innerHTML = `
        <svg class="htmlto-link-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span>${t("publishing")}</span>
      `;

      try {
        const response = await chrome.runtime.sendMessage({
          type: "UPLOAD_CONTENT",
          code: freshCode,
          filename,
          format,
          templateId: selectedTemplate
        });
        if (!response?.success || !response.url) throw new Error(response?.error || t("publishFailed"));

        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <span>${t("copiedLink", [fmtName])}</span>
        `;
        btn.classList.add("htmlto-link-success");
        await copyToClipboard(response.url);
        await savePublishHistory({
          url: response.url,
          filename,
          format,
          templateId: selectedTemplate,
          timestamp: Date.now(),
          expiresAt: response.expiresAt || null,
          manageUrl: response.manageUrl || "",
          temporary: response.temporary !== false
        });
        showToast(t("publishSuccessToast", [fmtName]), response.url);
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
          btn.classList.remove("htmlto-link-success");
        }, 3500);
      } catch (err) {
        btn.innerHTML = t("publishFailed");
        showToast(err.message || t("publishFailed"));
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }, 3000);
      }
    });

    if (tplSelect) container.appendChild(tplSelect);
    container.appendChild(btn);

    const closeBtn = document.createElement("button");
    closeBtn.className = "htmlto-link-inject-close";
    closeBtn.type = "button";
    closeBtn.title = t("dismissInjectTitle");
    closeBtn.setAttribute("aria-label", closeBtn.title);
    closeBtn.innerHTML = "×";
    closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      autoInjectEnabled = false;
      observer.disconnect();
      chrome.storage.local.set({ autoInject: false });
      removeInjectedUi();
      showToast(t("dismissInjectToast"), null, t("dismissInjectUndo"), () => {
        autoInjectEnabled = true;
        chrome.storage.local.set({ autoInject: true });
        startObserver();
      });
    });
    container.appendChild(closeBtn);

    if (getComputedStyle(mountTarget).position === "static") {
      mountTarget.style.position = "relative";
    }
    if (typeof engine.prepareMount === "function") engine.prepareMount(mountTarget, block, container);
    mountTarget.appendChild(container);
  }

  function removeInjectedUi() {
    document.querySelectorAll(UI_SELECTOR).forEach((node) => node.remove());
  }

  function readCodeText(codeEl) {
    if (typeof engine.getCodeText === "function") return engine.getCodeText(codeEl);
    const clone = codeEl.cloneNode(true);
    clone.querySelectorAll(UI_SELECTOR).forEach((node) => node.remove());
    return clone.textContent || "";
  }

  function getLanguageHint(block, codeEl) {
    const platformHint = typeof engine.getLanguageHint === "function" ? engine.getLanguageHint(block, codeEl) : "";
    if (platformHint) return normalizeLanguageHint(platformHint);

    for (const el of [codeEl, block]) {
      const cls = String(el.className || "");
      const langAttr = el.getAttribute("data-language") || el.getAttribute("data-lang") || "";
      const classMatch = cls.match(/(?:language|lang)-([a-z0-9+#]+)/i);
      if (classMatch) return normalizeLanguageHint(classMatch[1]);
      if (langAttr) return normalizeLanguageHint(langAttr);
    }
    return block.previousElementSibling ? normalizeLanguageHint(block.previousElementSibling.textContent) : "";
  }

  function normalizeLanguageHint(value) {
    return String(value || "").trim().toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9+#]/g, "");
  }

  function detectCodeFormat(code, lang) {
    if (["html", "htm", "xhtml", "svg"].includes(lang)) return "html";
    if (["markdown", "md"].includes(lang)) return "md";
    if (lang && !["xml", "vue", "svelte"].includes(lang)) return null;

    const trimmed = String(code || "").trim();
    if (trimmed.length < 80) return null;
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("<!doctype html") || lower.startsWith("<html")) return "html";
    if (lower.includes("<body") && lower.includes("</body>")) return "html";
    if (lower.includes("</html>") || (lower.includes("</style>") && lower.includes("</script>"))) return "html";
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) return "md";
    if (trimmed.includes("\n# ") || trimmed.includes("\n## ") || trimmed.includes("\n### ")) return "md";
    if (trimmed.includes("| --- |") || trimmed.includes("|--- |") || trimmed.includes("| ---|")) return "md";
    if (trimmed.startsWith("```markdown") || trimmed.startsWith("```md")) return "md";
    return null;
  }

  async function savePublishHistory(item) {
    const data = await chrome.storage.local.get(["uploadHistory", "publishCount"]);
    const list = data.uploadHistory || [];
    list.unshift(item);
    if (list.length > 30) list.pop();
    await chrome.storage.local.set({ uploadHistory: list, publishCount: (data.publishCount || 0) + 1 });
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
        ta.remove();
      }
    }
  }

  function showToast(message, linkUrl, actionLabel, onAction) {
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
        ${actionLabel ? `<button class="htmlto-link-toast-action" type="button">${escapeHtml(actionLabel)}</button>` : ""}
      </div>
    `;
    if (actionLabel && onAction) {
      toast.querySelector(".htmlto-link-toast-action")?.addEventListener("click", () => {
        toast.classList.remove("show");
        onAction();
      });
    }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4500);
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
