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
    if (scanTimer) return;
    scanTimer = setTimeout(() => {
      scanTimer = null;
      scanAndInjectButtons();
    }, 300);
  });

  window.addEventListener("scroll", () => {
    document.querySelectorAll(".htmlto-link-check[data-anchor-id]").forEach((box) => {
      const wrapper = document.querySelector(`[data-htmlto-link-turn="${box.dataset.anchorId}"]`);
      if (wrapper instanceof Element && floatsCheckbox(wrapper)) placeCheckbox(box, wrapper);
    });
  }, true);

  chrome.storage.local.get({ autoInject: true }).then((cfg) => {
    autoInjectEnabled = cfg.autoInject !== false;
    startObserver();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.autoInject) return;
    autoInjectEnabled = changes.autoInject.newValue !== false;
    if (!autoInjectEnabled) removeCodeButtons();
    else scanAndInjectButtons();
    updateCodeToggleLabel();
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

  function removeCodeButtons() {
    document.querySelectorAll(`.${CONTAINER_CLASS}`).forEach((node) => node.remove());
  }

  function normalizedCodeText(el) {
    return (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 240);
  }

  // Two pres belong to one card when one contains the other, or they show the
  // same source and their boxes overlap (ChatGPT nests a highlighter pre inside
  // the card pre; the wrappers between them are often deeper than a short walk).
  function sharesVisualCodeBlock(block, other) {
    if (!(other instanceof Element) || other === block) return false;
    if (block.contains(other) || other.contains(block)) return true;
    const a = normalizedCodeText(block);
    const b = normalizedCodeText(other);
    if (!a || !b) return false;
    const shorter = a.length <= b.length ? a : b;
    const longer = a.length <= b.length ? b : a;
    if (!longer.includes(shorter.slice(0, 160))) return false;
    const ra = block.getBoundingClientRect();
    const rb = other.getBoundingClientRect();
    const overlapX = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
    const verticalGap = Math.max(0, Math.max(ra.top, rb.top) - Math.min(ra.bottom, rb.bottom));
    return overlapX > 32 && verticalGap < 64;
  }

  function codeButtonAlreadyNearby(block) {
    if (block.parentElement?.closest("pre")) return true;
    let node = block.parentElement;
    for (let i = 0; i < 16 && node && node !== document.body && node !== document.documentElement; i += 1) {
      const others = node.querySelectorAll("pre");
      let separate = false;
      for (const pre of others) {
        if (pre === block || block.contains(pre) || pre.contains(block)) continue;
        if (!sharesVisualCodeBlock(block, pre)) {
          separate = true;
          break;
        }
      }
      if (separate) {
        for (const pre of others) {
          if (pre !== block && sharesVisualCodeBlock(block, pre) && pre.querySelector(`.${BUTTON_CLASS}`)) return true;
        }
        return false;
      }
      if (node.querySelector(`.${BUTTON_CLASS}`)) return true;
      node = node.parentElement;
    }
    return false;
  }

  function dedupeCodeButtons() {
    const containers = Array.from(document.querySelectorAll(`.${CONTAINER_CLASS}`));
    containers.forEach((container, index) => {
      const host = container.parentElement;
      if (!(host instanceof Element)) return;
      const nestedPre = host.tagName === "PRE" && Boolean(host.parentElement?.closest("pre"));
      const twin = containers.slice(0, index).some((other) => other.isConnected && sharesVisualCodeBlock(host, other.parentElement));
      if (nestedPre || twin) container.remove();
    });
  }

  function updateCodeToggleLabel() {
    const button = document.getElementById("htmlto-link-chat-export")?.shadowRoot?.querySelector("[data-role=code-buttons]");
    if (!button) return;
    button.textContent = autoInjectEnabled ? t("hideCodeButtons") : t("showCodeButtons");
  }

  function scanAndInjectButtons() {
    dedupeCodeButtons();
    if (autoInjectEnabled) {
      const blocks = engine.findCodeBlocks(document) || [];
      Array.from(blocks).forEach((block) => {
        if (!(block instanceof Element) || !block.isConnected) return;
        if (getComputedStyle(block).display === "none") return;

        const codeEl = engine.getCodeElement(block);
        const mountTarget = engine.getMountTarget(block);
        if (!(codeEl instanceof Element) || !(mountTarget instanceof Element) || !mountTarget.isConnected) return;

        // One visual code block often contains several pre elements. Keep a single button.
        if (findLiveUi(mountTarget) || codeButtonAlreadyNearby(block)) return;

        const codeText = readCodeText(codeEl);
        const format = detectCodeFormat(codeText, getLanguageHint(block, codeEl));
        if (!format) return;

        injectButton({ block, codeEl, mountTarget, format });
      });
    }
    syncChatExportButton();
    updateCodeToggleLabel();
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

    if (getComputedStyle(mountTarget).position === "static") {
      mountTarget.style.position = "relative";
    }
    if (typeof engine.prepareMount === "function") engine.prepareMount(mountTarget, block, container);
    mountTarget.appendChild(container);
  }

  function removeInjectedUi() {
    document.querySelectorAll(UI_SELECTOR).forEach((node) => node.remove());
    document.getElementById("htmlto-link-chat-export")?.remove();
  }

  function allConversationTurns() {
    if (typeof engine.extractConversation !== "function") return [];
    const turns = (engine.extractConversation(document) || []).filter((turn) => turn.wrapper instanceof Element && turn.wrapper !== document.body && turn.wrapper !== document.documentElement);
    const bodyLen = (document.body?.innerText || "").length || 1;
    if (turns.length === 1 && (turns[0].wrapper.innerText || "").length > bodyLen * 0.9) return [];
    return outermostTurns(turns);
  }

  function checkboxHost(wrapper) {
    const key = wrapper?.dataset?.htmltoLinkTurn;
    if (key) {
      const floating = document.querySelector(`.htmlto-link-check[data-anchor-id="${key}"]`);
      if (floating) return floating;
    }
    return wrapper?.querySelector(":scope > .htmlto-link-check");
  }

  function isTurnSelected(wrapper) {
    const input = checkboxHost(wrapper)?.shadowRoot?.querySelector("input");
    return !input || input.checked;
  }

  function collectConversationTurns() {
    return allConversationTurns().filter((turn) => isTurnSelected(turn.wrapper));
  }

  async function selectedConversationTurns() {
    const domTurns = collectConversationTurns();
    if (typeof engine.readNativeConversation !== "function") return domTurns;
    try {
      const native = await engine.readNativeConversation(domTurns);
      if (native?.length) return native.filter((turn) => isTurnSelected(turn.wrapper));
    } catch (err) {
      console.warn("[htmlto.link] native conversation unavailable", err);
    }
    return domTurns;
  }

  function outermostTurns(turns) {
    return turns.filter((turn) => !turns.some((other) => other !== turn && other.wrapper instanceof Element && turn.wrapper instanceof Element && other.wrapper.contains(turn.wrapper)));
  }

  function turnKey(wrapper) {
    if (!wrapper.dataset.htmltoLinkTurn) wrapper.dataset.htmltoLinkTurn = `t${Math.random().toString(36).slice(2, 9)}`;
    return wrapper.dataset.htmltoLinkTurn;
  }

  function isCustomElement(wrapper) {
    return (wrapper.tagName || "").includes("-");
  }

  function floatsCheckbox(wrapper) {
    return isCustomElement(wrapper) || engine.id === "yuanbao" || engine.id === "yiyan" || engine.id === "grok";
  }

  function belongsToMessage(node, wrapper) {
    if (!node || node === wrapper) return false;
    if (wrapper.contains(node)) return true;
    const root = node.getRootNode?.();
    return Boolean(root?.host && (root.host === wrapper || wrapper.contains(root.host)));
  }

  function messageLineRect(wrapper) {
    const box = wrapper.getBoundingClientRect();
    const y = Math.min(box.bottom - 12, box.top + 28);
    let probed = null;
    for (let x = box.left + 12; x < box.right - 16; x += 8) {
      const hit = document.elementFromPoint(x, y);
      if (!hit || hit.closest?.(".htmlto-link-check") || !belongsToMessage(hit, wrapper)) continue;
      const rect = hit.getBoundingClientRect();
      if (rect.width < 48 || rect.height < 10) continue;
      if (rect.left < box.left + 36) continue;
      probed = rect;
      break;
    }
    return probed || box;
  }

  function placeCheckbox(host, wrapper) {
    if (floatsCheckbox(wrapper)) {
      const rect = messageLineRect(wrapper);
      const left = Math.max(8, rect.left - 28);
      const top = rect.top + 2;
      host.style.cssText = `position:fixed !important;left:${left}px !important;top:${top}px !important;transform:none !important;z-index:40 !important;width:16px !important;height:16px !important;margin:0 !important;padding:0 !important;`;
    } else {
      host.style.cssText = "position:absolute !important;left:0 !important;top:12px !important;transform:translateX(-26px) !important;z-index:30 !important;width:16px !important;height:16px !important;margin:0 !important;padding:0 !important;";
    }
    if (document.getElementById("htmlto-link-preview")) host.style.setProperty("display", "none", "important");
  }

  function ensureCheckbox(wrapper) {
    if (!(wrapper instanceof Element)) return;
    const key = turnKey(wrapper);
    const custom = floatsCheckbox(wrapper);
    let host = document.querySelector(`.htmlto-link-check[data-anchor-id="${key}"]`);
    if (!host) {
      host = document.createElement("div");
      host.className = "htmlto-link-check";
      host.dataset.htmltoLinkUi = "true";
      host.dataset.anchorId = key;
      host.title = t("chatSelect");
      const shadow = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = "input{width:16px;height:16px;margin:0;accent-color:#3451c7;cursor:pointer}";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = true;
      input.title = t("chatSelect");
      input.addEventListener("click", (event) => event.stopPropagation());
      shadow.append(style, input);
      host.addEventListener("click", (event) => event.stopPropagation());
      if (custom) document.body.appendChild(host);
      else wrapper.appendChild(host);
    }
    if (!custom) {
      const positioned = getComputedStyle(wrapper).position;
      if (positioned === "static") wrapper.style.position = "relative";
      wrapper.style.overflow = "visible";
    }
    placeCheckbox(host, wrapper);
  }

  function syncMessageChecks() {
    const turns = allConversationTurns();
    const live = new Set();
    turns.forEach((turn) => {
      if (!(turn.wrapper instanceof Element) || !turn.wrapper.isConnected) return;
      live.add(turn.wrapper);
      ensureCheckbox(turn.wrapper);
    });
    document.querySelectorAll(".htmlto-link-check").forEach((box) => {
      const anchor = box.dataset.anchorId
        ? document.querySelector(`[data-htmlto-link-turn="${box.dataset.anchorId}"]`)
        : box.parentElement;
      if (!anchor?.isConnected || (box.dataset.anchorId ? !live.has(anchor) : !live.has(box.parentElement))) box.remove();
    });
    return turns;
  }

  function conversationMarkdown(turns) {
    const title = (document.title || "").replace(/\s*[-–—|].*$/, "").trim();
    const lines = [];
    if (title) lines.push(`# ${title}`, "");
    turns.forEach((turn) => {
      const who = turn.role === "user" ? t("chatRoleUser") : t("chatRoleAssistant");
      lines.push(`**${who}:**`, "", turn.markdown || turn.text, "");
    });
    return lines.join("\n").trim();
  }

  function conversationPreviewHtml(turns) {
    const title = (document.title || "").replace(/\s*[-–—|].*$/, "").trim();
    const parts = [];
    if (title) parts.push(`<h1 class="markdown-heading" id="preview-title">${escapeHtml(title)}</h1>`);
    const htmlForPreview = globalThis.htmltoLinkMarkdown?.htmlForPreview;
    let usedDom = false;
    turns.forEach((turn) => {
      const who = turn.role === "user" ? t("chatRoleUser") : t("chatRoleAssistant");
      parts.push(`<p><strong>${escapeHtml(who)}:</strong></p>`);
      if (turn.html) {
        parts.push(turn.html);
        usedDom = true;
        return;
      }
      if (typeof htmlForPreview === "function" && turn.wrapper instanceof Element) {
        const html = htmlForPreview(turn.wrapper);
        if (html) {
          parts.push(html);
          usedDom = true;
          return;
        }
      }
    });
    return usedDom ? parts.join("") : "";
  }

  const useZh = (chrome.i18n.getUILanguage() || "").toLowerCase().startsWith("zh");
  const labelOf = (item) => (useZh ? item.zh : item.en);
  // 与 html2url/lib/constants.ts 的 imageTextTemplates、templateThemes 一致。
  const CHAT_TEMPLATES = [
    { id: "memo", zh: "备忘录", en: "Memo", themes: [
      { value: "bright-mode", zh: "高亮", en: "Bright" },
      { value: "dark-mode", zh: "暗黑", en: "Dark" }
    ] },
    { id: "popart", zh: "波普艺术", en: "Pop Art", themes: [
      { value: "candy-mode", zh: "糖果色", en: "Candy" },
      { value: "mint-mode", zh: "薄荷绿", en: "Mint" },
      { value: "purple-mode", zh: "紫色", en: "Purple" },
      { value: "yellow-mode", zh: "黄色", en: "Yellow" },
      { value: "hot-red-mode", zh: "热辣红", en: "Hot Red" },
      { value: "forest-green-mode", zh: "森林绿", en: "Forest Green" },
      { value: "ocean-blue-mode", zh: "海洋蓝", en: "Ocean Blue" },
      { value: "pink-blue-mode", zh: "粉蓝", en: "Pink Blue" },
      { value: "neon-pink-mode", zh: "霓虹粉", en: "Neon Pink" },
      { value: "retro-orange-mode", zh: "复古橙", en: "Retro Orange" }
    ] },
    { id: "traditionalchinese", zh: "中国传统", en: "Traditional Chinese" },
    { id: "coilnotebook", zh: "线圈笔记本", en: "Coil Notebook", themes: [
      { value: "blue-mode", zh: "海蓝", en: "Ocean Blue" },
      { value: "pink-mode", zh: "粉色", en: "Pink" },
      { value: "mint-mode", zh: "薄荷绿", en: "Mint" },
      { value: "yellow-mode", zh: "暖黄", en: "Warm Yellow" }
    ] },
    { id: "purpleticket", zh: "紫色小红书", en: "Purple Ticket" },
    { id: "bytedance", zh: "字节范", en: "ByteDance" },
    { id: "warm", zh: "温暖柔和", en: "Warm Soft" },
    { id: "alibaba", zh: "阿里橙", en: "Alibaba Orange" },
    { id: "notebook", zh: "笔记本", en: "Notebook" },
    { id: "darktech", zh: "黑色科技", en: "Dark Tech" },
    { id: "fairytale", zh: "儿童童话", en: "Fairy Tale" },
    { id: "boardgamestyle", zh: "桌游风格", en: "Board Game" },
    { id: "cyberpunk", zh: "赛博朋克", en: "Cyberpunk" },
    { id: "glassmorphism", zh: "玻璃拟态", en: "Glassmorphism" },
    { id: "neonglow", zh: "霓虹发光", en: "Neon Glow" },
    { id: "vintagenewspaper", zh: "复古报纸", en: "Vintage Newspaper" },
    { id: "handwrittennote", zh: "手写笔记", en: "Handwritten Note" },
    { id: "vintagemap", zh: "古旧地图", en: "Vintage Map" },
    { id: "blueprint", zh: "蓝图技术", en: "Blueprint" },
    { id: "botanical", zh: "植物图鉴", en: "Botanical" },
    { id: "sketch", zh: "手绘涂鸦", en: "Sketch" },
    { id: "terminal", zh: "终端命令行", en: "Terminal" },
    { id: "retro", zh: "复古Win95", en: "Retro Win95" },
    { id: "ayulight", zh: "Ayu暖光", en: "Ayu Light" },
    { id: "bauhaus", zh: "包豪斯", en: "Bauhaus" },
    { id: "greensimple", zh: "清新绿", en: "Fresh Green" },
    { id: "maximalism", zh: "极繁主义", en: "Maximalism" },
    { id: "neobrutalism", zh: "新粗野主义", en: "Neo Brutalism" },
    { id: "newsprint", zh: "报纸印刷", en: "Newsprint" },
    { id: "organic", zh: "侘寂陶艺", en: "Wabi-sabi Ceramic" },
    { id: "playfulgeometric", zh: "活泼几何", en: "Playful Geometric" },
    { id: "professional", zh: "专业商务", en: "Professional" },
    { id: "plain", zh: "简洁", en: "Plain" }
  ];
  const DEFAULT_THEMES = { popart: "candy-mode", memo: "bright-mode", coilnotebook: "blue-mode" };

  let previewMarkdown = "";
  let previewHtml = "";
  const previewCssCache = new Map();

  function themeClassFor(templateId, theme) {
    const themes = CHAT_TEMPLATES.find((item) => item.id === templateId)?.themes;
    if (!themes?.some((item) => item.value === theme)) return "";
    return theme;
  }

  function fillThemeSelect(themeSelect, themeLabel, templateId) {
    const themes = CHAT_TEMPLATES.find((item) => item.id === templateId)?.themes || [];
    themeSelect.innerHTML = "";
    themes.forEach((theme) => {
      const option = document.createElement("option");
      option.value = theme.value;
      option.textContent = labelOf(theme);
      themeSelect.appendChild(option);
    });
    themeSelect.value = DEFAULT_THEMES[templateId] || themes[0]?.value || "";
    themeSelect.hidden = themes.length === 0;
    themeLabel.hidden = themes.length === 0;
  }

  function panelActionButtons() {
    const root = document.getElementById("htmlto-link-chat-export")?.shadowRoot;
    return root ? [...root.querySelectorAll(".copy, .preview, .publish")] : [];
  }

  function setPanelBusy(active, label) {
    panelActionButtons().forEach((button) => {
      button.disabled = true;
      if (button === active) {
        button.classList.add("is-busy");
        button.textContent = label;
      }
    });
  }

  function clearPanelBusy() {
    panelActionButtons().forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-busy");
    });
  }

  function holdBusy(startedAt, ms = 450) {
    const wait = ms - (Date.now() - startedAt);
    return wait > 0 ? new Promise((resolve) => setTimeout(resolve, wait)) : Promise.resolve();
  }

  function setMessageChecksHidden(hidden) {
    document.querySelectorAll(".htmlto-link-check").forEach((box) => {
      box.style.setProperty("display", hidden ? "none" : "", "important");
    });
  }

  function closePreview(notify) {
    const wasOpen = Boolean(document.getElementById("htmlto-link-preview"));
    document.getElementById("htmlto-link-preview")?.remove();
    setMessageChecksHidden(false);
    const panel = document.getElementById("htmlto-link-chat-export");
    if (panel) delete panel.dataset.preview;
    clearPanelBusy();
    const button = panel?.shadowRoot?.querySelector("[data-role=preview]");
    if (button) {
      button.classList.remove("is-on", "is-busy");
      button.textContent = t("previewChat");
      button.disabled = false;
    }
    if (notify && wasOpen) showToast(t("previewClosed"));
  }

  async function loadPreviewCss(path) {
    if (previewCssCache.has(path)) return previewCssCache.get(path);
    const response = await chrome.runtime.sendMessage({ type: "READ_EXTENSION_TEXT", path });
    if (!response?.ok || typeof response.text !== "string") {
      throw new Error(response?.error || "preview css unavailable");
    }
    previewCssCache.set(path, response.text);
    return response.text;
  }

  function setElementHtml(element, html) {
    const parsed = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    const container = parsed.body.firstElementChild;
    container?.querySelectorAll("script, iframe, object, embed").forEach((node) => node.remove());
    container?.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attr) => {
        if (attr.name.toLowerCase().startsWith("on") || attr.name === "srcdoc") node.removeAttribute(attr.name);
      });
    });
    element.replaceChildren();
    if (container) element.append(...container.childNodes);
  }

  function previewControls() {
    const root = document.getElementById("htmlto-link-chat-export")?.shadowRoot;
    return {
      template: root?.querySelector("[data-role=template]"),
      theme: root?.querySelector("[data-role=theme]")
    };
  }

  function ensurePreviewHost() {
    let host = document.getElementById("htmlto-link-preview");
    if (host?.shadowRoot?.getElementById("content")) return host;
    host?.remove();
    host = document.createElement("div");
    host.id = "htmlto-link-preview";
    host.dataset.htmltoLinkUi = "true";
    host.style.cssText = "position:fixed;inset:0;z-index:2147483646;width:100%;height:100%;overflow:auto;";
    const shadow = host.attachShadow({ mode: "open" });
    ["katex-style", "common-style", "template-style", "shell-style"].forEach((id) => {
      const style = document.createElement("style");
      style.id = id;
      shadow.appendChild(style);
    });
    const page = document.createElement("div");
    page.className = "share-page";
    const main = document.createElement("main");
    main.className = "share-layout";
    const status = document.createElement("div");
    status.className = "preview-status";
    const badge = document.createElement("span");
    badge.id = "preview-badge";
    badge.className = "badge";
    status.appendChild(badge);
    const stage = document.createElement("div");
    stage.className = "share-stage";
    const shell = document.createElement("div");
    shell.className = "share-card-shell";
    const card = document.createElement("section");
    card.id = "card";
    const cardContent = document.createElement("section");
    cardContent.className = "card-content";
    const content = document.createElement("div");
    content.id = "content";
    content.className = "card-content-inner";
    cardContent.appendChild(content);
    card.appendChild(cardContent);
    shell.appendChild(card);
    const toc = document.createElement("aside");
    toc.id = "toc";
    toc.className = "share-toc";
    toc.hidden = true;
    toc.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      event.preventDefault();
      const id = decodeURIComponent((link.getAttribute("href") || "").replace(/^#/, ""));
      shadow.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    stage.append(shell, toc);
    main.append(status, stage);
    page.appendChild(main);
    shadow.appendChild(page);
    (document.body || document.documentElement).appendChild(host);
    return host;
  }

  function paintMath(root) {
    const katexApi = globalThis.htmltoLinkKatex || globalThis.katex;
    if (!katexApi?.render) return;
    root.querySelectorAll(".math-inline, .math-block").forEach((element) => {
      const formula = element.getAttribute("data-formula");
      if (!formula) return;
      try {
        katexApi.render(formula, element, {
          throwOnError: false,
          strict: "ignore",
          displayMode: element.classList.contains("math-block")
        });
      } catch (err) {
        console.warn("[htmlto.link] preview formula failed", err);
        element.textContent = formula;
      }
    });
  }

  async function renderPreview() {
    const previewApi = globalThis.htmltoLinkPreview;
    if (!previewApi?.renderMarkdown) throw new Error("preview renderer missing");
    const { template, theme } = previewControls();
    const templateId = template?.value || "memo";
    const themeClass = themeClassFor(templateId, theme?.value || "");
    const meta = previewApi.TEMPLATE_META[templateId] || previewApi.TEMPLATE_META.memo;
    const fontBase = chrome.runtime.getURL("preview/vendor/katex/fonts/");
    const [katexCss, commonCss, templateCss, shellCss] = await Promise.all([
      loadPreviewCss("preview/vendor/katex/katex.min.css"),
      loadPreviewCss("preview/templates/common.css"),
      loadPreviewCss(`preview/templates/${meta.cssFile}`),
      loadPreviewCss("preview/preview.css")
    ]);
    const host = ensurePreviewHost();
    const shadow = host.shadowRoot;
    shadow.getElementById("katex-style").textContent = katexCss.replace(/url\(fonts\//g, `url(${fontBase}`);
    shadow.getElementById("common-style").textContent = commonCss;
    shadow.getElementById("template-style").textContent = templateCss;
    shadow.getElementById("shell-style").textContent = shellCss;
    let html;
    let headings = [];
    if (previewHtml) {
      html = previewHtml;
    } else {
      const rendered = previewApi.renderMarkdown(previewMarkdown);
      html = rendered.html;
      headings = rendered.headings;
    }
    const card = shadow.getElementById("card");
    const classes = ["card", meta.cardClass, themeClass, ...(meta.extraClasses || [])].filter(Boolean);
    card.className = classes.join(" ");
    const templateLabel = template?.selectedOptions?.[0]?.textContent || "";
    if (meta.cardClass === "card-memo" && templateLabel) {
      card.style.setProperty("--memo-header-title", `"${templateLabel.replace(/"/g, "")}"`);
    } else {
      card.style.removeProperty("--memo-header-title");
    }
    const content = shadow.getElementById("content");
    setElementHtml(content, html);
    if (previewHtml) {
      content.querySelectorAll("h1, h2, h3, h4").forEach((el) => {
        const label = (el.textContent || "").trim();
        if (!label) return;
        if (!el.id) el.id = `preview-section-${headings.length + 1}`;
        headings.push({ depth: Number(el.tagName.slice(1)), id: el.id, label });
      });
    } else {
      paintMath(content);
    }
    shadow.appendChild(shadow.getElementById("katex-style"));
    const toc = shadow.getElementById("toc");
    if (headings.length < 2) {
      toc.hidden = true;
      toc.replaceChildren();
    } else {
      toc.hidden = false;
      setElementHtml(toc, `<div class="share-toc-title">${escapeHtml(t("previewToc"))}</div><nav class="share-toc-links">${headings.map((heading) => `<a class="share-toc-link share-toc-level-${heading.depth}" href="#${escapeHtml(heading.id)}">${escapeHtml(heading.label)}</a>`).join("")}</nav>`);
    }
    shadow.getElementById("preview-badge").textContent = t("previewOn");
  }

  async function refreshOpenPreview() {
    const button = document.getElementById("htmlto-link-chat-export")?.shadowRoot?.querySelector("[data-role=preview]");
    const started = Date.now();
    setPanelBusy(button, t("previewUpdating"));
    try {
      await renderPreview();
      await holdBusy(started, 280);
      clearPanelBusy();
      if (button) {
        button.classList.add("is-on");
        button.textContent = t("previewExit");
      }
    } catch (err) {
      console.warn("[htmlto.link] preview update failed", err);
      clearPanelBusy();
      if (button) button.textContent = t("previewExit");
      showToast(t("previewFailed"));
    }
  }

  async function togglePreview(button) {
    const panel = document.getElementById("htmlto-link-chat-export");
    if (panel?.dataset.preview === "1") {
      closePreview(true);
      return;
    }
    const started = Date.now();
    setPanelBusy(button, t("previewing"));
    showToast(t("previewing"));
    try {
      const turns = await selectedConversationTurns();
      if (!turns.length) {
        clearPanelBusy();
        button.textContent = t("previewChat");
        showToast(allConversationTurns().length ? t("chatNoneSelected") : t("chatEmpty"));
        return;
      }
      previewMarkdown = conversationMarkdown(turns);
      previewHtml = conversationPreviewHtml(turns);
      await renderPreview();
      await holdBusy(started);
      clearPanelBusy();
      setMessageChecksHidden(true);
      if (panel) panel.dataset.preview = "1";
      button.classList.add("is-on");
      button.textContent = t("previewExit");
      showToast(t("previewReady"));
    } catch (err) {
      console.warn("[htmlto.link] preview failed", err);
      closePreview();
      button.textContent = t("previewChat");
      const detail = String(err?.message || "").trim().slice(0, 160);
      showToast(detail ? `${t("previewFailed")}（${detail}）` : t("previewFailed"));
    }
  }

  function syncChatExportButton() {
    const existing = document.getElementById("htmlto-link-chat-export");
    if (!syncMessageChecks().length) {
      if (existing && existing.dataset.busy !== "1" && existing.dataset.preview !== "1") {
        closePreview();
        existing.remove();
      }
      return;
    }
    if (existing?.isConnected) return;
    if (!document.body) return;

    document.querySelectorAll("#htmlto-link-chat-export").forEach((node) => node.remove());
    const host = document.createElement("div");
    host.id = "htmlto-link-chat-export";
    host.dataset.htmltoLinkUi = "true";
    host.setAttribute("popover", "manual");
    host.style.cssText = "position:fixed;top:16px;right:16px;left:auto;bottom:auto;width:max-content;height:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;z-index:2147483647;";
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      .panel {
        box-sizing: border-box;
        width: 232px;
        padding: 10px;
        color: #17191f;
        background: #fff;
        border: 1px solid #e6e8ee;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(23, 25, 31, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 28px;
        margin-bottom: 8px;
        cursor: move;
        color: #17191f;
        font-size: 13px;
        font-weight: 650;
      }
      .grip { color: #b0b6c2; font-size: 12px; letter-spacing: 1px; }
      .fold {
        margin-left: auto;
        width: 22px;
        height: 22px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #6b7280;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
      }
      .fold:hover { background: #f3f4f6; }
      .body { display: flex; flex-direction: column; gap: 8px; }
      .panel.collapsed .body, .panel.collapsed .head { margin-bottom: 0; }
      .panel.collapsed .body { display: none; }
      label { font-size: 11px; color: #6b7280; }
      select, button { box-sizing: border-box; width: 100%; font: 13px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      select {
        height: 32px;
        padding: 0 8px;
        color: #17191f;
        background: #fff;
        border: 1px solid #e1e4ea;
        border-radius: 8px;
        color-scheme: light;
      }
      .copy, .preview, .publish {
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
      }
      .copy { color: #17191f; background: #fff; border: 1px solid #e1e4ea; }
      .copy:hover { background: #f7f8fa; }
      .preview { color: #3451c7; background: #fff; border: 1px solid #3451c7; font-weight: 600; }
      .preview:hover { background: #f4f6fd; }
      .preview.is-on { color: #fff; background: #3451c7; }
      .publish { color: #fff; background: #3451c7; border: 0; font-weight: 600; }
      .publish:hover { background: #2c46b0; }
      button:disabled { opacity: 0.72; cursor: default; }
      button.is-busy {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      button.is-busy::before {
        content: "";
        width: 12px;
        height: 12px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: htmlto-spin 0.7s linear infinite;
      }
      @keyframes htmlto-spin { to { transform: rotate(360deg); } }
      .dock { display: flex; align-items: flex-start; gap: 8px; }
      .side-toast {
        flex: none;
        width: max-content;
        max-width: 280px;
        padding: 8px 12px;
        color: #17191f;
        background: #fff;
        border: 1px solid #3451c7;
        border-radius: 10px;
        box-shadow: 0 8px 20px rgba(23, 25, 31, 0.08);
        font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .side-toast p { margin: 0; font-weight: 650; }
      .side-toast a { display: block; margin-top: 4px; color: #3451c7; font-size: 12px; word-break: break-all; }
      .side-toast button {
        width: auto;
        margin-top: 6px;
        padding: 4px 10px;
        color: #fff;
        background: #3451c7;
        border: 0;
        border-radius: 6px;
        cursor: pointer;
      }
    `;

    const panel = document.createElement("div");
    panel.className = "panel";
    const header = document.createElement("div");
    header.className = "head";
    header.innerHTML = `<span class="grip" aria-hidden="true">⋮⋮</span><span>${t("extName")}</span>`;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "fold";
    toggle.textContent = "–";
    toggle.title = t("dismiss");
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      panel.classList.toggle("collapsed");
    });
    header.appendChild(toggle);

    const body = document.createElement("div");
    body.className = "body";
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "copy";
    copyBtn.textContent = t("copyChatMd");
    copyBtn.addEventListener("click", async () => {
      const started = Date.now();
      setPanelBusy(copyBtn, t("copyingChat"));
      try {
        const selected = await selectedConversationTurns();
        if (!selected.length) {
          clearPanelBusy();
          copyBtn.textContent = t("copyChatMd");
          showToast(allConversationTurns().length ? t("chatNoneSelected") : t("chatEmpty"));
          return;
        }
        const markdown = conversationMarkdown(selected);
        await copyToClipboard(markdown);
        await holdBusy(started);
        clearPanelBusy();
        copyBtn.textContent = t("copyChatMd");
        showToast(t("chatCopied"));
      } catch (err) {
        clearPanelBusy();
        copyBtn.textContent = t("copyChatMd");
        showToast(err.message || t("publishFailed"));
      }
    });

    const templateLabel = document.createElement("label");
    templateLabel.textContent = t("panelTemplate");
    const templateSelect = document.createElement("select");
    templateSelect.dataset.role = "template";
    CHAT_TEMPLATES.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = labelOf(item);
      templateSelect.appendChild(option);
    });

    const themeLabel = document.createElement("label");
    themeLabel.textContent = t("panelTheme");
    const themeSelect = document.createElement("select");
    themeSelect.dataset.role = "theme";
    templateSelect.addEventListener("change", () => {
      fillThemeSelect(themeSelect, themeLabel, templateSelect.value);
      if (document.getElementById("htmlto-link-chat-export")?.dataset.preview === "1") {
        void refreshOpenPreview();
      }
    });
    themeSelect.addEventListener("change", () => {
      if (document.getElementById("htmlto-link-chat-export")?.dataset.preview === "1") {
        void refreshOpenPreview();
      }
    });
    fillThemeSelect(themeSelect, themeLabel, templateSelect.value);

    const previewBtn = document.createElement("button");
    previewBtn.type = "button";
    previewBtn.className = "preview";
    previewBtn.dataset.role = "preview";
    previewBtn.textContent = t("previewChat");
    previewBtn.addEventListener("click", () => togglePreview(previewBtn));

    const publishBtn = document.createElement("button");
    publishBtn.type = "button";
    publishBtn.className = "publish";
    publishBtn.textContent = t("shareChat");
    publishBtn.addEventListener("click", () => publishConversation(publishBtn, templateSelect.value, themeSelect.value));

    const codeToggle = document.createElement("button");
    codeToggle.type = "button";
    codeToggle.className = "copy";
    codeToggle.dataset.role = "code-buttons";
    codeToggle.textContent = autoInjectEnabled ? t("hideCodeButtons") : t("showCodeButtons");
    codeToggle.addEventListener("click", () => {
      chrome.storage.local.set({ autoInject: !autoInjectEnabled });
    });

    body.append(copyBtn, templateLabel, templateSelect, themeLabel, themeSelect, previewBtn, publishBtn, codeToggle);
    panel.append(header, body);
    const dock = document.createElement("div");
    dock.className = "dock";
    dock.append(panel);
    shadow.append(style, dock);
    bindPanelDrag(host, header);
    document.body.appendChild(host);
    try { host.showPopover(); } catch { /* 旧版浏览器仍用 fixed 定位 */ }
  }

  function bindPanelDrag(panel, header) {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    header.addEventListener("mousedown", (event) => {
      if (event.button !== 0 || event.target.closest("button")) return;
      const rect = panel.getBoundingClientRect();
      dragging = true;
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      panel.style.left = `${rect.left}px`;
      panel.style.top = `${rect.top}px`;
      panel.style.right = "auto";
      panel.classList.add("htmlto-link-panel-dragging");
    });
    document.addEventListener("mousemove", (event) => {
      if (!dragging) return;
      event.preventDefault();
      const rect = panel.getBoundingClientRect();
      const x = Math.max(6, Math.min(event.clientX - offsetX, window.innerWidth - rect.width - 6));
      const y = Math.max(6, Math.min(event.clientY - offsetY, window.innerHeight - rect.height - 6));
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
    });
    document.addEventListener("mouseup", () => {
      dragging = false;
      panel.classList.remove("htmlto-link-panel-dragging");
    });
  }

  async function publishConversation(btn, templateId, theme) {
    const panel = document.getElementById("htmlto-link-chat-export");
    const started = Date.now();
    if (panel) panel.dataset.busy = "1";
    setPanelBusy(btn, t("publishingChat"));
    showToast(t("publishingChat"));
    const turns = await selectedConversationTurns();
    if (!turns.length) {
      clearPanelBusy();
      btn.textContent = t("shareChat");
      if (panel) delete panel.dataset.busy;
      showToast(allConversationTurns().length ? t("chatNoneSelected") : t("chatEmpty"));
      return;
    }
    const themeClass = themeClassFor(templateId, theme);
    try {
      const response = await chrome.runtime.sendMessage({
        type: "UPLOAD_CONTENT",
        code: conversationMarkdown(turns),
        filename: "conversation.md",
        format: "md",
        templateId: templateId || "plain",
        themeClass
      });
      if (!response?.success || !response.url) throw new Error(response?.error || t("publishFailed"));
      await copyToClipboard(response.url);
      await savePublishHistory({
        url: response.url,
        filename: "conversation.md",
        format: "md",
        templateId: templateId || "plain",
        timestamp: Date.now(),
        expiresAt: response.expiresAt || null,
        manageUrl: response.manageUrl || "",
        temporary: response.temporary !== false
      });
      await holdBusy(started);
      clearPanelBusy();
      btn.classList.remove("is-busy");
      btn.textContent = t("copiedLink", [t("fmtMdName")]);
      showToast(t("publishSuccessToast", [t("fmtMdName")]), response.url);
      setTimeout(() => {
        btn.textContent = t("shareChat");
        btn.disabled = false;
        if (panel) delete panel.dataset.busy;
      }, 3500);
    } catch (err) {
      clearPanelBusy();
      btn.textContent = t("publishFailed");
      showToast(err.message || t("publishFailed"));
      setTimeout(() => {
        btn.textContent = t("shareChat");
        btn.disabled = false;
        if (panel) delete panel.dataset.busy;
      }, 3000);
    }
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
    const panel = document.getElementById("htmlto-link-chat-export")?.shadowRoot;
    if (panel) {
      const dock = panel.querySelector(".dock");
      let toast = panel.querySelector(".side-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "side-toast";
        dock.prepend(toast);
      }
      toast.innerHTML = `
        <p>${escapeHtml(message)}</p>
        ${linkUrl ? `<a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkUrl)}</a>` : ""}
        ${actionLabel ? `<button type="button">${escapeHtml(actionLabel)}</button>` : ""}
      `;
      if (actionLabel && onAction) {
        toast.querySelector("button")?.addEventListener("click", () => {
          toast.remove();
          onAction();
        });
      }
      clearTimeout(toast._hideTimer);
      toast._hideTimer = setTimeout(() => toast.remove(), 2500);
      return;
    }
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
