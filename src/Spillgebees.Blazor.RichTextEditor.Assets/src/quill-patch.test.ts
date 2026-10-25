import Quill from "quill";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// These tests run against the real Quill, including our pnpm patch in `patches/quill@2.0.3.patch`.
// They cover CVE-2025-15056 / GHSA-v3m3-f69x-jf25, which upstream has not fixed.

type KatexStub = { render: (value: string, node: HTMLElement) => void };

const createEditor = (theme?: string): Quill => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return new Quill(container, { theme });
};

const parseHtml = (html: string): HTMLElement => {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
};

describe("patched quill", () => {
  beforeEach(() => {
    (window as unknown as { katex: KatexStub }).katex = {
      render: (value, node) => {
        node.textContent = value;
      },
    };
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete (window as unknown as { katex?: KatexStub }).katex;
  });

  it("should report a patched version so scanners don't match stock 2.0.3", () => {
    // assert
    expect(Quill.version).toBe("2.0.3-spillgebees.1");
  });

  it("should escape markup in formula embeds when exporting semantic HTML", () => {
    // arrange
    const quill = createEditor();
    const payload = "</span><img src=x onerror=alert(1)>";

    // act
    quill.insertEmbed(0, "formula", payload, "api");
    const html = quill.getSemanticHTML();

    // assert
    const exported = parseHtml(html);
    expect(exported.querySelector("img")).toBeNull();
    expect(exported.querySelector("span")?.textContent).toBe(payload);
  });

  it("should escape quotes in video embeds when exporting semantic HTML", () => {
    // arrange
    const quill = createEditor();
    // biome-ignore lint/security/noSecrets: false positive
    const payload = 'https://example.com/" onmouseover="alert(1)';

    // act
    quill.insertEmbed(0, "video", payload, "api");
    const html = quill.getSemanticHTML();

    // assert
    const anchor = parseHtml(html).querySelector("a");
    expect(anchor).not.toBeNull();
    expect(anchor?.hasAttribute("onmouseover")).toBe(false);
    expect(anchor?.getAttribute("href")).toBe(payload);
    expect(anchor?.textContent).toBe(payload);
  });

  it("should sanitize dangerous protocols in video embeds when exporting semantic HTML", () => {
    // arrange
    const quill = createEditor();
    quill.insertEmbed(0, "video", "https://example.com/video", "api");

    // act
    quill.root.querySelector("iframe")?.setAttribute("src", "javascript:alert(1)");
    const html = quill.getSemanticHTML();

    // assert
    const anchor = parseHtml(html).querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("about:blank");
  });

  it("should keep plain formula and video values unchanged", () => {
    // arrange
    const quill = createEditor();

    // act
    quill.insertEmbed(0, "formula", "E=mc^2", "api");
    quill.insertEmbed(1, "video", "https://example.com/video", "api");
    const html = quill.getSemanticHTML();

    // assert
    const exported = parseHtml(html);
    expect(exported.querySelector("span")?.textContent).toBe("E=mc^2");
    expect(exported.querySelector("a")?.getAttribute("href")).toBe("https://example.com/video");
  });

  it("should sanitize the snow tooltip link preview", () => {
    // arrange
    // jsdom doesn't implement Range layout, which the tooltip needs to position itself
    Range.prototype.getBoundingClientRect = () => new DOMRect();
    const quill = createEditor("snow");
    quill.setText("link\n", "api");
    quill.formatText(0, 4, "link", "https://example.com", "api");
    quill.root.querySelector("a")?.setAttribute("href", "javascript:alert(1)");

    // act
    quill.setSelection(2, 0, "user");

    // assert
    const preview = quill.container.querySelector<HTMLAnchorElement>(".ql-tooltip a.ql-preview");
    expect(preview?.getAttribute("href")).toBe("about:blank");
  });
});
