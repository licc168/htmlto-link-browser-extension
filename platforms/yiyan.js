(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "yiyan",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block,
    extractConversation(root) {
      const { htmlToMarkdown, htmlForPreview } = globalThis.htmltoLinkMarkdown;
      const turns = [];
      const outermost = (el, _, all) => !all.some((other) => other !== el && other.contains(el));
      const push = (wrapper, role) => {
        if (!wrapper || role !== "user" && role !== "assistant") return;
        const nodes = Array.from(wrapper.querySelectorAll(".custom-html, .markdown, .markdown-body, [class*='message-content']")).filter(outermost);
        const targets = nodes.length && wrapper.matches(".custom-html, .markdown, .markdown-body") ? [wrapper] : (nodes.length ? nodes : [wrapper]);
        const text = targets.map((el) => htmlToMarkdown(el)).filter(Boolean).join("\n\n");
        const html = targets.map((el) => htmlForPreview(el)).filter(Boolean).join("");
        if (text || html) turns.push({ role, text, html, wrapper });
      };
      const questions = Array.from(root.querySelectorAll("[class*='question-text'], [class*='question-box'], [class*='question-container'], [class*='user-message']")).filter(outermost);
      const answers = Array.from(root.querySelectorAll(".custom-html, [class*='answer-content'], [class*='answer-box'], [class*='bot-message'], [class*='robot-message']")).filter(outermost);
      questions.forEach((el) => push(el, "user"));
      answers.forEach((el) => {
        if (el.closest("[class*='question-text'], [class*='question-box'], [class*='user-message']")) return;
        push(el, "assistant");
      });
      return turns;
    }
  };
})();
