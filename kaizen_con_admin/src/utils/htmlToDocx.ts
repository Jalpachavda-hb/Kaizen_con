import JSZip from 'jszip';
import { BASE_DOCX_B64 } from './docxTemplate';

export const isDocxFile = (file: File | null): boolean => {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return name.endsWith('.docx') || name.endsWith('.doc');
};

export const isHtmlFile = (file: File | null): boolean => {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return name.endsWith('.html') || name.endsWith('.htm');
};

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Traverses DOM nodes and generates OpenXML <w:p> paragraphs and <w:r> runs.
 */
function domToOpenXml(node: Node, options: { bold?: boolean; italic?: boolean; underline?: boolean } = {}): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (!text) return '';
    let rPr = '';
    if (options.bold) rPr += '<w:b/>';
    if (options.italic) rPr += '<w:i/>';
    if (options.underline) rPr += '<w:u w:val="single"/>';
    const rPrTag = rPr ? `<w:rPr>${rPr}</w:rPr>` : '';
    return `<w:r>${rPrTag}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (tag === 'br') {
    return '<w:r><w:br/></w:r>';
  }

  const isBold = options.bold || tag === 'b' || tag === 'strong' || el.style.fontWeight === 'bold';
  const isItalic = options.italic || tag === 'i' || tag === 'em' || el.style.fontStyle === 'italic';
  const isUnderline = options.underline || tag === 'u' || tag === 'ins';

  // For links, append the href if text doesn't already contain it
  if (tag === 'a') {
    const href = el.getAttribute('href');
    const childXml = Array.from(el.childNodes)
      .map((c) => domToOpenXml(c, { bold: isBold, italic: isItalic, underline: true }))
      .join('');
    if (href && !el.textContent?.includes(href) && !href.startsWith('mailto:') && !href.startsWith('#')) {
      return `${childXml}<w:r><w:t xml:space="preserve"> (${escapeXml(href)})</w:t></w:r>`;
    }
    return childXml;
  }

  return Array.from(el.childNodes)
    .map((c) => domToOpenXml(c, { bold: isBold, italic: isItalic, underline: isUnderline }))
    .join('');
}

/**
 * Convert HTML string into an array of OpenXML <w:p> elements.
 */
function htmlToOpenXmlParagraphs(html: string): string {
  if (!html || !html.trim()) {
    return '<w:p><w:r><w:t></w:t></w:r></w:p>';
  }

  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Strip non-visual elements
      const scripts = doc.querySelectorAll('script, style, meta, head, link, noscript, xml');
      scripts.forEach((s) => s.remove());

      const paragraphs: string[] = [];
      const body = doc.body;

      // Extract block-level elements or walk body
      const blockElements = body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote, div, tr');

      if (blockElements.length > 0) {
        // Collect blocks that don't have block parents (to prevent duplicate nested paragraphs)
        const topBlocks: Element[] = [];
        blockElements.forEach((el) => {
          const parentBlock = el.parentElement?.closest('h1, h2, h3, h4, h5, h6, p, li, blockquote, tr');
          if (!parentBlock) {
            topBlocks.push(el);
          }
        });

        const targetList = topBlocks.length > 0 ? topBlocks : Array.from(blockElements);

        targetList.forEach((el, index) => {
          const tag = el.tagName.toLowerCase();
          const runs = domToOpenXml(el);
          const plainText = (el.textContent || '').trim();

          // Skip completely empty blocks unless it's a line break
          if (!plainText && !runs.includes('<w:br/>')) return;

          let pPr = '';
          if (tag === 'h1' || index === 0) {
            pPr = '<w:pPr><w:pStyle w:val="Title"/></w:pPr>';
          } else if (tag === 'h2' || tag === 'h3') {
            pPr = '<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>';
          } else if (tag === 'li') {
            pPr = '<w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>';
          }

          paragraphs.push(`<w:p>${pPr}${runs}</w:p>`);
        });
      }

      if (paragraphs.length > 0) {
        return paragraphs.join('\n');
      }

      // If no blocks identified, use full body text
      const bodyText = (body.textContent || '').trim();
      if (bodyText) {
        return bodyText
          .split(/\r?\n+/)
          .filter((line) => line.trim())
          .map((line, idx) => {
            const pPr = idx === 0 ? '<w:pPr><w:pStyle w:val="Title"/></w:pPr>' : '';
            return `<w:p>${pPr}<w:r><w:t xml:space="preserve">${escapeXml(line.trim())}</w:t></w:r></w:p>`;
          })
          .join('\n');
      }
    } catch (e) {
      console.warn('DOMParser failed in htmlToOpenXmlParagraphs, falling back to regex:', e);
    }
  }

  // Regex fallback
  const clean = html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<html[^>]*>[\s\S]*?<body[^>]*>/gi, '')
    .replace(/<\/body>[\s\S]*?<\/html>/gi, '');

  const blocks = clean
    .split(/<\/(?:p|h1|h2|h3|h4|h5|h6|div|tr|li|blockquote)>/i)
    .map((b) => b.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    const raw = clean.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (raw) blocks.push(raw);
  }

  return blocks
    .map((text, idx) => {
      const pPr = idx === 0 ? '<w:pPr><w:pStyle w:val="Title"/></w:pPr>' : '';
      return `<w:p>${pPr}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
    })
    .join('\n');
}

/**
 * Builds a valid Microsoft Word (.docx) document from HTML content.
 * Compatible with python-docx and FastAPI's template ingestion.
 */
export async function convertHtmlToDocxBlob(html: string): Promise<Blob> {
  const zip = await JSZip.loadAsync(BASE_DOCX_B64, { base64: true });
  const paragraphs = htmlToOpenXmlParagraphs(html);

  const documentXml = `<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${paragraphs}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1800" w:bottom="1440" w:left="1800"/></w:sectPr>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  });
}

