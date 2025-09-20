import path from 'path';
import { promises as fs } from 'fs';
import {
  flattenRelativePath,
  resolveFlattenOptions,
  shouldPreservePath,
  splitSegments,
  stripTemplateExtension,
} from './path-utils.js';
import {
  collectFilesRecursive,
  copyFileWithDirs,
  createFileSymlink,
  removeIfExists,
  writeFileWithDirs,
} from './fs-utils.js';
import { replaceMarkdownPlaceholders } from './placeholders.js';

/** Processes provider mappings and transfers files to the destination. */
export async function processMappings({
  mappings,
  providerConfig,
  sourceRoot,
  destinationRoot,
  destinationDisplay,
  commandsRootDisplay,
  mode,
  dryRun,
  logger = console,
}) {
  const state = { symlinkPlaceholderWarned: false };
  const resolveDestinationRelativePath = createDestinationResolver(providerConfig);

  for (const mapping of mappings) {
    const sourcePath = path.join(sourceRoot, mapping.source);
    try {
      await fs.access(sourcePath);
    } catch {
      throw new Error(`Missing source path: ${sourcePath}`);
    }

    if (mapping.flatten) {
      const targetRoot = mapping.target ? path.join(destinationRoot, mapping.target) : destinationRoot;
      await processFlattenMapping({
        mapping,
        providerConfig,
        sourcePath,
        targetRoot,
        destinationDisplay,
        commandsRootDisplay,
        mode,
        dryRun,
        logger,
        state,
        resolveDestinationRelativePath,
      });
      continue;
    }

    await processStandardMapping({
      mapping,
      providerConfig,
      sourcePath,
      destinationRoot,
      destinationDisplay,
      commandsRootDisplay,
      mode,
      dryRun,
      logger,
      state,
      resolveDestinationRelativePath,
    });
  }
}

/** Handles a mapping that preserves directory structure. */
async function processStandardMapping({
  mapping,
  providerConfig,
  sourcePath,
  destinationRoot,
  destinationDisplay,
  commandsRootDisplay,
  mode,
  dryRun,
  logger,
  state,
  resolveDestinationRelativePath,
}) {
  const markdownExtension = providerConfig?.markdownExtension ?? '.md';
  const targetBase = path.join(destinationRoot, mapping.target ?? mapping.source);
  await removeIfExists(targetBase, { dryRun, logger });
  const files = await collectFilesRecursive(sourcePath);
  for (const absoluteFile of files) {
    const relativeToMappingRoot = path.relative(sourcePath, absoluteFile);
    const relativeSegments = splitSegments(relativeToMappingRoot);
    const normalizedRelative = relativeSegments.join('/');
    const destinationRelative = stripTemplateExtension(normalizedRelative, markdownExtension);
    const destinationFile = path.join(targetBase, ...destinationRelative.split('/'));
    await transferFile({
      providerConfig,
      sourceFile: absoluteFile,
      destinationFile,
      destinationDisplay,
      commandsRootDisplay,
      mode,
      dryRun,
      logger,
      state,
      resolveDestinationRelativePath,
    });
  }
}

/** Handles a mapping that flattens directory structure. */
async function processFlattenMapping({
  mapping,
  providerConfig,
  sourcePath,
  targetRoot,
  destinationDisplay,
  commandsRootDisplay,
  mode,
  dryRun,
  logger,
  state,
  resolveDestinationRelativePath,
}) {
  const { delimiter, excludePrefixes } = resolveFlattenOptions(mapping.flatten);
  const markdownExtension = providerConfig?.markdownExtension ?? '.md';
  const seen = new Set();
  const mappingSourceSegments = splitSegments(mapping.source ?? '');
  const files = await collectFilesRecursive(sourcePath);
  for (const absoluteFile of files) {
    const relativeToMappingRoot = path.relative(sourcePath, absoluteFile);
    const relativeSegments = splitSegments(relativeToMappingRoot);
    const normalizedRelative = relativeSegments.join('/');
    const relativeWithMapping = [...mappingSourceSegments, ...relativeSegments].join('/');
    const flattenedName = flattenRelativePath(relativeWithMapping, delimiter);
    if (!flattenedName) {
      throw new Error(`Unable to compute flattened name for ${absoluteFile}`);
    }

    const destinationRelativePreserved = stripTemplateExtension(normalizedRelative, markdownExtension);
    const destinationRelativeFlattened = stripTemplateExtension(flattenedName, markdownExtension);

    if (shouldPreservePath(normalizedRelative, excludePrefixes)) {
      const legacyFlattenedPath = path.join(targetRoot, flattenedName);
      await removeIfExists(legacyFlattenedPath, { dryRun, logger });

      const destinationFile = path.join(targetRoot, ...destinationRelativePreserved.split('/'));
      await removeIfExists(destinationFile, { dryRun, logger });
      await transferFile({
        providerConfig,
        sourceFile: absoluteFile,
        destinationFile,
        destinationDisplay,
        commandsRootDisplay,
        mode,
        dryRun,
        logger,
        state,
        resolveDestinationRelativePath,
      });
      continue;
    }

    if (seen.has(destinationRelativeFlattened)) {
      throw new Error(`Flattened filename collision detected: ${destinationRelativeFlattened}`);
    }
    seen.add(destinationRelativeFlattened);

    const destinationFile = path.join(targetRoot, ...destinationRelativeFlattened.split('/'));
    await removeIfExists(destinationFile, { dryRun, logger });
    await transferFile({
      providerConfig,
      sourceFile: absoluteFile,
      destinationFile,
      destinationDisplay,
      commandsRootDisplay,
      mode,
      dryRun,
      logger,
      state,
      resolveDestinationRelativePath,
    });
  }
}

