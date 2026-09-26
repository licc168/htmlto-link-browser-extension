(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "grok",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block,
    extractConversation(root) {
      const { htmlToMarkdown, htmlForPreview } = globalThis.htmltoLinkMarkdown;
      const turns = [];
      const outermost = (el, _, all) => !all.some((other) => other !== el && other.contains(el));
      let items = Array.from(root.querySelectorAll('[id^="response-"]')).filter(outermost);
      if (!items.length) {
        items = Array.from(root.querySelectorAll('[data-testid="user-message"], [data-testid="assistant-message"]')).filter(outermost);
      }
      items.forEach((wrapper) => {
        const bubble = wrapper.matches?.("[data-testid='user-message'], [data-testid='assistant-message']")
          ? wrapper
          : wrapper.querySelector("[data-testid='user-message'], [data-testid='assistant-message']");
        const testId = bubble?.getAttribute("data-testid") || "";
        const rowClass = String(wrapper.className || "");
        const role = testId === "user-message" || rowClass.includes("items-end") ? "user" : "assistant";
        const scope = bubble || wrapper;
        const nodes = Array.from(scope.querySelectorAll(".response-content-markdown, .markdown, .markdown-body"))
          .filter((el) => !el.closest(".thinking-container, .action-buttons"))
          .filter(outermost);
        if (!nodes.length) return;
        const text = nodes.map((el) => htmlToMarkdown(el)).filter(Boolean).join("\n\n");
        const html = nodes.map((el) => htmlForPreview(el)).filter(Boolean).join("");
        if (text || html) turns.push({ role, text, html, wrapper });
      });
      return turns;
    }
  };
})();
