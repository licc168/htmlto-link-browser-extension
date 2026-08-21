(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "gemini",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block
  };
})();
