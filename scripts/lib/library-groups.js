import { promises as fs } from 'fs';
import path from 'path';
import { exists } from './path-utils.js';

/**
 * Discovers all valid library groups in the library root.
 * A valid group is a directory containing at least one resource type folder
 * (commands/, skills/, or agents/).
 *
 * @param {string} libraryRoot - Path to library root directory
 * @returns {Promise<string[]>} Array of group names (sorted)
 */
async function discoverGroups(libraryRoot) {
  let entries;
  try {
    entries = await fs.readdir(libraryRoot, { withFileTypes: true });
  } catch (error) {
    return [];
  }

  const groups = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue; // Skip hidden directories

    // Check if group has at least one resource type
    const groupPath = path.join(libraryRoot, entry.name);
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
 * Gets library groups, optionally filtered by user selection.
 * Validates that selected folders actually exist.
 *
 * @param {string} libraryRoot - Path to library root directory
 * @param {string[]|null} selectedFolders - Array of folder names to include, or null for all
 * @param {object} logger - Logger instance
 * @returns {Promise<string[]>} Array of group names to process
 */
export async function getLibraryGroups(libraryRoot, selectedFolders = null, logger = console) {
  const allGroups = await discoverGroups(libraryRoot);

  if (allGroups.length === 0) {
    logger.log(`No library groups found in ${libraryRoot}`);
    return [];
  }

  // If no selection, return all groups
  if (!selectedFolders || selectedFolders.length === 0) {
    return allGroups;
  }

  // Validate selected folders exist
  const invalid = selectedFolders.filter((f) => !allGroups.includes(f));
  if (invalid.length > 0) {
    throw new Error(
      `Invalid library folders: ${invalid.join(', ')}\n` +
        `Available folders: ${allGroups.join(', ')}\n` +
        `Use --list-groups to see all available groups.`
    );
  }

  return selectedFolders;
}

/**
 * Lists all available library groups with their resource types.
 *
 * @param {string} libraryRoot - Path to library root directory
 * @param {object} logger - Logger instance
 */
export async function listLibraryGroups(libraryRoot, logger = console) {
  const groups = await discoverGroups(libraryRoot);

  if (groups.length === 0) {
    logger.log('No library groups found.');
    return;
  }

  logger.log('Available library groups:');

  for (const group of groups) {
    const types = [];
    const groupPath = path.join(libraryRoot, group);

    if (await exists(path.join(groupPath, 'commands'))) types.push('commands');
    if (await exists(path.join(groupPath, 'skills'))) types.push('skills');
    if (await exists(path.join(groupPath, 'agents'))) types.push('agents');

    logger.log(`  - ${group} (${types.join(', ')})`);
  }
}
