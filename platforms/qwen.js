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
    },
    extractConversation(root) {
      const { htmlToMarkdown, htmlForPreview, pushTurn } = globalThis.htmltoLinkMarkdown;
      const turns = [];
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
