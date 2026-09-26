(function () {
  const UI_SELECTOR = "[data-htmlto-link-ui=\"true\"]";

function mathmlToLatex(node) {
  if (!node) return "";
  if (node.nodeType === 3) return node.textContent || "";
  if (!(node instanceof Element)) return "";
  const name = (node.localName || "").toLowerCase();
  if (name === "annotation") {
    return (node.getAttribute("encoding") || "").includes("tex") ? (node.textContent || "").trim() : "";
  }
  if (name === "semantics") {
    const tex = Array.from(node.children).find((child) => (child.localName || "").toLowerCase() === "annotation" && (child.getAttribute("encoding") || "").includes("tex"));
    if (tex?.textContent?.trim()) return tex.textContent.trim();
  }
  const children = Array.from(node.children).filter((child) => (child.localName || "").toLowerCase() !== "annotation");
  if (name === "mfrac") return `\\frac{${mathmlToLatex(children[0])}}{${mathmlToLatex(children[1])}}`;
  if (name === "msqrt") return `\\sqrt{${children.map((child) => mathmlToLatex(child)).join("")}}`;
  if (name === "msup") return `${mathmlToLatex(children[0])}^{${mathmlToLatex(children[1])}}`;
  if (name === "msub") return `${mathmlToLatex(children[0])}_{${mathmlToLatex(children[1])}}`;
  if (name === "msubsup") return `${mathmlToLatex(children[0])}_{${mathmlToLatex(children[1])}}^{${mathmlToLatex(children[2])}}`;
  if (name === "math" || name === "mrow" || name === "mstyle" || name === "mpadded") {
    return children.map((child) => mathmlToLatex(child)).join("");
  }
  if (name === "mi" || name === "mn" || name === "mo" || name === "mtext") return (node.textContent || "").trim();
  return children.map((child) => mathmlToLatex(child)).join("");
}

function texAnnotation(root) {
  const nodes = root.getElementsByTagName ? root.getElementsByTagName("*") : [];
  for (const node of nodes) {
    if ((node.localName || "").toLowerCase() !== "annotation") continue;
    const encoding = node.getAttribute("encoding") || "";
    const tex = (node.textContent || "").trim();
    if (tex && encoding.includes("tex")) return tex;
  }
  return "";
}

function katexNodeToTex(node) {
  if (!node) return "";
  if (node.nodeType === 3) return (node.textContent || "").replace(/\u200b/g, "");
  if (!(node instanceof Element)) return "";
  const cls = String(node.className || "");
  if (cls.includes("frac-line") || cls.includes("pstrut") || cls.includes("strut") || cls.includes("nulldelimiter") || cls.includes("mspace")) return "";
  if (cls.includes("mfrac")) {
    const frac = node;
    const rows = Array.from(frac.querySelectorAll(".vlist > span, [class~='vlist'] > span"))
      .filter((span) => !span.querySelector(".frac-line, [class*='frac-line']"))
      .map((span) => katexNodeToTex(span).replace(/\s+/g, ""))
      .filter(Boolean);
    if (rows.length >= 2) return `\\frac{${rows[rows.length - 1]}}{${rows[0]}}`;
  }
  if (cls.includes("msupsub")) return "";
  return Array.from(node.childNodes).map((child) => katexNodeToTex(child)).join("");
}

function readFormulaTex(el) {
  const annotated = texAnnotation(el);
  if (annotated) return annotated;
  if ((el.localName || "").toLowerCase() === "math") {
    const tex = mathmlToLatex(el).trim();
    if (tex && /\\[a-zA-Z]/.test(tex)) return tex;
  }
  const attrHost = el.matches?.("[data-latex], [data-formula], [data-tex]")
    ? el
    : el.querySelector?.("[data-latex], [data-formula], [data-tex]");
  const attr = attrHost?.getAttribute("data-latex") || attrHost?.getAttribute("data-formula") || attrHost?.getAttribute("data-tex");
  if (attr?.trim()) return attr.trim();
  const bases = el.querySelectorAll ? el.querySelectorAll(".base") : [];
  if (!bases.length) return "";
  return Array.from(bases).map((base) => katexNodeToTex(base)).join("").replace(/\u200b/g, "").trim();
}

function classText(el) {
  return el.getAttribute?.("class") || "";
}

function looksLikeTex(value) {
  const text = String(value || "").trim();
  return text.length > 0 && text.length < 4000 && /\\[a-zA-Z]+|[\^_]\{/.test(text);
}

function ownTex(el) {
  if (!(el instanceof Element)) return "";
  if (el.closest?.("pre, code")) return "";
  const onlyText = Array.from(el.childNodes).every((child) => child.nodeType === 3);
  if (!onlyText) return "";
  const text = (el.textContent || "").trim();
  return looksLikeTex(text) ? text : "";
}

function isDisplayFormula(el) {
  let node = el;
  while (node) {
    const cls = classText(node);
    const tag = (node.tagName || "").toLowerCase();
    if (/(^|\s)(katex-display|math-block|math-display|ds-markdown-math)(\s|$)/.test(cls)) return true;
    if (tag === "mjx-container" && (node.getAttribute("display") === "true" || node.getAttribute("display") === "block")) return true;
    if (node.getAttribute?.("display") === "block") return true;
    node = node.parentElement;
  }
  const tag = (el.tagName || "").toLowerCase();
  return tag === "div" || tag === "p" && el.childNodes.length <= 3;
}

function formulaRoot(el, root) {
  let host = el;
  let node = el;
  while (node && node !== root) {
    const cls = classText(node);
    const tag = (node.localName || "").toLowerCase();
    if (/(^|\s)(katex|katex-display|ds-markdown-math|math-inline|math-block|math-display)(\s|$)/.test(cls) || tag === "mjx-container") {
      host = node;
    }
    node = node.parentElement;
  }
  const parent = host.parentElement;
  if (parent && parent !== root && parent.children.length > 0 && parent.children.length <= 4) {
    const onlyFormula = Array.from(parent.children).every((child) => {
      const childCls = classText(child);
      const name = (child.localName || "").toLowerCase();
      return /katex|mathml|\bmath\b/.test(childCls) || name === "math" || name === "annotation" || Boolean(ownTex(child));
    });
    if (onlyFormula) host = parent;
  }
  return host;
}

function replaceFormulas(root) {
  const slots = [];
  const put = (el, tex, block) => {
    if (!tex || !el?.isConnected) return false;
    const token = `%%MATH${slots.length}%%`;
    slots.push(block ? `\n\n$$${tex}$$\n\n` : `$${tex}$`);
    el.replaceWith(document.createTextNode(token));
    return true;
  };
  const elements = [];
  const walk = (node) => {
    if (!(node instanceof Element)) return;
    elements.push(node);
    Array.from(node.childNodes).forEach((child) => walk(child));
  };
  walk(root);

  const sources = [];
  elements.forEach((el) => {
    const name = (el.localName || "").toLowerCase();
    const encoding = el.getAttribute("encoding") || "";
    const attr = el.getAttribute("data-latex") || el.getAttribute("data-formula") || el.getAttribute("data-tex") || "";
    const script = name === "script" && (el.getAttribute("type") || "").includes("math/tex");
    const tex = script || name === "annotation" || encoding.includes("tex")
      ? (el.textContent || "").trim()
      : (looksLikeTex(attr) ? attr.trim() : ownTex(el));
    if (!tex || !looksLikeTex(tex)) return;
    sources.push({ el, tex });
  });

  const used = new Set();
  sources.forEach(({ el, tex }) => {
    if (!el.isConnected) return;
    const host = formulaRoot(el, root);
    if (!(host instanceof Element) || used.has(host) || !host.isConnected) return;
    used.add(host);
    put(host, tex, isDisplayFormula(host));
  });

  // Drop whatever source layer is still attached, so it cannot be printed next to the visible glyphs.
  const leftovers = [];
  const walkLeft = (node) => {
    if (!(node instanceof Element) || !node.isConnected) return;
    leftovers.push(node);
    Array.from(node.childNodes).forEach((child) => walkLeft(child));
  };
  walkLeft(root);
  leftovers.forEach((el) => {
    if (!el.isConnected) return;
    const name = (el.localName || "").toLowerCase();
    const cls = classText(el);
    if (name === "math" || name === "semantics" || name === "annotation" || name === "mrow" || name === "mi" || name === "mo" || name === "mn" || name === "msup" || name === "msub" || name === "mfrac" || cls.includes("katex-mathml") || cls.includes("assistive-mml") || ownTex(el)) {
      el.remove();
    }
  });
  return slots;
}

function cloneWithShadow(node) {
  if (!(node instanceof Element)) return node.cloneNode(true);
  const clone = node.cloneNode(false);
  if (node.shadowRoot) {
    node.shadowRoot.childNodes.forEach((child) => clone.appendChild(cloneWithShadow(child)));
  }
  node.childNodes.forEach((child) => clone.appendChild(cloneWithShadow(child)));
  return clone;
}

function htmlToMarkdown(element) {
  if (!element) return "";
  const clone = cloneWithShadow(element);
  const mathSlots = replaceFormulas(clone);
  clone.querySelectorAll(`button, svg, style, script, ${UI_SELECTOR}, .ds-think-content, [role="button"]`).forEach((node) => node.remove());

  clone.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code") || pre;
    const lang = [...code.classList].find((cls) => cls.startsWith("language-"))?.replace("language-", "") || "";
    pre.replaceWith(document.createTextNode(`\n\n\`\`\`${lang}\n${(code.textContent || "").trim()}\n\`\`\`\n\n`));
  });

  clone.querySelectorAll("li").forEach((li) => {
    const marker = li.parentElement?.tagName === "OL" ? "1. " : "* ";
    li.replaceWith(document.createTextNode(`${marker}${li.textContent.trim()}\n`));
  });

  let markdown = clone.innerHTML;
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n");
  markdown = markdown.replace(/<\/h[1-6]>/gi, "\n\n");
  markdown = markdown.replace(/<\/p>/gi, "\n\n");
  markdown = markdown.replace(/<hr[^>]*>/gi, "\n\n---\n\n");
  markdown = markdown.replace(/<h1[^>]*>/gi, "# ");
  markdown = markdown.replace(/<h2[^>]*>/gi, "## ");
  markdown = markdown.replace(/<h3[^>]*>/gi, "### ");
  markdown = markdown.replace(/<h4[^>]*>/gi, "#### ");
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/gis, "**$1**");
  markdown = markdown.replace(/<b>(.*?)<\/b>/gis, "**$1**");
  markdown = markdown.replace(/<em>(.*?)<\/em>/gis, "*$1*");
  markdown = markdown.replace(/<i>(.*?)<\/i>/gis, "*$1*");
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gis, "`$1`");
  markdown = markdown.replace(/<a href="(.*?)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = markdown;
  return (tempDiv.textContent || "")
    .replace(/%%MATH(\d+)%%/g, (_, index) => mathSlots[Number(index)] || "")
    .replace(/(\n\s*){3,}/g, "\n\n")
    .trim();
}

