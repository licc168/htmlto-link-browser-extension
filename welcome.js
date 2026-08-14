// Welcome page logic for HTML To Link extension
(function () {
  const t = (key) => chrome.i18n.getMessage(key) || key;

  document.title = t("welcomeTitle");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  const closeBtn = document.getElementById("closeBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => window.close());
  }
})();
