import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildSkillsIndex } from '../crawler/build.js';

const MOCK_SKILL_MD = `---
name: undercover
description: Operate without revealing AI identity.
---
# Content`;

const mockFetchRepoContents = vi.fn();
const mockFetchFileContent = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('buildSkillsIndex', () => {
  it('builds a skills entry for each valid SKILL.md found', async () => {
    mockFetchRepoContents.mockResolvedValueOnce([
      { type: 'dir', name: 'undercover' },
      { type: 'file', name: 'README.md' },
    ]);
    mockFetchFileContent.mockResolvedValueOnce(MOCK_SKILL_MD);

    const sources = [{ repo: 'kumekay/skills-', url: 'https://github.com/kumekay/skills-' }];
    const skills = await buildSkillsIndex(sources, {
      fetchRepoContents: mockFetchRepoContents,
      fetchFileContent: mockFetchFileContent,
    });

    expect(skills).toHaveLength(1);
    expect(skills[0]).toMatchObject({
      name: 'undercover',
      description: 'Operate without revealing AI identity.',
      repo: 'kumekay/skills-',
      repoUrl: 'https://github.com/kumekay/skills-',
      installCommand: 'npx skills add git@github.com:kumekay/skills-.git --skill undercover',
    });
  });

  it('skips directories that have no SKILL.md', async () => {
    mockFetchRepoContents.mockResolvedValueOnce([
      { type: 'dir', name: 'notaskill' },
    ]);
    mockFetchFileContent.mockRejectedValueOnce(new Error('Not found'));

    const sources = [{ repo: 'kumekay/skills-', url: 'https://github.com/kumekay/skills-' }];
    const skills = await buildSkillsIndex(sources, {
      fetchRepoContents: mockFetchRepoContents,
      fetchFileContent: mockFetchFileContent,
    });

    expect(skills).toHaveLength(0);
  });

  it('handles a failed source repo fetch gracefully', async () => {
    mockFetchRepoContents.mockRejectedValueOnce(new Error('Network error'));

    const sources = [{ repo: 'bad/repo', url: 'https://github.com/bad/repo' }];
    const skills = await buildSkillsIndex(sources, {
      fetchRepoContents: mockFetchRepoContents,
      fetchFileContent: mockFetchFileContent,
    });

    expect(skills).toHaveLength(0);
  });

  it('processes multiple source repos', async () => {
    mockFetchRepoContents
      .mockResolvedValueOnce([{ type: 'dir', name: 'skill-a' }])
      .mockResolvedValueOnce([{ type: 'dir', name: 'skill-b' }]);
    mockFetchFileContent
      .mockResolvedValueOnce(`---\nname: skill-a\ndescription: Skill A\n---`)
      .mockResolvedValueOnce(`---\nname: skill-b\ndescription: Skill B\n---`);

    const sources = [
      { repo: 'owner/repo-one', url: 'https://github.com/owner/repo-one' },
      { repo: 'owner/repo-two', url: 'https://github.com/owner/repo-two' },
    ];
    const skills = await buildSkillsIndex(sources, {
      fetchRepoContents: mockFetchRepoContents,
      fetchFileContent: mockFetchFileContent,
    });

    expect(skills).toHaveLength(2);
    expect(skills[0].name).toBe('skill-a');
    expect(skills[1].name).toBe('skill-b');
  });

  it('finds skills nested under a top-level skills/ directory', async () => {
    mockFetchRepoContents
      .mockResolvedValueOnce([
        { type: 'dir', name: 'skills' },
        { type: 'dir', name: 'internal' },
        { type: 'file', name: 'README.md' },
      ])
      .mockResolvedValueOnce([
        { type: 'dir', name: 'share-with-discarica' },
        { type: 'file', name: 'notes.txt' },
      ]);
    mockFetchFileContent.mockImplementation((owner, repo, path) => {
      if (path === 'skills/share-with-discarica/SKILL.md') {
        return Promise.resolve(`---\nname: share-with-discarica\ndescription: Share pages.\n---`);
      }
      return Promise.reject(new Error('Not found'));
    });

    const sources = [{ repo: 'kumekay/discarica', url: 'https://github.com/kumekay/discarica' }];
    const skills = await buildSkillsIndex(sources, {
      fetchRepoContents: mockFetchRepoContents,
      fetchFileContent: mockFetchFileContent,
    });

    expect(mockFetchRepoContents).toHaveBeenCalledWith('kumekay', 'discarica', 'skills');
    expect(skills).toHaveLength(1);
    expect(skills[0]).toMatchObject({
      name: 'share-with-discarica',
      description: 'Share pages.',
      repo: 'kumekay/discarica',
      repoUrl: 'https://github.com/kumekay/discarica',
      installCommand:
        'npx skills add git@github.com:kumekay/discarica.git --skill share-with-discarica',
    });
  });

  it('skips SKILL.md entries that have no name field', async () => {
    mockFetchRepoContents.mockResolvedValueOnce([{ type: 'dir', name: 'unnamed' }]);
    mockFetchFileContent.mockResolvedValueOnce(`---\ndescription: No name\n---`);

    const sources = [{ repo: 'owner/repo', url: 'https://github.com/owner/repo' }];
    const skills = await buildSkillsIndex(sources, {
      fetchRepoContents: mockFetchRepoContents,
      fetchFileContent: mockFetchFileContent,
    });

    expect(skills).toHaveLength(0);
  });
});
