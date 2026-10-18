// Options page logic for HTML To Link extension

document.addEventListener("DOMContentLoaded", async () => {
  const DEFAULT_API_SERVER = "https://htmlto.link";
  const t = (key) => chrome.i18n.getMessage(key) || key;
  document.title = t("optionsTitle");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });

  const autoInjectToggle = document.getElementById("autoInjectToggle");
  const loginBtn = document.getElementById("loginBtn");
  const loginHint = document.getElementById("loginHint");
  const accountStatus = document.getElementById("accountStatus");
  const toast = document.getElementById("toast");

  const settings = await chrome.storage.local.get({
    autoInject: true,
    apiToken: "",
  });

  autoInjectToggle.checked = settings.autoInject !== false;

  function showAccount(token) {
    const signedIn = Boolean(token);
    accountStatus.textContent = signedIn ? t("accountBound") : t("accountGuest");
    loginBtn.classList.toggle("hidden", signedIn);
    if (loginHint) loginHint.classList.toggle("hidden", signedIn);
  }
  showAccount(settings.apiToken);
  try {
    const synced = await chrome.runtime.sendMessage({ type: "SYNC_SITE_LOGIN" });
    if (synced?.ok || synced?.reason === "signed-out" || synced?.reason === "unauthorized") {
      const next = await chrome.storage.local.get(["apiToken"]);
      showAccount(next.apiToken);
    }
  } catch {
    /* 打开页面时网站未登录，保留本地状态 */
  }

  autoInjectToggle.addEventListener("change", async () => {
    await chrome.storage.local.set({ autoInject: autoInjectToggle.checked });
    showToast(t("settingsSaved"));
  });

  loginBtn.addEventListener("click", async () => {
    loginBtn.disabled = true;
    try {
      const synced = await chrome.runtime.sendMessage({ type: "SYNC_SITE_LOGIN" });
      if (synced?.ok) {
        const next = await chrome.storage.local.get(["apiToken"]);
        showAccount(next.apiToken);
        showToast(t("accountConnected"));
        return;
      }
      await chrome.tabs.create({ url: `${DEFAULT_API_SERVER}/login` });
    } catch (err) {
      showToast(err.message || t("publishFailed"));
    } finally {
      loginBtn.disabled = false;
    }
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2500);
  }
});
