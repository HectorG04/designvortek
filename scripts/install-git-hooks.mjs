/**
 * install-git-hooks.mjs
 *
 * Points git at the repo's `.githooks/` directory so the pre-push hook
 * runs automatically before every push. Hooks are committed to the repo
 * (vs the default .git/hooks/ which is gitignored) so the whole team
 * gets the same checks without per-clone setup.
 *
 * Run once after cloning:    node scripts/install-git-hooks.mjs
 * Make hooks executable too: chmod +x .githooks/* (Unix/Mac only)
 *
 * Disable globally:          git config --unset core.hooksPath
 */

import { execSync } from 'child_process'
import { chmodSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const HOOKS_DIR = join(ROOT, '.githooks')

if (!existsSync(HOOKS_DIR)) {
  console.error(`✗ ${HOOKS_DIR} does not exist`)
  process.exit(1)
}

// Tell git where to find our hooks
execSync('git config core.hooksPath .githooks', { cwd: ROOT, stdio: 'inherit' })

// Make sure every hook script is executable on Unix/Mac. Windows ignores chmod.
if (process.platform !== 'win32') {
  for (const file of readdirSync(HOOKS_DIR)) {
    chmodSync(join(HOOKS_DIR, file), 0o755)
  }
}

console.log('')
console.log('✅ Git hooks installed.')
console.log('   .githooks/pre-push will now run before every push.')
console.log('   Skip once with:   git push --no-verify')
console.log('   Uninstall with:   git config --unset core.hooksPath')
console.log('')
