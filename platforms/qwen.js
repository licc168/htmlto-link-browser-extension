(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "qwen",
    findCodeBlocks: (root) => root.querySelectorAll(".qw-md-code pre, pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    // New Qianwen renders a sticky toolbar above a syntax highlighter. Keep
    // extension UI on the stable wrapper, outside the owned <pre>/<code> tree.
    getMountTarget: (block) => block.closest(".qw-md-code") || block.parentElement || block,
    getLanguageHint: (block) => {
      const wrapper = block.closest(".qw-md-code");
      return wrapper?.firstElementChild?.firstElementChild?.textContent || "";
    },
    // react-syntax-highlighter includes visible line-number spans in textContent.
    // Remove them so detection and uploaded source both contain valid code.
    getCodeText: (codeEl) => {
      const clone = codeEl.cloneNode(true);
      clone.querySelectorAll(".linenumber, .react-syntax-highlighter-line-number").forEach((node) => node.remove());
      return clone.textContent || "";
    }
  };
})();
