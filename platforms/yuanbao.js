(function () {
  globalThis.htmltoLinkPlatformEngine = {
    id: "yuanbao",
    findCodeBlocks: (root) => root.querySelectorAll("pre"),
    getCodeElement: (block) => block.querySelector("code") || block,
    getMountTarget: (block) => block
  };
})();