function htmlForPreview(element) {
  if (!(element instanceof Element)) return "";
  const clone = cloneWithShadow(element);
  clone.querySelectorAll(".htmlto-link-check, [data-htmlto-link-ui='true'], input[type='checkbox']").forEach((node) => node.remove());
  clone.querySelectorAll([
    "button",
    "style",
    "script",
    UI_SELECTOR,
    ".ds-think-content",
    "[role='button']",
    "[class*='download']",
    "[class*='Download']",
    "[class*='action-row']",
    "[class*='action-bar']",
    "[class*='toolbar']",
    "[class*='feedback']",
    "[class*='simple-button']",
    "[aria-label*='下载']",
    "[aria-label*='复制']",
    "[aria-label*='分享']",
    "[aria-label*='重新']",
    "[aria-label*='点赞']",
    "[aria-label*='喜欢']",
    "[aria-label*='编辑']",
    "[title*='下载']",
    "[title*='复制']",
    "[title*='分享']",
    "[title*='重新生成']"
  ].join(",")).forEach((node) => node.remove());
  clone.querySelectorAll("div, span").forEach((node) => {
    if (!node.isConnected || node.closest(".katex, .katex-display, pre, table")) return;
    const text = (node.innerText || "").replace(/\s/g, "");
    if (text || !node.querySelector("svg")) return;
    node.remove();
  });
  // The TeX source sits beside the visible KaTeX HTML. Keep only the visible layer.
  clone.querySelectorAll(".katex-mathml, mjx-assistive-mml, annotation, math").forEach((node) => node.remove());
  return clone.innerHTML;
}

function pushTurn(turns, role, contentEl, wrapper) {
  if (role !== "user" && role !== "assistant" || !(contentEl instanceof Element)) return;
  const text = htmlToMarkdown(contentEl);
  const html = htmlForPreview(contentEl);
  if (text || html) turns.push({ role, text, html, wrapper: wrapper || contentEl });
}

function firstMatch(wrapper, selector) {
  return wrapper.querySelector(selector);
}

  globalThis.htmltoLinkMarkdown = { htmlToMarkdown, htmlForPreview, pushTurn, firstMatch };
})();
