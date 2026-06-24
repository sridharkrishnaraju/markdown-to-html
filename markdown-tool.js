/**
 * <markdown-tool> — convert Markdown to clean HTML, with a live preview. Zero dependencies.
 * Built & maintained by SGBP — Singapore Build Partners (https://sgbp.tech). MIT.
 */
class MarkdownTool extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  connectedCallback() { this.render(); }
  _esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  _inline(s) {
    return s
      .replace(/`([^`]+)`/g, (_, c) => `<code>${this._esc(c)}</code>`)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>");
  }
  _toHtml(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    const out = []; let i = 0;
    const flushList = (tag, items) => { out.push(`<${tag}>`); items.forEach((it) => out.push(`<li>${this._inline(it)}</li>`)); out.push(`</${tag}>`); };
    while (i < lines.length) {
      let line = lines[i];
      // fenced code block
      if (/^```/.test(line)) {
        const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; out.push(`<pre><code>${this._esc(buf.join("\n"))}</code></pre>`); continue;
      }
      // heading
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { const n = h[1].length; out.push(`<h${n}>${this._inline(h[2])}</h${n}>`); i++; continue; }
      // hr
      if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
      // blockquote
      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
        out.push(`<blockquote>${this._inline(buf.join(" "))}</blockquote>`); continue;
      }
      // unordered list
      if (/^\s*[-*+]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*+]\s+/, "")); i++; }
        flushList("ul", items); continue;
      }
      // ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, "")); i++; }
        flushList("ol", items); continue;
      }
      // blank
      if (/^\s*$/.test(line)) { i++; continue; }
      // paragraph (gather until blank)
      const buf = [line]; i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|>\s?|\s*[-*+]\s|\s*\d+\.\s|```)/.test(lines[i])) { buf.push(lines[i]); i++; }
      out.push(`<p>${this._inline(buf.join(" "))}</p>`);
    }
    return out.join("\n");
  }
  _run() {
    const $ = (s) => this.shadowRoot.querySelector(s);
    const md = $("#in").value;
    if (!md.trim()) { $("#out").value = ""; $("#preview").innerHTML = ""; return; }
    const html = this._toHtml(md);
    $("#out").value = html;
    $("#preview").innerHTML = html;
  }
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        *,*::before,*::after{box-sizing:border-box}
        :host{display:block;width:100%;max-width:680px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
        .card{border:1px solid #e2e2e2;border-radius:12px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.06);padding:16px}
        label{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:600;color:#555;margin-bottom:6px}
        .mini{font:inherit;font-size:11px;font-weight:700;color:#EB0028;background:none;border:0;cursor:pointer}
        textarea{width:100%;min-height:130px;padding:10px;border:1px solid #ccc;border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:14px;line-height:1.5;resize:vertical}
        .tabs{display:flex;gap:6px;margin:14px 0 8px}
        .tab{font:inherit;font-size:12px;font-weight:700;padding:6px 12px;border:1px solid #ddd;border-radius:8px;background:#fff;color:#555;cursor:pointer}
        .tab.on{background:#EB0028;color:#fff;border-color:#EB0028}
        .pane{display:none}
        .pane.on{display:block}
        #out{min-height:120px;background:#1a1a1a;color:#f4f4f4;font-size:12.5px}
        .preview{border:1px solid #eee;border-radius:8px;padding:12px 16px;background:#fafafa;font-size:14px;line-height:1.6;overflow-x:auto}
        .preview h1,.preview h2,.preview h3{margin:.6em 0 .3em}
        .preview pre{background:#1a1a1a;color:#f4f4f4;padding:10px 12px;border-radius:6px;overflow-x:auto}
        .preview code{font-family:ui-monospace,monospace;font-size:.9em}
        .preview blockquote{border-left:3px solid #EB0028;margin:.5em 0;padding:.2em 0 .2em 12px;color:#555}
        .preview a{color:#EB0028}
        .preview img{max-width:100%;height:auto}
        .row{display:flex;gap:8px;margin-top:10px}
        .copy{font:inherit;font-size:12px;font-weight:700;color:#fff;background:#EB0028;border:0;border-radius:8px;padding:9px 14px;cursor:pointer}
      </style>
      <div class="card">
        <label>Markdown <button class="mini" id="clear">Clear</button></label>
        <textarea id="in" placeholder="# Hello&#10;&#10;Some **bold** and a [link](https://sgbp.tech)." spellcheck="false"></textarea>
        <div class="tabs">
          <button class="tab on" id="t-html" data-p="html">HTML</button>
          <button class="tab" id="t-prev" data-p="prev">Preview</button>
        </div>
        <div class="pane on" id="p-html"><textarea id="out" readonly></textarea>
          <div class="row"><button class="copy" id="copy">Copy HTML</button></div></div>
        <div class="pane" id="p-prev"><div class="preview" id="preview"></div></div>
      </div>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    $("#in").addEventListener("input", () => this._run());
    $("#clear").addEventListener("click", () => { $("#in").value = ""; this._run(); $("#in").focus(); });
    $("#copy").addEventListener("click", () => { navigator.clipboard && navigator.clipboard.writeText($("#out").value); const b = $("#copy"), o = b.textContent; b.textContent = "Copied"; setTimeout(() => b.textContent = o, 900); });
    this.shadowRoot.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
      this.shadowRoot.querySelectorAll(".tab").forEach((x) => x.classList.toggle("on", x === t));
      $("#p-html").classList.toggle("on", t.dataset.p === "html");
      $("#p-prev").classList.toggle("on", t.dataset.p === "prev");
    }));
  }
}
if (!customElements.get("markdown-tool")) customElements.define("markdown-tool", MarkdownTool);
