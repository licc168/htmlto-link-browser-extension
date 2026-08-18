// Page-aware zh/en strings for injected UI (AI chats + local HTML).
// Prefer the page language; fall back to Chrome UI language.

(function (global) {
  const STRINGS = {
    zh: {
      genHtmlLink: "生成 HTML 链接",
      genMdLink: "生成 Markdown 链接",
      tplSelectTitle: "选择 Markdown 渲染模板（默认：简洁）",
      tplPlain: "简洁",
      tplMemo: "备忘录",
      tplBytedance: "字节范",
      tplDarktech: "暗黑科技",
      tplCoilnotebook: "线圈笔记本",
      tplTraditionalchinese: "中国传统",
      tplPopart: "波普艺术",
      tplWarm: "温暖柔和",
      tplAlibaba: "阿里橙",
      publishing: "发布中…",
      fmtHtmlName: "HTML",
      fmtMdName: "Markdown",
      copiedLink: "已复制 $1 链接！",
      publishSuccessToast: "🎉 已成功发布并复制 $1 链接！",
      publishFailed: "发布失败",
      dismissInjectTitle: "关闭自动注入",
      dismissInjectToast: "已关闭自动注入。可点击扩展图标 → 设置 重新开启",
      dismissInjectUndo: "撤销",
      filePublishBtn: "发布此页面",
      filePublishDismiss: "隐藏",
      filePublishCopied: "链接已复制",
      localFileCaptureFailed: "读不到这个本地页面。请打开「允许访问文件网址」，或把 HTML 粘贴到插件里发布。"
    },
    en: {
      genHtmlLink: "Generate HTML link",
      genMdLink: "Generate Markdown link",
      tplSelectTitle: "Choose a Markdown template (default: Plain)",
      tplPlain: "Plain",
      tplMemo: "Memo",
      tplBytedance: "ByteDance",
      tplDarktech: "Dark Tech",
      tplCoilnotebook: "Coil Notebook",
      tplTraditionalchinese: "Traditional Chinese",
      tplPopart: "Pop Art",
      tplWarm: "Warm Soft",
      tplAlibaba: "Alibaba Orange",
      publishing: "Publishing…",
      fmtHtmlName: "HTML",
      fmtMdName: "Markdown",
      copiedLink: "Copied $1 link!",
      publishSuccessToast: "🎉 Published and copied the $1 link!",
      publishFailed: "Publish failed",
      dismissInjectTitle: "Turn off auto-inject",
      dismissInjectToast: "Auto-inject is off. Open the extension → Settings to turn it back on.",
      dismissInjectUndo: "Undo",
      filePublishBtn: "Publish this page",
      filePublishDismiss: "Hide",
      filePublishCopied: "Link copied",
      localFileCaptureFailed: "Could not read this local page. Enable “Allow access to file URLs”, or paste the HTML in the popup."
    }
  };

  function resolveLocale() {
    const pageLang = String(
      document.documentElement.lang ||
      document.documentElement.getAttribute("xml:lang") ||
      ""
    ).toLowerCase();
    if (pageLang.startsWith("zh")) return "zh";
    if (pageLang.startsWith("en")) return "en";

    const ui = String(
      (chrome.i18n && chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) ||
      navigator.language ||
      ""
    ).toLowerCase();
    return ui.startsWith("zh") ? "zh" : "en";
  }

  function applySubs(msg, substitutions) {
    if (!substitutions || !substitutions.length) return msg;
    return String(msg).replace(/\$(\d+)/g, (_, n) => {
      const value = substitutions[Number(n) - 1];
      return value == null ? "" : String(value);
    });
  }

  global.htmltoLinkT = function (key, substitutions) {
    const pack = STRINGS[resolveLocale()] || STRINGS.en;
    const msg = pack[key] || (chrome.i18n && chrome.i18n.getMessage(key, substitutions)) || key;
    return applySubs(msg, substitutions);
  };
})(typeof window !== "undefined" ? window : self);
