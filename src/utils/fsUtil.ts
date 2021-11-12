import fs from 'fs';

export function createFolderIfNotExist(path: string): boolean {
  if (!fs.existsSync(path)) {
    try {
      fs.mkdirSync(path);
      return true;
    } catch (e) {
      console.error(`Cant create folder at ${path}`);
      return false;
    }
  } else {
    return true;
  }
}

export function removeFolderIfExist(path: string): boolean {
  if (fs.existsSync(path)) {
    try {
      fs.rmSync(path, {
        recursive: true,
        force: true,
      });
      return true;
    } catch (e) {
      console.error(`Cant remoce folder at ${path}`);
      return false;
    }
  } else {
    return true;
  }
}
