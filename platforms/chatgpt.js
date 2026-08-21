(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "chatgpt",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block
  };
})();
