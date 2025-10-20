import path from 'path';
import { LIBRARY_ROOT } from './paths.js';
import { linkResource } from './link-resource.js';
import { getLibraryGroups } from './library-groups.js';
import { exists } from './path-utils.js';

/** Orchestrates linking skills for a given provider. */
export async function linkSkills({ providerId, destination, mode, dryRun, selectedFolders, logger = console }) {
  // Get library groups to process
  const groups = await getLibraryGroups(LIBRARY_ROOT, selectedFolders, logger);

  if (groups.length === 0) {
    logger.log('No library groups to process for skills.');
    return;
  }

  logger.log(`Processing skills from groups: ${groups.join(', ')}`);

  // Loop through each group and link skills if they exist
  for (const group of groups) {
    const sourceRoot = path.join(LIBRARY_ROOT, group, 'skills');

    // Check if this group has skills
    if (!(await exists(sourceRoot))) {
      continue;
    }

    logger.log(`Linking skills from group: ${group}`);

    // Use existing linkResource - it handles everything!
    await linkResource({
      providerId,
      sourceRoot,
      destination,
      mode,
      dryRun,
      resourceName: `skills (${group})`,
      resourceType: 'directory',
      filterFn: (entry) => entry.isDirectory(),
      logger,
    });
  }
}
