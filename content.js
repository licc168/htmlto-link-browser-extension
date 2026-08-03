// Content Script for AI Chat Platforms (ChatGPT, Claude, DeepSeek, v0, Kimi, etc.)

(function () {
  console.log("HTML To Link extension content script active.");

  // Inject styles if not present
  const BUTTON_CLASS = "htmlto-link-inject-btn";
  const PROCESSED_ATTR = "data-htmlto-link-processed";

  // Observe DOM for newly added AI code blocks
  const observer = new MutationObserver(() => {
    scanAndInjectButtons();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  scanAndInjectButtons();

  // Toast listener from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SHOW_TOAST") {
      showToast(msg.message, msg.url);
    }
  });

  function scanAndInjectButtons() {
    // Find pre / code elements
    const codeBlocks = document.querySelectorAll("pre code, pre");
    codeBlocks.forEach((block) => {
      if (block.getAttribute(PROCESSED_ATTR)) return;

      const codeText = block.innerText || block.textContent || "";
      if (!isLikelyHtml(codeText)) return;

      block.setAttribute(PROCESSED_ATTR, "true");

      const parentPre = block.tagName.toLowerCase() === "pre" ? block : block.closest("pre");
      if (!parentPre) return;

      // Find code block action container or parent wrapper
      let targetContainer = parentPre;

      const btn = document.createElement("button");
      btn.className = BUTTON_CLASS;
      btn.type = "button";
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 14h10"/><path d="M16 4h2a2 2 0 0 1 2 2v1.344"/><path d="m17 18 4-4-4-4"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113"/><rect x="8" y="2" width="8" height="4" rx="1"/>
        </svg>
        <span>1秒生成链接 (htmlto.link)</span>
      `;

      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `
          <svg class="htmlto-link-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span>发布中...</span>
        `;

        try {
          const response = await chrome.runtime.sendMessage({
            type: "UPLOAD_HTML",
            code: codeText,
            filename: "ai-generated-page.html"
          });

          if (response && response.success && response.url) {
            btn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              <span>已复制链接！</span>
            `;
            btn.classList.add("htmlto-link-success");

            // Copy to clipboard
            await navigator.clipboard.writeText(response.url);

            showToast("🎉 已成功发布并复制链接到剪贴板！", response.url);

            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.disabled = false;
              btn.classList.remove("htmlto-link-success");
            }, 3500);
          } else {
            throw new Error(response?.error || "发布失败");
          }
        } catch (err) {
          btn.innerHTML = `❌ 发布失败`;
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }, 3000);
        }
      });

      // Position button on top right of parentPre
      if (getComputedStyle(targetContainer).position === "static") {
        targetContainer.style.position = "relative";
      }
      targetContainer.appendChild(btn);
    });
  }

  // Detect if code is likely HTML
  function isLikelyHtml(code) {
    const trimmed = code.trim().toLowerCase();
    if (trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html")) return true;
    if (trimmed.includes("<body") && trimmed.includes("</body>")) return true;
    if (trimmed.includes("<div") && (trimmed.includes("class=") || trimmed.includes("id="))) return true;
    if (trimmed.includes("</html>") || trimmed.includes("</script>") || trimmed.includes("</style>")) return true;
    return false;
  }

  // Show Toast Message
  function showToast(message, linkUrl) {
    let toast = document.getElementById("htmlto-link-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "htmlto-link-toast";
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="htmlto-link-toast-content">
        <p>${message}</p>
        ${linkUrl ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a>` : ""}
      </div>
    `;

    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 4500);
  }
})();
