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
    },
    extractConversation(root) {
      const { pushTurn, firstMatch } = globalThis.htmltoLinkMarkdown;
      const turns = [];
      root.querySelectorAll('[data-message-id], div[data-testid="union_message"]').forEach((wrapper) => {
        const roleAttr = wrapper.getAttribute("data-role") || wrapper.getAttribute("data-message-author-role") || "";
        const className = String(wrapper.className || "");
        const isUser = roleAttr === "user" || className.includes("justify-end") || wrapper.querySelector('[class*="send-msg-bubble"]');
        const content = firstMatch(wrapper, 'div[data-testid="message_text_content"], .md-box-root, .markdown-body, .message-content, .whitespace-pre-wrap') || wrapper;
        pushTurn(turns, isUser ? "user" : "assistant", content, wrapper);
      });
      return turns;
    }
  };
})();
