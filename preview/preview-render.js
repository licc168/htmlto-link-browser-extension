// Renders conversation Markdown with the same math protection as html2url.
(function (root) {
  const api = root.htmltoLinkMarked || root.marked || {};
  const parse = api.parse;
  const Renderer = api.Renderer;
  if (typeof parse !== "function" || typeof Renderer !== "function") {
    console.warn("[htmlto.link] marked is unavailable; preview cannot render.");
    return;
  }

  const TEMPLATE_META = {
    memo: { cardClass: "card-memo", cssFile: "memo.css" },
    popart: { cardClass: "card-popart", cssFile: "popart.css" },
    traditionalchinese: { cardClass: "card-traditionalchinese", cssFile: "traditionalchinese.css" },
    coilnotebook: { cardClass: "card-coilnotebook", cssFile: "coilnotebook.css", extraClasses: ["is-long-content"] },
    purpleticket: { cardClass: "card-purpleticket", cssFile: "purpleticket.css" },
    bytedance: { cardClass: "card-bytedance", cssFile: "byteDance.css" },
    warm: { cardClass: "card-warm", cssFile: "warm.css" },
    alibaba: { cardClass: "card-alibaba", cssFile: "alibaba.css" },
    notebook: { cardClass: "card-notebook", cssFile: "notebook.css" },
    darktech: { cardClass: "card-darktech", cssFile: "darktech.css" },
    fairytale: { cardClass: "card-fairytale", cssFile: "fairytale.css" },
    boardgamestyle: { cardClass: "card-boardgame", cssFile: "boardgamestyle.css" },
    cyberpunk: { cardClass: "card-cyberpunk", cssFile: "cyberpunk.css" },
    glassmorphism: { cardClass: "card-glassmorphism", cssFile: "glassmorphism.css" },
    neonglow: { cardClass: "card-neonglow", cssFile: "neonGlow.css" },
    vintagenewspaper: { cardClass: "card-vintagenewspaper", cssFile: "vintagenewspaper.css" },
    handwrittennote: { cardClass: "card-handwrittennote", cssFile: "handwrittennote.css" },
    vintagemap: { cardClass: "card-vintagemap", cssFile: "vintagemap.css" },
    blueprint: { cardClass: "card-blueprint", cssFile: "blueprint.css" },
    botanical: { cardClass: "card-botanical", cssFile: "botanical.css" },
    sketch: { cardClass: "card-sketch", cssFile: "sketch.css" },
    terminal: { cardClass: "card-terminal", cssFile: "terminal.css" },
    retro: { cardClass: "card-retro", cssFile: "retro.css" },
    ayulight: { cardClass: "card-ayulight", cssFile: "ayulight.css" },
    bauhaus: { cardClass: "card-bauhaus", cssFile: "bauhaus.css" },
    greensimple: { cardClass: "card-greensimple", cssFile: "greensimple.css" },
    maximalism: { cardClass: "card-maximalism", cssFile: "maximalism.css" },
    neobrutalism: { cardClass: "card-neobrutalism", cssFile: "neobrutalism.css" },
    newsprint: { cardClass: "card-newsprint", cssFile: "newsprint.css" },
    organic: { cardClass: "card-organic", cssFile: "organic.css" },
    playfulgeometric: { cardClass: "card-playfulgeometric", cssFile: "playfulgeometric.css" },
    professional: { cardClass: "card-professional", cssFile: "professional.css" },
    plain: { cardClass: "card-plain", cssFile: "plain.css" }
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeMathAttr(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function decodeHtmlEntities(value) {
    return String(value || "")
      .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
      .replace(/&quot;/g, "\"")
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  function headingLabel(renderedInlineHtml) {
    return decodeHtmlEntities(String(renderedInlineHtml || "").replace(/<[^>]*>/g, "")).trim();
  }

  function headingId(label, index, usedIds) {
    const baseId = label
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .trim()
      .replace(/[\s_]+/g, "-") || `section-${index + 1}`;
    const duplicateIndex = usedIds.get(baseId) || 0;
    usedIds.set(baseId, duplicateIndex + 1);
    return duplicateIndex === 0 ? baseId : `${baseId}-${duplicateIndex + 1}`;
  }

  function mathToken(index) {
    return `HTML2URLMATH${index}END`;
  }

  function protectMarkdownMath(markdown) {
    const slots = [];
    const take = (tex, block) => {
      const token = mathToken(slots.length);
      slots.push({ tex: String(tex || "").trim(), block });
      return token;
    };
    const protectedMarkdown = String(markdown || "")
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => take(tex, true))
      .replace(/\\\[([\s\S]+?)\\\]/g, (_, tex) => take(tex, true))
      .replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => take(tex, false))
      .replace(/(^|[^\\$])\$(?!\$)((?:\\.|[^$\n])+?)\$(?!\$)/g, (_, prefix, tex) => `${prefix}${take(tex, false)}`);
    return { markdown: protectedMarkdown, slots };
  }

  function mathFormulaNode(tex, block) {
    const formula = escapeMathAttr(String(tex || "").trim());
    const type = block ? "math-block" : "math-inline";
    return `<span class="${type}" data-type="${type}" data-formula="${formula}"></span>`;
  }

  function restoreMarkdownMath(html, slots) {
    return String(html || "").replace(/HTML2URLMATH(\d+)END/g, (_, index) => {
      const slot = slots[Number(index)];
      return slot ? mathFormulaNode(slot.tex, slot.block) : "";
    });
  }

  function normalizeMarkdownForRendering(markdown) {
    let fenceCharacter = "";
    let fenceLength = 0;
    return String(markdown || "")
      .split(/(\r?\n)/)
      .map((part) => {
        if (/^\r?\n$/.test(part)) return part;
        const fence = part.match(/^[ \t]*(`{3,}|~{3,})/);
        if (fence) {
          const marker = fence[1];
          if (!fenceCharacter) {
            fenceCharacter = marker[0];
            fenceLength = marker.length;
          } else if (marker[0] === fenceCharacter && marker.length >= fenceLength) {
            fenceCharacter = "";
            fenceLength = 0;
          }
          return part;
        }
        if (fenceCharacter) return part;
        return part.replace(/(\*\*[^*\r\n]+\*\*)(?=[\p{L}\p{N}])/gu, "$1 ");
      })
      .join("");
  }

  function renderMarkdown(markdown) {
    const headings = [];
    const usedIds = new Map();
    const renderer = new Renderer();
    renderer.heading = function heading({ tokens, depth }) {
      const renderedInlineHtml = this.parser.parseInline(tokens);
      const label = headingLabel(renderedInlineHtml);
      const id = headingId(label, headings.length, usedIds);
      headings.push({ depth, id, label });
      return `<h${depth} id="${escapeHtml(id)}" class="markdown-heading">${renderedInlineHtml}</h${depth}>\n`;
    };
    renderer.list = function list({ ordered, start, items }) {
      const tagName = ordered ? "ol" : "ul";
      const startIndex = ordered && typeof start === "number" && Number.isFinite(start) ? start : 1;
      const startAttribute = ordered && startIndex !== 1 ? ` start="${startIndex}"` : "";
      const body = items.map((item, index) => {
        const renderedItem = this.listitem(item);
        if (!ordered) return renderedItem;
        return renderedItem.replace(/^<li>/, `<li data-index="${startIndex + index}">`);
      }).join("");
      return `<${tagName}${startAttribute}>\n${body}</${tagName}>\n`;
    };
    renderer.code = function code({ text, lang }) {
      const language = escapeHtml(lang || "");
      return `<pre><code class="language-${language}">${escapeHtml(text)}</code></pre>\n`;
    };

    const prepared = protectMarkdownMath(normalizeMarkdownForRendering(markdown));
    let html = restoreMarkdownMath(parse(prepared.markdown, { gfm: true, breaks: true, renderer }), prepared.slots);
    html = html.replace(/(<table[^>]*>)/gi, '<div class="markdown-table-wrapper">$1');
    html = html.replace(/<\/table>/gi, "</table></div>");
    return { html, headings: headings.filter(({ depth, label }) => depth <= 4 && label) };
  }

  root.htmltoLinkPreview = {
    TEMPLATE_META,
    renderMarkdown
  };
})(globalThis);
