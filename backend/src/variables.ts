import path from 'path';
import { packageDirectorySync as pkgDir } from 'package-directory';
import { assert } from './util';

const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const repoRoot = pkgDir() || ''; 
assert(typeof repoRoot === 'string');
const frontendBasePath = path.join(repoRoot, 'frontend/build');

export { port, baseUrl, repoRoot, frontendBasePath };
