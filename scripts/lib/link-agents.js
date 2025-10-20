import path from 'path';
import { promises as fs } from 'fs';
import { LIBRARY_ROOT } from './paths.js';
import { linkResource } from './link-resource.js';
import { getLibraryGroups } from './library-groups.js';

/**
 * Checks if a path exists.
 */
async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Orchestrates linking agents for a given provider. */
export async function linkAgents({ providerId, destination, mode, dryRun, selectedFolders, logger = console }) {
  // Get library groups to process
  const groups = await getLibraryGroups(LIBRARY_ROOT, selectedFolders, logger);

  if (groups.length === 0) {
    logger.log('No library groups to process for agents.');
    return;
  }

  logger.log(`Processing agents from groups: ${groups.join(', ')}`);

  // Loop through each group and link agents if they exist
  for (const group of groups) {
    const sourceRoot = path.join(LIBRARY_ROOT, group, 'agents');

    // Check if this group has agents
    if (!(await exists(sourceRoot))) {
      continue;
    }

    logger.log(`Linking agents from group: ${group}`);

    // Use existing linkResource - it handles everything!
    await linkResource({
      providerId,
      sourceRoot,
      destination,
      mode,
      dryRun,
      resourceName: `agents (${group})`,
      resourceType: 'file',
      filterFn: (entry) => entry.isFile() && entry.name.endsWith('.md'),
      logger,
    });
  }
}
