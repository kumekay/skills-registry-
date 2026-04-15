import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const deployWorkflow = readFileSync(resolve('.github/workflows/deploy.yml'), 'utf8');

describe('deploy workflow', () => {
  it('uses deploy-pages v5 so the action runs on Node.js 24', () => {
    expect(deployWorkflow).toContain('uses: actions/deploy-pages@v5');
  });
});
