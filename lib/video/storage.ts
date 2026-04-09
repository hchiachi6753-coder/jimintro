import fs from 'node:fs/promises';
import path from 'node:path';

const storageRoot = path.resolve(process.cwd(), process.env.STORAGE_ROOT || 'storage');

export function getStorageRoot() {
  return storageRoot;
}

export async function ensureStorageDirs() {
  const dirs = ['uploads', 'jobs', 'outputs', 'tmp'];
  await Promise.all(dirs.map((dir) => fs.mkdir(path.join(storageRoot, dir), { recursive: true })));
}

export function safeFileName(input: string) {
  return input.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
}
