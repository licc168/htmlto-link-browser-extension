(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "v0",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block
  };
})();
