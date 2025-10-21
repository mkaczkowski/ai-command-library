import { promises as fs } from 'fs';
import path from 'path';
import { exists } from './path-utils.js';

/**
 * Discovers all valid plugin groups in the plugins root.
 * A valid group is a directory containing at least one resource type folder
 * (commands/, skills/, or agents/).
 *
 * @param {string} pluginsRoot - Path to plugins root directory
 * @returns {Promise<string[]>} Array of group names (sorted)
 */
async function discoverGroups(pluginsRoot) {
  let entries;
  try {
    entries = await fs.readdir(pluginsRoot, { withFileTypes: true });
  } catch (error) {
    return [];
  }

  const groups = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue; // Skip hidden directories

    // Check if group has at least one resource type
    const groupPath = path.join(pluginsRoot, entry.name);
    const hasCommands = await exists(path.join(groupPath, 'commands'));
    const hasSkills = await exists(path.join(groupPath, 'skills'));
    const hasAgents = await exists(path.join(groupPath, 'agents'));

    if (hasCommands || hasSkills || hasAgents) {
      groups.push(entry.name);
    }
  }

  return groups.sort(); // Consistent ordering
}

/**
 * Gets plugin groups, optionally filtered by user selection.
 * Validates that selected plugins actually exist.
 *
 * @param {string} pluginsRoot - Path to plugins root directory
 * @param {string[]|null} selectedPlugins - Array of plugin names to include, or null for all
 * @param {object} logger - Logger instance
 * @returns {Promise<string[]>} Array of group names to process
 */
export async function getPluginGroups(pluginsRoot, selectedPlugins = null, logger = console) {
  const allGroups = await discoverGroups(pluginsRoot);

  if (allGroups.length === 0) {
    logger.log(`No plugin groups found in ${pluginsRoot}`);
    return [];
  }

  // If no selection, return all groups
  if (!selectedPlugins || selectedPlugins.length === 0) {
    return allGroups;
  }

  // Validate selected plugins exist
  const invalid = selectedPlugins.filter((f) => !allGroups.includes(f));
  if (invalid.length > 0) {
    throw new Error(
      `Invalid plugins: ${invalid.join(', ')}\n` +
        `Available plugins: ${allGroups.join(', ')}\n` +
        `Use --list-groups to see all available groups.`
    );
  }

  return selectedPlugins;
}

/**
 * Lists all available plugin groups with their resource types.
 *
 * @param {string} pluginsRoot - Path to plugins root directory
 * @param {object} logger - Logger instance
 */
export async function listPluginGroups(pluginsRoot, logger = console) {
  const groups = await discoverGroups(pluginsRoot);

  if (groups.length === 0) {
    logger.log('No plugin groups found.');
    return;
  }

  logger.log('Available plugin groups:');

  for (const group of groups) {
    const types = [];
    const groupPath = path.join(pluginsRoot, group);

    if (await exists(path.join(groupPath, 'commands'))) types.push('commands');
    if (await exists(path.join(groupPath, 'skills'))) types.push('skills');
    if (await exists(path.join(groupPath, 'agents'))) types.push('agents');

    logger.log(`  - ${group} (${types.join(', ')})`);
  }
}
