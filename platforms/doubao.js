(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "doubao",
    findCodeBlocks: (root) => root.querySelectorAll(".custom-code-block-container pre, .code-area pre, pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    // Doubao's <pre> can be narrower than the visual code block. Mount on the
    // stable code-area so the action aligns with its 32px native toolbar.
    getMountTarget: (block) => block.closest(".code-area") || block.parentElement || block,
    getLanguageHint: (block) => {
      const classMatch = String(block.className || "").match(/(?:language|lang)-([a-z0-9+#]+)/i);
      if (classMatch) return classMatch[1];
      const header = block.closest(".code-area")?.querySelector('[class*="header"]');
      return header?.textContent || "";
    }
  };
})();