/** Transfers an individual file according to mode and placeholders. */
async function transferFile({
  providerConfig,
  sourceFile,
  destinationFile,
  destinationDisplay,
  commandsRootDisplay,
  mode,
  dryRun,
  logger,
  state,
  resolveDestinationRelativePath,
}) {
  const extension = path.extname(sourceFile).toLowerCase();
  const isMarkdown = extension === '.md';

  if (isMarkdown) {
    const content = await fs.readFile(sourceFile, 'utf8');
    const { replaced, hasDynamicContent } = replaceMarkdownPlaceholders(content, {
      resolveScriptPath: (relativePath) => resolveDestinationRelativePath(relativePath),
      destinationDisplay,
      commandsRootDisplay,
      providerId: providerConfig.id,
    });

    if (mode === 'symlink' && hasDynamicContent) {
      if (!state.symlinkPlaceholderWarned) {
        logger.warn('Symlink mode not supported for markdown with embedded placeholders. Falling back to copy.');
        state.symlinkPlaceholderWarned = true;
      }
      await writeFileWithDirs(destinationFile, replaced, { dryRun, logger });
      return;
    }

    await writeFileWithDirs(destinationFile, replaced, { dryRun, logger });
    return;
  }

  if (mode === 'copy') {
    await copyFileWithDirs(sourceFile, destinationFile, { dryRun, logger });
    return;
  }

  await createFileSymlink(sourceFile, destinationFile, { dryRun, logger });
}

/** Builds a resolver that maps source script paths to destination paths. */
function createDestinationResolver(providerConfig) {
  const providerId = providerConfig.id ?? 'unknown';
  const mappings = providerConfig.mappings ?? [];
  const markdownExtension = providerConfig?.markdownExtension ?? '.md';
  return (relativePath, overrideProviderId = providerId) => {
    const normalized = splitSegments(relativePath).join('/');
    for (const mapping of mappings) {
      const mappingSource = splitSegments(mapping.source ?? '').join('/');
      if (!mappingSource) continue;
      if (normalized === mappingSource || normalized.startsWith(`${mappingSource}/`)) {
        const remainder = normalized === mappingSource ? '' : normalized.slice(mappingSource.length + 1);
        if (!mapping.flatten) {
          const targetBase = mapping.target ? splitSegments(mapping.target).join('/') : mappingSource;
          const combined = remainder ? `${targetBase}/${remainder}` : targetBase;
          return stripTemplateExtension(combined, markdownExtension);
        }
        const options = resolveFlattenOptions(mapping.flatten);
        if (shouldPreservePath(remainder, options.excludePrefixes)) {
          const targetBase = mapping.target ? splitSegments(mapping.target).join('/') : '';
          if (!targetBase) return stripTemplateExtension(remainder, markdownExtension);
          const combined = remainder ? `${targetBase}/${remainder}` : targetBase;
          return stripTemplateExtension(combined, markdownExtension);
        }
        const flattenInput = remainder ? `${mappingSource}/${remainder}` : mappingSource;
        const flattenedName = stripTemplateExtension(
          flattenRelativePath(flattenInput, options.delimiter),
          markdownExtension
        );
        const targetBase = mapping.target ? splitSegments(mapping.target).join('/') : '';
        return targetBase ? `${targetBase}/${flattenedName}` : flattenedName;
      }
    }
    throw new Error(`Unable to resolve script placeholder '${relativePath}' for provider '${overrideProviderId}'.`);
  };
}
