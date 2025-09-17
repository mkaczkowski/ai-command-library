import { promises as fs } from 'fs';
import path from 'path';
import { PROVIDERS_ROOT } from './paths.js';

async function readJSON(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

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

export async function listProviders(logger = console) {
  const entries = await fs.readdir(PROVIDERS_ROOT);
  const providers = [];
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const config = await readJSON(path.join(PROVIDERS_ROOT, entry));
    providers.push({ id: config.id, target: config.defaultTargetDir, label: config.label ?? '' });
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

export async function loadProviderConfig(providerId) {
  const configPath = path.join(PROVIDERS_ROOT, `${providerId}.json`);
  try {
    await fs.access(configPath);
  } catch {
    throw new Error(`Provider configuration not found for '${providerId}'.`);
  }
  return readJSON(configPath);
}

export async function buildDefaultMappings(sourceRoot, providerConfig) {
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  const flattenConfig = providerConfig?.flatten;
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const mapping = { source: entry.name };
      if (flattenConfig) {
        mapping.flatten = cloneFlattenConfig(flattenConfig);
      }
      return mapping;
    });
}
