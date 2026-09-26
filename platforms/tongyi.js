(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "tongyi",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block,
    extractConversation(root) {
      const turns = [];
      const { htmlToMarkdown, htmlForPreview, pushTurn } = globalThis.htmltoLinkMarkdown;
      const outermost = (el, _, all) => !all.some((other) => other !== el && other.contains(el));
      root.querySelectorAll('[class*="chat-question-card-wrap"], [class*="chat-answers-card-wrap"]').forEach((wrapper) => {
        const role = wrapper.className.includes("chat-question-card-wrap") ? "user" : "assistant";
        const selector = role === "user"
          ? '[class*="question-text-card"]'
          : '[class*="answer-common-card"], [class*="qk-markdown"], .markdown-body';
        let nodes = Array.from(wrapper.querySelectorAll(selector)).filter(outermost);
        const fullCard = nodes.find((el) => el.className.includes("answer-common-card"));
        if (fullCard) nodes = [fullCard];
        nodes = nodes.filter((el) => !el.closest('[class*="think"]'));
        if (!nodes.length) {
          pushTurn(turns, role, wrapper, wrapper);
          return;
        }
        const text = nodes.map((el) => htmlToMarkdown(el)).filter(Boolean).join("\n\n");
        const html = nodes.map((el) => htmlForPreview(el)).filter(Boolean).join("");
        if (text || html) turns.push({ role, text, html, wrapper });
      });
      return turns;
    }
  };
})();
