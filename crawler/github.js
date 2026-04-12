const GITHUB_API = 'https://api.github.com';

async function githubFetch(url) {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${url}`);
  }
  return res.json();
}

/**
 * List the contents of a path in a GitHub repository.
 * Returns an array of { type, name, path } objects.
 */
export async function fetchRepoContents(owner, repo, path = '') {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  return githubFetch(url);
}

/**
 * Fetch the decoded text content of a single file in a GitHub repository.
 */
export async function fetchFileContent(owner, repo, path) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  const data = await githubFetch(url);
  if (data.encoding === 'base64') {
    return Buffer.from(data.content, 'base64').toString('utf8');
  }
  return data.content;
}
