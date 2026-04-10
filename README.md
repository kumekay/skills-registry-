# skills-registry-

A static web index that aggregates agent skills from multiple Git repositories into a searchable single-page UI. Skills are installed via the [`skills` CLI](https://github.com/vercel-labs/skills).

## Features

- Crawls skill repositories listed in `sources.json` and builds a `public/skills.json` index
- Single-page frontend with instant client-side search — no server required
- One-click copy of `npx skills add ...` install commands
- Docker image for zero-config deployment

## Quick start

Requires Node.js 20+.

```bash
npm install

# Crawl configured sources and regenerate public/skills.json
npm run crawl

# Open public/index.html in your browser — no server needed
```

## Adding skill sources

Edit `sources.json` and add an entry for each repository you want to index:

```json
[
  {
    "repo": "owner/repo-name",
    "url": "https://github.com/owner/repo-name"
  }
]
```

Each repository must contain skill directories with a `SKILL.md` file that has YAML frontmatter:

```markdown
---
name: my-skill
description: What this skill does.
---
```

## Docker

Build and run the registry as a self-contained container. The crawler runs during the Docker build and the resulting static site is served by nginx.

```bash
docker build -t skills-registry .
docker run --rm -p 8080:80 skills-registry
```

Then open <http://localhost:8080>.

To pass a GitHub token for higher API rate limits:

```bash
docker build --build-arg GITHUB_TOKEN=ghp_... -t skills-registry .
```

## Development

```bash
npm test       # run unit tests
npm run lint   # lint crawler and tests
npm run crawl  # regenerate public/skills.json
```

See [AGENTS.md](AGENTS.md) for TDD conventions.
