import { SKILLS_SOURCE_ROOT } from './paths.js';
import { linkResource } from './link-resource.js';

/** Orchestrates linking skills for a given provider. */
export async function linkSkills({ providerId, destination, mode, dryRun, logger = console }) {
  await linkResource({
    providerId,
    sourceRoot: SKILLS_SOURCE_ROOT,
    destination,
    mode,
    dryRun,
    resourceName: 'skills',
    resourceType: 'directory',
    filterFn: (entry) => entry.isDirectory(),
    logger,
  });
}
