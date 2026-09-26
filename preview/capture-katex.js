(function (root) {
  const fromGlobal = root.katex && typeof root.katex.render === "function" ? root.katex : null;
  const fromModule = typeof module !== "undefined" && module.exports && typeof module.exports.render === "function"
    ? module.exports
    : null;
  const api = fromGlobal || fromModule;
  if (api) root.htmltoLinkKatex = api;
})(globalThis);
