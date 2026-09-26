// Welcome page logic for HTML To Link extension
(function () {
  const t = (key) => chrome.i18n.getMessage(key) || key;

  document.title = t("welcomeTitle");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  const demoBtn = document.getElementById("demoBtn");
  const chatgptBtn = document.getElementById("chatgptBtn");
  const demoResult = document.getElementById("demoResult");
  const demoUrlInput = document.getElementById("demoUrl");
  const copyDemoBtn = document.getElementById("copyDemoBtn");
  const openDemoBtn = document.getElementById("openDemoBtn");
  const keepDemoBtn = document.getElementById("keepDemoBtn");
  const demoError = document.getElementById("demoError");

  chatgptBtn.addEventListener("click", () => {
    const lang = (chrome.i18n.getUILanguage() || "").toLowerCase();
    const url = lang.startsWith("zh") ? "https://chat.deepseek.com/" : "https://chatgpt.com/";
    chrome.tabs.create({ url });
  });

  demoBtn.addEventListener("click", async () => {
    demoError.classList.remove("show");
    demoBtn.disabled = true;
    demoBtn.textContent = t("publishing");

    try {
      const demoRes = await fetch(chrome.runtime.getURL("demo.html"));
      const code = await demoRes.text();
      const response = await chrome.runtime.sendMessage({
        type: "UPLOAD_CONTENT",
        code,
        filename: "index.html",
        format: "html"
      });

      if (!response || !response.success || !response.url) {
        throw new Error(response?.error || t("publishFailed"));
      }

      demoUrlInput.value = response.url;
      openDemoBtn.href = response.url;
      keepDemoBtn.href = response.manageUrl || "https://htmlto.link/settings";
      demoResult.classList.add("show");
      await copyToClipboard(response.url);

      const data = await chrome.storage.local.get(["uploadHistory", "publishCount"]);
      const list = data.uploadHistory || [];
      list.unshift({
        url: response.url,
        filename: "index.html",
        format: "html",
        timestamp: Date.now(),
        expiresAt: response.expiresAt || null,
        manageUrl: response.manageUrl || "",
        temporary: response.temporary !== false
      });
      if (list.length > 30) list.pop();
      await chrome.storage.local.set({
        uploadHistory: list,
        publishCount: (data.publishCount || 0) + 1,
        pinHintDismissed: true
      });
    } catch (err) {
      demoError.textContent = err.message || t("publishFailed");
      demoError.classList.add("show");
    } finally {
      demoBtn.disabled = false;
      demoBtn.textContent = t("welcomePublishDemo");
    }
  });

  copyDemoBtn.addEventListener("click", async () => {
    if (demoUrlInput.value) {
      await copyToClipboard(demoUrlInput.value);
      copyDemoBtn.textContent = t("linkCopied");
      setTimeout(() => {
        copyDemoBtn.textContent = t("copy");
      }, 1600);
    }
  });

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
})();
