import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { fetchRepoContents, fetchFileContent } from './github.js';
import { buildSkillsIndex } from './build.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const sourcesPath = join(__dirname, '../sources.json');
  const sources = JSON.parse(await readFile(sourcesPath, 'utf8'));

  console.log(`Building skills index from ${sources.length} source(s)...`);

  const skills = await buildSkillsIndex(sources, { fetchRepoContents, fetchFileContent });

  console.log(`Found ${skills.length} skill(s).`);

  const outputDir = join(__dirname, '../public');
  await mkdir(outputDir, { recursive: true });

  const outputPath = join(outputDir, 'skills.json');
  await writeFile(outputPath, JSON.stringify(skills, null, 2));

  console.log(`Written to ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
