import { describe, it, expect } from 'vitest';
import { parseFrontmatter, extractSkillData } from '../crawler/parser.js';

describe('parseFrontmatter', () => {
  it('parses valid frontmatter', () => {
    const content = `---\nname: my-skill\ndescription: A test skill\n---\n# Content`;
    const result = parseFrontmatter(content);
    expect(result).toEqual({ name: 'my-skill', description: 'A test skill' });
  });

  it('returns null when no frontmatter present', () => {
    expect(parseFrontmatter('# No frontmatter here')).toBeNull();
  });

  it('handles descriptions that contain colons', () => {
    const content = `---\nname: my-skill\ndescription: A skill: with colons\n---`;
    const result = parseFrontmatter(content);
    expect(result.description).toBe('A skill: with colons');
  });

  it('handles Windows-style line endings', () => {
    const content = `---\r\nname: my-skill\r\ndescription: Works on Windows\r\n---`;
    const result = parseFrontmatter(content);
    expect(result).toEqual({ name: 'my-skill', description: 'Works on Windows' });
  });
});

describe('extractSkillData', () => {
  it('extracts name and description from valid SKILL.md', () => {
    const content = `---\nname: undercover\ndescription: Operate without revealing AI identity\n---`;
    const result = extractSkillData(content);
    expect(result).toEqual({
      name: 'undercover',
      description: 'Operate without revealing AI identity',
    });
  });

  it('returns null when name is missing', () => {
    const content = `---\ndescription: No name here\n---`;
    expect(extractSkillData(content)).toBeNull();
  });

  it('uses empty string for missing description', () => {
    const content = `---\nname: minimal\n---`;
    const result = extractSkillData(content);
    expect(result).toEqual({ name: 'minimal', description: '' });
  });

  it('returns null for content without frontmatter', () => {
    expect(extractSkillData('# Just a heading')).toBeNull();
  });
});
