import { rm, mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = import.meta.dirname;
await rm(resolve(root, 'dist'), { recursive: true, force: true });
await mkdir(resolve(root, 'dist'), { recursive: true });
for (const file of ['index.html', 'humanity-labs-logo.png']) {
  await copyFile(resolve(root, '../landing', file), resolve(root, 'dist', file));
}
console.log('Copied the two original public assets; no plugin or configuration files included.');
