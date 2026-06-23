import { access, constants } from 'node:fs/promises';

export async function fileExists(filePath: string) {
  try {
    // F_OK checks if the file is visible to the current process
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
