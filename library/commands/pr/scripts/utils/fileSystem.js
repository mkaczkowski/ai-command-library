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
