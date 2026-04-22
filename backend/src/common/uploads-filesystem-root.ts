import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Filesystem root for uploaded media.
 * Uses backend/uploads in both ts-node and compiled dist runtime.
 */
export function getUploadsFilesystemRoot(): string {
  return join(__dirname, '..', '..', 'uploads');
}

export function ensureUploadsTree() {
  const root = getUploadsFilesystemRoot();
  const folders = ['games', 'branding', 'lobby', 'documents'];
  for (const folder of folders) {
    const dir = join(root, folder);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}
