(function (root) {
  const value = root.marked || (typeof module !== "undefined" ? module.exports : null);
  const api = value && typeof value.parse === "function" ? value : value?.marked;
  if (api && typeof api.parse === "function" && typeof api.Renderer === "function") {
    root.htmltoLinkMarked = api;
  }
})(globalThis);
