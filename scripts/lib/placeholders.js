import { combineDisplayPath } from './path-utils.js';

const SCRIPT_PLACEHOLDER_PATTERN = /\{\{\s*script:([^}]+)\s*\}\}/g;
const PATH_PLACEHOLDER_PATTERN = /\{\{\s*path:([^}]+)\s*\}\}/g;

/** Replaces markdown placeholders with provider-aware values. */
export function replaceMarkdownPlaceholders(
  content,
  { resolveScriptPath, destinationDisplay, commandsRootDisplay, providerId }
) {
  let hasDynamicContent = false;

  let replaced = content.replace(SCRIPT_PLACEHOLDER_PATTERN, (_, rawPath) => {
    hasDynamicContent = true;
    const normalizedPath = rawPath.trim();
    if (!normalizedPath) {
      throw new Error('Encountered empty script placeholder.');
    }
    const resolvedRelative = resolveScriptPath(normalizedPath);
    return combineDisplayPath(destinationDisplay, resolvedRelative);
  });

  replaced = replaced.replace(PATH_PLACEHOLDER_PATTERN, (_, rawKey) => {
    hasDynamicContent = true;
    const key = rawKey.trim();
    if (!key) {
      throw new Error('Encountered empty path placeholder.');
    }
    if (key !== 'commandsRoot') {
      throw new Error(`Unknown path placeholder '${key}' for provider '${providerId ?? 'unknown'}'.`);
    }
    if (!commandsRootDisplay) {
      throw new Error(`Provider '${providerId ?? 'unknown'}' does not specify a commandsRoot display path.`);
    }
    return commandsRootDisplay;
  });

  SCRIPT_PLACEHOLDER_PATTERN.lastIndex = 0;
  PATH_PLACEHOLDER_PATTERN.lastIndex = 0;

  return { replaced, hasDynamicContent };
}
