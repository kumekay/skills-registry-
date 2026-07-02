import { extractSkillData } from './parser.js';

/**
 * Build the full skills index from all configured sources.
 *
 * @param {Array<{repo: string, url: string}>} sources
 * @param {{ fetchRepoContents: Function, fetchFileContent: Function }} fetchers
 * @returns {Promise<Array>} array of skill objects
 */
export async function buildSkillsIndex(sources, { fetchRepoContents, fetchFileContent }) {
  const skills = [];

  for (const source of sources) {
    const { repo, url } = source;
    const [owner, repoName] = repo.split('/');

    let contents;
    try {
      contents = await fetchRepoContents(owner, repoName);
    } catch (err) {
      console.error(`Failed to fetch contents of ${repo}: ${err.message}`);
      continue;
    }

    const dirs = contents.filter((item) => item.type === 'dir');

    // Skills live either in top-level directories or under a skills/ directory.
    const skillDirPaths = [];
    for (const dir of dirs) {
      if (dir.name === 'skills') {
        try {
          const nested = await fetchRepoContents(owner, repoName, 'skills');
          for (const item of nested) {
            if (item.type === 'dir') {
              skillDirPaths.push(`skills/${item.name}`);
            }
          }
        } catch (err) {
          console.error(`Failed to fetch skills/ of ${repo}: ${err.message}`);
        }
      } else {
        skillDirPaths.push(dir.name);
      }
    }

    for (const dirPath of skillDirPaths) {
      try {
        const skillMdPath = `${dirPath}/SKILL.md`;
        const content = await fetchFileContent(owner, repoName, skillMdPath);
        const data = extractSkillData(content);
        if (data) {
          skills.push({
            name: data.name,
            description: data.description,
            repo,
            repoUrl: url,
            installCommand: `npx skills add git@github.com:${repo}.git --skill ${data.name}`,
          });
        }
      } catch {
        // Directory has no SKILL.md — skip silently
      }
    }
  }

  return skills;
}
