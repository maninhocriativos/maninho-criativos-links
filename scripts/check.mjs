import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = [...walk('functions'), ...walk('public')].filter(f => extname(f) === '.js');
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}
const forbidden = [/\.innerHTML\s*=\s*`[^`]*\$\{\s*(?:lead|l)\.(?:name|message|phone|service)/s];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  if (forbidden.some(pattern => pattern.test(source))) {
    console.error(`Unsafe lead interpolation in ${file}`);
    failed = true;
  }
}
for (const file of walk('public').filter(f => extname(f) === '.html')) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const ref = match[1];
    if (/^(?:https?:|mailto:|tel:|\/api\/|\/uploads\/|\/$)/.test(ref)) continue;
    const local = join('public', ref.replace(/^\//, ''));
    if (!existsSync(local)) { console.error(`Missing static reference ${ref} in ${file}`); failed = true; }
  }
}
if (failed) process.exit(1);
console.log(`Checked ${files.length} JavaScript files.`);
