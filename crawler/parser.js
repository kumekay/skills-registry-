/**
 * Parse YAML frontmatter from a SKILL.md file.
 * Returns a plain object of key/value pairs, or null if no frontmatter found.
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}

/**
 * Extract skill metadata from SKILL.md content.
 * Returns { name, description } or null if name is missing.
 */
export function extractSkillData(content) {
  const fm = parseFrontmatter(content);
  if (!fm || !fm.name) return null;
  return {
    name: fm.name,
    description: fm.description || '',
  };
}
