(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "tongyi",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block
  };
})();
