(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "gemini",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block,
    extractConversation(root) {
      const { pushTurn, firstMatch } = globalThis.htmltoLinkMarkdown;
      const turns = [];
      const userTag = root.querySelector("user-query") ? "user-query" : "user-input";
      root.querySelectorAll(`${userTag}, model-response`).forEach((wrapper) => {
        const tag = wrapper.tagName.toLowerCase();
        const role = tag === "model-response" ? "assistant" : "user";
        const content = firstMatch(wrapper, ".markdown, .message-content, message-content, .query-text, .query-text-line")
          || wrapper;
        pushTurn(turns, role, content, wrapper);
      });
      return turns;
    }
  };
})();
