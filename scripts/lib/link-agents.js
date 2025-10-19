import { AGENTS_SOURCE_ROOT } from './paths.js';
import { linkResource } from './link-resource.js';

/** Orchestrates linking agents for a given provider. */
export async function linkAgents({ providerId, destination, mode, dryRun, logger = console }) {
  await linkResource({
    providerId,
    sourceRoot: AGENTS_SOURCE_ROOT,
    destination,
    mode,
    dryRun,
    resourceName: 'agents',
    resourceType: 'file',
    filterFn: (entry) => entry.isFile() && entry.name.endsWith('.md'),
    logger,
  });
}
