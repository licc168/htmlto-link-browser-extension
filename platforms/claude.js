(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "claude",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block
  };
})();
