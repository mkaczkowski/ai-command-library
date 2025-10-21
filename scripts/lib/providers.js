import { promises as fs } from 'fs';
import path from 'path';
import { PROVIDERS_ROOT } from './paths.js';
import { getPluginGroups } from './plugin-groups.js';
import { exists } from './path-utils.js';

/** Reads a JSON file and returns the parsed object. */
async function readJSON(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

/** Clones provider-level flatten configuration to avoid mutation. */
function cloneFlattenConfig(flattenValue) {
  if (!flattenValue || flattenValue === true) return flattenValue;
  if (typeof flattenValue !== 'object') return flattenValue;
  const clone = {};
  if (typeof flattenValue.delimiter === 'string') {
    clone.delimiter = flattenValue.delimiter;
  }
  if (Array.isArray(flattenValue.excludePrefixes)) {
    clone.excludePrefixes = [...flattenValue.excludePrefixes];
  }
  return clone;
}

/** Lists available provider configurations to stdout. */
export async function listProviders(logger = console) {
  const entries = await fs.readdir(PROVIDERS_ROOT);
  const providers = [];
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const config = await readJSON(path.join(PROVIDERS_ROOT, entry));
    providers.push({ id: config.id, target: config.defaultCommandsTargetDir, label: config.label ?? '' });
  }
  if (!providers.length) {
    logger.log('No providers configured yet.');
    return;
  }
  logger.log('Available providers:');
  for (const provider of providers) {
    const label = provider.label ? ` (${provider.label})` : '';
    logger.log(`- ${provider.id}${label}: ${provider.target}`);
  }
}

/** Loads a provider configuration by identifier. */
export async function loadProviderConfig(providerId) {
  const configPath = path.join(PROVIDERS_ROOT, `${providerId}.json`);
  try {
    await fs.access(configPath);
  } catch {
    throw new Error(`Provider configuration not found for '${providerId}'.`);
  }
  return readJSON(configPath);
}

/**
 * Generates default mappings when none are defined in config.
 * CHANGED: Now scans plugin groups for commands subdirectories.
 */
export async function buildDefaultMappings(pluginsRoot, providerConfig, selectedPlugins) {
  // Get plugin groups to process
  const groups = await getPluginGroups(pluginsRoot, selectedPlugins);
  const mappings = [];

  // For each group, check if it has a commands subdirectory
  for (const group of groups) {
    const commandsPath = path.join(pluginsRoot, group, 'commands');

    if (await exists(commandsPath)) {
      const mapping = {
        source: `${group}/commands`,
      };

      // Set target based on group name
      // For 'common', we don't set a target (files go to root of destination)
      // For other groups, target is the group name
      if (group !== 'common') {
        mapping.target = group;
      }

      // Apply flatten config if specified at provider level
      if (providerConfig?.flatten) {
        mapping.flatten = cloneFlattenConfig(providerConfig.flatten);
      }

      mappings.push(mapping);
    }
  }

  return mappings;
}
