(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "chatgpt",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    // The card pre wraps a second highlighter pre. Mount on the outer one so the
    // button sits in the language header instead of on the inner scroller.
    getMountTarget: (block) => {
      let top = block;
      let parent = block.parentElement?.closest("pre");
      while (parent) {
        top = parent;
        parent = parent.parentElement?.closest("pre");
      }
      return top;
    },
    extractConversation(root) {
      const { htmlToMarkdown } = globalThis.htmltoLinkMarkdown;
      const turns = [];
      root.querySelectorAll("div[data-message-author-role]").forEach((wrapper) => {
        const author = wrapper.getAttribute("data-message-author-role");
        const role = author === "user" ? "user" : author === "assistant" ? "assistant" : "";
        if (!role) return;
        const content = wrapper.querySelector(".markdown, [class*='markdown'], .prose, .message-content") || wrapper;
        turns.push({ role, text: htmlToMarkdown(content), wrapper });
      });
      return turns;
    },
    // ChatGPT 页面上的公式是排版后的 DOM。复制和发布改用它自己的对话原文。
    async readNativeConversation(domTurns) {
      const response = await chrome.runtime.sendMessage({ type: "READ_CHATGPT_NATIVE" });
      const native = response?.turns;
      if (!native?.length || native.length !== domTurns?.length) return null;
      const gotSource = native.some((turn) => turn.markdown);
      if (!gotSource) return null;
      return domTurns.map((turn, index) => {
        const markdown = native[index]?.markdown;
        if (!markdown) return turn;
        return { ...turn, markdown, text: markdown };
      });
    }
  };
})();
