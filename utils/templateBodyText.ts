import type { EmailTemplate } from "@/utils/subscribersData";

export function htmlToPlainText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*/gi, "\n\n")
    .replace(/<\/div>\s*/gi, "\n")
    .replace(/<strong>/gi, "")
    .replace(/<\/strong>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function templateBodyForDisplay(tpl: Pick<EmailTemplate, "body" | "bodyPlain" | "displayBody">): string {
  if (tpl.displayBody?.trim()) return tpl.displayBody.trim();
  if (tpl.bodyPlain?.trim()) return tpl.bodyPlain.trim();
  return htmlToPlainText(tpl.body);
}
