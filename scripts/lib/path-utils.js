import os from 'os';
import path from 'path';

/** Expands a path that may reference the current user's home directory. */
export function expandHomeDir(targetPath) {
  if (!targetPath) return targetPath;
  if (targetPath === '~') return os.homedir();
  if (targetPath.startsWith('~/') || targetPath.startsWith('~\\')) {
    const suffix = targetPath.slice(2);
    return suffix ? path.join(os.homedir(), suffix) : os.homedir();
  }
  return targetPath;
}

/** Splits a path into trimmed, non-empty segments. */
export function splitSegments(input) {
  if (!input) return [];
  return String(input)
    .split(/[/\\]/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

/** Flattens path segments into a single delimiter-joined string. */
export function flattenRelativePath(relativePath, delimiter = '__') {
  const normalized = splitSegments(relativePath);
  return normalized.join(delimiter);
}

/** Replaces .template.md suffixes with the configured markdown extension. */
export function stripTemplateExtension(relativePath, replacementExtension = '.md') {
  if (relativePath.endsWith('.template.md')) {
    return `${relativePath.slice(0, -'.template.md'.length)}${replacementExtension}`;
  }
  return relativePath;
}

/** Normalizes flatten mapping options into a usable structure. */
export function resolveFlattenOptions(flattenValue) {
  const options = { delimiter: '__', excludePrefixes: [] };
  if (!flattenValue || flattenValue === true) {
    return options;
  }
  if (typeof flattenValue === 'object') {
    if (typeof flattenValue.delimiter === 'string' && flattenValue.delimiter.length > 0) {
      options.delimiter = flattenValue.delimiter;
    }
    if (Array.isArray(flattenValue.excludePrefixes)) {
      options.excludePrefixes = flattenValue.excludePrefixes
        .map((prefix) => splitSegments(prefix))
        .filter((segments) => segments.length > 0);
    }
  }
  return options;
}

/** Checks whether a path should retain its directory structure. */
export function shouldPreservePath(relativePath, excludePrefixes) {
  if (!excludePrefixes.length) return false;
  const segments = splitSegments(relativePath);
  return excludePrefixes.some((prefixSegments) => {
    if (prefixSegments.length > segments.length) return false;
    return prefixSegments.every((segment, index) => segments[index] === segment);
  });
}

/** Combines a destination display root with a relative path. */
export function combineDisplayPath(destinationDisplay, relativePath) {
  const normalizedRoot = destinationDisplay ? destinationDisplay.replace(/\\/g, '/') : '';
  const normalizedRelative = relativePath ? relativePath.replace(/\\/g, '/') : '';
  if (!normalizedRoot) return normalizedRelative;
  if (!normalizedRelative) return normalizedRoot;
  return normalizedRoot.endsWith('/')
    ? `${normalizedRoot}${normalizedRelative}`
    : `${normalizedRoot}/${normalizedRelative}`;
}
