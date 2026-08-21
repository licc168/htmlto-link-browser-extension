(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "kimi",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block
  };
})();
