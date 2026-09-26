(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "yuanbao",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block,
    extractConversation(root) {
      const { htmlToMarkdown, htmlForPreview } = globalThis.htmltoLinkMarkdown;
      const turns = [];
      const outermost = (el, _, all) => !all.some((other) => other !== el && other.contains(el));
      const items = Array.from(root.querySelectorAll('[data-conv-speaker="human"], [data-conv-speaker="ai"], [class*="agent-chat__list__item--human"], [class*="agent-chat__list__item--ai"], [class*="agent-chat__list__item"]'))
        .filter((el) => {
          const cls = String(el.className || "");
          const speaker = el.getAttribute("data-conv-speaker") || "";
          return speaker === "human" || speaker === "ai" || cls.includes("--human") || cls.includes("--ai");
        })
        .filter(outermost);
      items.forEach((wrapper) => {
        const speaker = wrapper.getAttribute("data-conv-speaker") || "";
        const role = speaker === "human" || String(wrapper.className).includes("--human") ? "user" : "assistant";
        const nodes = Array.from(wrapper.querySelectorAll('[class*="hyc-content-md"], [class*="hyc-content-text"], [class*="hyc-common-markdown"], [class*="speech-text"], .markdown, .markdown-body'))
          .filter(outermost)
          .filter((el) => !el.closest("[class*='toolbar'], [class*='action']"));
        const targets = nodes.length ? nodes : [wrapper];
        const text = targets.map((el) => htmlToMarkdown(el)).filter(Boolean).join("\n\n");
        const html = targets.map((el) => htmlForPreview(el)).filter(Boolean).join("");
        if (text || html) turns.push({ role, text, html, wrapper });
      });
      return turns;
    }
  };
})();
