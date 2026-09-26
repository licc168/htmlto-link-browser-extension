// One-click publish for local HTML opened as file://
// Chrome only injects this after the user enables "Allow access to file URLs".

(function () {
  if (window.__htmltoLinkFilePublish) return;
  window.__htmltoLinkFilePublish = true;

  const FAB_ID = "htmlto-link-file-fab";
  const t = (key, substitutions) =>
    (typeof htmltoLinkT === "function" ? htmltoLinkT(key, substitutions) : chrome.i18n.getMessage(key, substitutions)) || key;

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === "GET_PAGE_HTML") {
      sendResponse(capturePageHtml());
    }
  });

  if (!isLocalHtml()) return;
  mountFab();

  function isLocalHtml() {
    if (location.protocol !== "file:") return false;
    const name = decodeURIComponent(location.pathname || "").toLowerCase();
    if (/\.(png|jpe?g|gif|webp|svg|pdf|txt|css|js|json|xml|mp4|mp3|zip|woff2?|ttf)$/i.test(name)) {
      return false;
    }
    if (
      document.contentType &&
      document.contentType !== "text/html" &&
      document.contentType !== "application/xhtml+xml" &&
      !/\.html?$/i.test(name)
    ) {
      return false;
    }
    return Boolean(document.documentElement && document.body);
  }

  function capturePageHtml() {
    if (!isLocalHtml()) return null;
    const path = decodeURIComponent(location.pathname || "");
    const name = path.split(/[/\\]/).filter(Boolean).pop() || "index.html";
    const dt = document.doctype;
    const doctype = dt
      ? `<!DOCTYPE ${dt.name}>\n`
      : "<!DOCTYPE html>\n";
    return {
      html: doctype + document.documentElement.outerHTML,
      filename: /\.html?$/i.test(name) ? name : `${name}.html`
    };
  }

  function mountFab() {
    if (document.getElementById(FAB_ID)) return;

    const wrap = document.createElement("div");
    wrap.id = FAB_ID;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "htmlto-link-file-btn";
    btn.innerHTML = `<span>${escapeHtml(t("filePublishBtn"))}</span>`;

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await publishPage(btn);
    });

    wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  async function publishPage(btn) {
    const page = capturePageHtml();
    if (!page?.html) {
      showToast(t("localFileCaptureFailed"));
      return;
    }

    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span>${escapeHtml(t("publishing"))}</span>`;

    try {
      const response = await chrome.runtime.sendMessage({
        type: "UPLOAD_CONTENT",
        code: page.html,
        filename: page.filename,
        format: "html"
      });

      if (!response?.success || !response.url) {
        throw new Error(response?.error || t("publishFailed"));
      }

      btn.classList.add("htmlto-link-file-success");
      btn.innerHTML = `<span>${escapeHtml(t("filePublishCopied"))}</span>`;
      await copyToClipboard(response.url);
      await savePublishHistory({
        url: response.url,
        filename: page.filename,
        format: "html",
        timestamp: Date.now(),
        expiresAt: response.expiresAt || null,
        manageUrl: response.manageUrl || "",
        temporary: response.temporary !== false
      });
      showToast(t("publishSuccessToast", ["HTML"]), response.url);

      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
        btn.classList.remove("htmlto-link-file-success");
      }, 3500);
    } catch (err) {
      btn.innerHTML = `<span>${escapeHtml(err.message || t("publishFailed"))}</span>`;
      showToast(err.message || t("publishFailed"));
      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
      }, 3000);
    }
  }

  async function savePublishHistory(item) {
    const data = await chrome.storage.local.get(["uploadHistory", "publishCount"]);
    const list = data.uploadHistory || [];
    list.unshift(item);
    if (list.length > 30) list.pop();
    await chrome.storage.local.set({
      uploadHistory: list,
      publishCount: (data.publishCount || 0) + 1
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
    setTimeout(() => toast.classList.remove("show"), 4500);
  }

  function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
