(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "deepseek",
    findCodeBlocks: (root) => root.querySelectorAll(".md-code-block pre, pre"),
    getCodeElement: (block) => block,
    // DeepSeek rewrites <pre> children during syntax highlighting. Its outer
    // code-block wrapper is stable and keeps extension UI outside owned content.
    getMountTarget: (block) => block.closest(".md-code-block") || block.parentElement || block,
    getLanguageHint: (block) => {
      const wrapper = block.closest(".md-code-block");
      const banner = wrapper?.querySelector(".md-code-block-banner, .md-code-block-banner-wrap");
      return banner?.textContent || "";
    },
    extractConversation(root) {
      const { htmlToMarkdown, htmlForPreview, pushTurn } = globalThis.htmltoLinkMarkdown;
      const turns = [];
      const wrappers = root.querySelectorAll('.ds-message, [data-testid="chat_item"]');
      const nodes = wrappers.length ? wrappers : root.querySelectorAll(".ds-markdown.ds-markdown--block");
      nodes.forEach((wrapper) => {
        const markdownNodes = Array.from(wrapper.querySelectorAll(".ds-markdown, .markdown-body"))
          .filter((el) => (el.innerText || "").trim() && !el.closest(".ds-think-content"))
          .filter((el, _, all) => !all.some((other) => other !== el && other.contains(el)));
        const author = wrapper.getAttribute("data-message-author-role");
        const role = author === "user" ? "user" : (author === "assistant" || markdownNodes.length ? "assistant" : "user");
        if (markdownNodes.length) {
          const text = markdownNodes.map((el) => htmlToMarkdown(el)).filter(Boolean).join("\n\n");
          const html = markdownNodes.map((el) => htmlForPreview(el)).filter(Boolean).join("");
          if (text || html) turns.push({ role, text, html, wrapper });
          return;
        }
        pushTurn(turns, role, wrapper, wrapper);
      });
      return turns;
    }
  };
})();
