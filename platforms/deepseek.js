(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "deepseek",
    findCodeBlocks: (root) => root.querySelectorAll(".md-code-block pre, pre"),
    getCodeElement: (block) => block,
    // DeepSeek rewrites <pre> children during syntax highlighting. Its outer
    // code-block wrapper is stable and keeps extension UI outside owned content.
    getMountTarget: (block) => block.closest(".md-code-block") || block.parentElement || block,
    getLanguageHint: (block) => {
      const wrapper = block.closest(".md-code-block");
      const banner = wrapper?.querySelector(".md-code-block-banner, .md-code-block-banner-wrap");
      return banner?.textContent || "";
    }
  };
})();
