(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "yiyan",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block
  };
})();
