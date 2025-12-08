/*
  Ensure standalone bundle contains required static assets so deploying only .next/standalone works.
  - Copies `.next/static` => `.next/standalone/.next/static`
  - Copies `public` => `.next/standalone/public`
*/
const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isSymbolicLink()) {
      const target = fs.readlinkSync(s);
      try { fs.symlinkSync(target, d); } catch { /* skip on windows */ }
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

(function main() {
  const root = process.cwd();
  const standaloneDir = path.join(root, '.next', 'standalone');
  if (!fs.existsSync(standaloneDir)) {
    console.warn('[prepare-standalone] Skip: .next/standalone not found. Did you run `next build`?');
    return;
  }

  // Copy .next/static
  const staticSrc = path.join(root, '.next', 'static');
  const staticDest = path.join(standaloneDir, '.next', 'static');
  try {
    copyDir(staticSrc, staticDest);
    console.log('[prepare-standalone] Copied .next/static');
  } catch (e) {
    console.warn('[prepare-standalone] Failed to copy .next/static:', e?.message || e);
  }

  // Copy public
  const publicSrc = path.join(root, 'public');
  const publicDest = path.join(standaloneDir, 'public');
  try {
    copyDir(publicSrc, publicDest);
    console.log('[prepare-standalone] Copied public');
  } catch (e) {
    console.warn('[prepare-standalone] Failed to copy public:', e?.message || e);
  }
})();
