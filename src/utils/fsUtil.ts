import fs from 'fs';

export function createFolderIfNotExist(path: string): boolean {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  return true;
}

export function removeFolderIfExist(path: string): boolean {
  if (fs.existsSync(path)) {
    fs.rmSync(path, {
      recursive: true,
      force: true,
    });
  }
  return true;
}
