import path from 'path';
import { PLUGINS_ROOT } from './paths.js';
import { linkResource } from './link-resource.js';
import { getPluginGroups } from './plugin-groups.js';
import { exists } from './path-utils.js';

/**
 * Orchestrates linking agents for a given provider.
 *
 * NOTE: All agents from selected groups link to the same destination directory.
 * If multiple groups define an agent with the same name, the last one processed will
 * overwrite previous ones. See CLAUDE.md "Naming Conventions for Skills and Agents"
 * for best practices on avoiding naming conflicts.
 */
export async function linkAgents({ providerId, destination, mode, dryRun, selectedPlugins, logger = console }) {
  // Get plugin groups to process
  const groups = await getPluginGroups(PLUGINS_ROOT, selectedPlugins, logger);

  if (groups.length === 0) {
    logger.log('No plugin groups to process for agents.');
    return;
  }

  logger.log(`Processing agents from groups: ${groups.join(', ')}`);

  // Loop through each group and link agents if they exist
  for (const group of groups) {
    const sourceRoot = path.join(PLUGINS_ROOT, group, 'agents');

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
