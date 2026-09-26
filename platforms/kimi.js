(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "kimi",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block,
    extractConversation(root) {
      const { htmlToMarkdown, htmlForPreview } = globalThis.htmltoLinkMarkdown;
      const turns = [];
      const visible = (el) => {
        const cls = String(el.className || "");
        if (/action-row|simple-button|think|reasoning|tool-call|system-prompt/.test(cls)) return false;
        const style = getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      };
      const outermost = (el, _, all) => !all.some((other) => other !== el && other.contains(el));
      const pick = (wrapper, selectors) => {
        for (const selector of selectors) {
          const nodes = Array.from(wrapper.querySelectorAll(selector)).filter(outermost).filter(visible);
          if (nodes.length) return nodes;
        }
        return [];
      };
      const items = Array.from(root.querySelectorAll(".chat-content-item-user, .chat-content-item-assistant, [class*='chat-content-item-user'], [class*='chat-content-item-assistant']"))
        .filter(outermost);
      items.forEach((wrapper) => {
        const isUser = String(wrapper.className).includes("chat-content-item-user");
        const nodes = isUser
          ? pick(wrapper, [".user-content", "[class*='user-content']"])
          : pick(wrapper, [".markdown", ".markdown-body", ".segment-content .markdown", "[class*='segment-content'] .markdown", ".segment-content"]);
        if (!nodes.length) return;
        const text = nodes.map((el) => htmlToMarkdown(el)).filter(Boolean).join("\n\n");
        const html = nodes.map((el) => htmlForPreview(el)).filter(Boolean).join("");
        if (text || html) turns.push({ role: isUser ? "user" : "assistant", text, html, wrapper });
      });
      return turns;
    }
  };
})();
