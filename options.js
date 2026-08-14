// Options page logic for HTML To Link extension

document.addEventListener("DOMContentLoaded", async () => {
  const t = (key) => chrome.i18n.getMessage(key) || key;
  document.title = t("optionsTitle");

  // Apply i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });

  const autoInjectToggle = document.getElementById("autoInjectToggle");
  const serverInput = document.getElementById("serverInput");
  const tokenInput = document.getElementById("tokenInput");
  const saveBtn = document.getElementById("saveBtn");
  const toast = document.getElementById("toast");

  const settings = await chrome.storage.local.get({
    autoInject: true,
    apiServer: "https://htmlto.link",
    apiToken: "",
  });

  autoInjectToggle.checked = settings.autoInject !== false;
  serverInput.value = settings.apiServer;
  tokenInput.value = settings.apiToken || "";

  // 自动注入开关：即时保存并生效
  autoInjectToggle.addEventListener("change", async () => {
    await chrome.storage.local.set({ autoInject: autoInjectToggle.checked });
    showToast(t("settingsSaved"));
  });

  saveBtn.addEventListener("click", async () => {
    let server = serverInput.value.trim().replace(/\/$/, "");
    if (!server) server = "https://htmlto.link";

    await chrome.storage.local.set({
      apiServer: server,
      apiToken: tokenInput.value.trim(),
    });
    showToast(t("settingsSaved"));
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2500);
  }
});
