import { promises as fs } from 'fs';
import path from 'path';

/** Tests whether a filesystem path exists. */
export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Removes a file or directory if it exists. */
export async function removeIfExists(targetPath, { dryRun, logger = console }) {
  if (!(await pathExists(targetPath))) return;
  if (dryRun) {
    logger.log(`[dry-run] remove ${targetPath}`);
    return;
  }
  await fs.rm(targetPath, { recursive: true, force: true });
}

/** Recursively collects file paths beneath a directory. */
export async function collectFilesRecursive(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFilesRecursive(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  files.sort();
  return files;
}

/** Copies a file, creating parent directories if needed. */
export async function copyFileWithDirs(source, destination, { dryRun, logger = console }) {
  if (dryRun) {
    logger.log(`[dry-run] copy ${source} -> ${destination}`);
    return;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

/** Creates a file symlink with directory preparation. */
export async function createFileSymlink(source, destination, { dryRun, logger = console }) {
  if (dryRun) {
    logger.log(`[dry-run] symlink ${destination} -> ${source}`);
    return;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const linkType = process.platform === 'win32' ? 'file' : undefined;
  try {
    await fs.symlink(source, destination, linkType);
  } catch (error) {
    if (process.platform === 'win32') {
      logger.warn(`Symlink not supported at ${destination}, falling back to copy. (${error.message})`);
      await copyFileWithDirs(source, destination, { dryRun: false, logger });
    } else {
      throw error;
    }
  }
}

/** Writes file contents ensuring parent directories exist. */
export async function writeFileWithDirs(destination, contents, { dryRun, logger = console }) {
  if (dryRun) {
    logger.log(`[dry-run] write ${destination}`);
    return;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, contents, 'utf8');
}
