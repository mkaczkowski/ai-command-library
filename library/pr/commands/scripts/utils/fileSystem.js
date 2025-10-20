import fs from 'fs';
import { mkdir, readFile } from 'fs/promises';
import path from 'path';

export function normalizeRepositoryPath(filePath) {
  if (typeof filePath !== 'string') {
    return '';
  }

  const normalized = path.posix.normalize(filePath).replace(/^\.\/+/, '');
  if (normalized === '.') {
    return '';
  }

  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

export function normalizeDirectoryPath(dirPath) {
  if (typeof dirPath !== 'string') {
    return '';
  }

  const normalized = path.posix.normalize(dirPath).replace(/^\.\/+/, '');
  if (normalized === '.') {
    return '';
  }

  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

function isDirectoryBlocked(normalizedPath, blockedDirectories = new Set()) {
  for (const blockedDirectory of blockedDirectories) {
    if (!blockedDirectory) {
      continue;
    }

    if (normalizedPath === blockedDirectory || normalizedPath.startsWith(`${blockedDirectory}/`)) {
      return true;
    }
  }

  return false;
}

export function shouldIncludeFile(detail, blocklist = { fileNames: new Set(), directories: new Set() }) {
  if (!detail?.filename) {
    return false;
  }

  const normalizedPath = normalizeRepositoryPath(detail.filename);
  if (!normalizedPath) {
    return false;
  }

  const fileName = path.posix.basename(normalizedPath);
  if (blocklist.fileNames?.has?.(fileName)) {
    return false;
  }

  if (isDirectoryBlocked(normalizedPath, blocklist.directories)) {
    return false;
  }

  return true;
}

export function resolveExistingPath(filePath) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('File path cannot be empty');
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  return absolutePath;
}

export async function ensureDirectoryForFile(filePath) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('File path cannot be empty');
  }

  const directory = path.dirname(path.resolve(filePath));
  await mkdir(directory, { recursive: true });
  return directory;
}

export async function readJsonFile(filePath) {
  const absolutePath = resolveExistingPath(filePath);
  const content = await readFile(absolutePath, 'utf8');

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Unable to parse JSON from ${absolutePath}: ${error.message}`);
  }
}
