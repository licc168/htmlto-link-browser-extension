(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "claude",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block,
    extractConversation(root) {
      const { pushTurn } = globalThis.htmltoLinkMarkdown;
      const turns = [];
      root.querySelectorAll('[data-testid="user-message"], .font-claude-response').forEach((wrapper) => {
        const role = wrapper.getAttribute("data-testid") === "user-message" ? "user" : "assistant";
        pushTurn(turns, role, wrapper.querySelector(".standard-markdown, .markdown") || wrapper, wrapper);
      });
      return turns;
    }
  };
})();
