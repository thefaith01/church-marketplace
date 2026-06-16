export type CsvRow = { fullName: string | null; email: string };

/**
 * Parses a simple members CSV. Accepts columns in any order; picks the column
 * that looks like an email and treats the rest as the name. Tolerates an
 * optional header row. De-duplicates by email (lowercased).
 */
export function parseMemberCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const first = lines[0].toLowerCase();
  const hasHeader = first.includes("email") || first.includes("name");
  const rows = hasHeader ? lines.slice(1) : lines;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const out: CsvRow[] = [];
  const seen = new Set<string>();

  for (const line of rows) {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const email = cols.find((c) => emailRe.test(c));
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const name = cols.filter((c) => c !== email).join(" ").trim();
    out.push({ fullName: name || null, email: key });
  }

  return out;
}
