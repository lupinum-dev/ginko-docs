import { defineEventHandler, getQuery, setHeader } from "h3";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return entities[character] ?? character;
  });
}

function wrapText(value: string, length: number, maxLines: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= length || !line) {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const site = escapeXml(String(query.site || "Ginko Docs").slice(0, 80));
  const titleLines = wrapText(String(query.title || "Documentation"), 32, 2).map(escapeXml);
  const descriptionLines = wrapText(String(query.description || ""), 72, 2).map(escapeXml);

  setHeader(event, "content-type", "image/svg+xml; charset=utf-8");
  setHeader(event, "cache-control", "public, max-age=86400, stale-while-revalidate=604800");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${titleLines.join(" ")}">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="64" y="64" width="1072" height="502" rx="24" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="112" cy="116" r="16" fill="#2563eb"/>
  <text x="144" y="126" fill="#0f172a" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="650">${site}</text>
  ${titleLines.map((line, index) => `<text x="112" y="${260 + index * 82}" fill="#0f172a" font-family="ui-sans-serif, system-ui, sans-serif" font-size="68" font-weight="700" letter-spacing="-2">${line}</text>`).join("\n  ")}
  ${descriptionLines.map((line, index) => `<text x="112" y="${440 + index * 38}" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28">${line}</text>`).join("\n  ")}
</svg>`;
});
