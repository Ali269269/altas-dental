import DOMPurify from "isomorphic-dompurify";

export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "a", "img", "span", "div", "hr", "sub", "sup",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt", "class", "style", "width", "height"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}
