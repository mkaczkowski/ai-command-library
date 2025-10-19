import path from 'path';
import { COMMAND_SOURCE_ROOT } from './paths.js';
import { expandHomeDir } from './path-utils.js';
import { validateMode } from './link-utils.js';
import { buildDefaultMappings, loadProviderConfig } from './providers.js';
import { processMappings } from './mapping-processor.js';
import { linkSkills } from './link-skills.js';
import { linkAgents } from './link-agents.js';

/**
 * Infers destination for a resource given a custom commands destination.
 * If custom destination is provided, returns its parent directory (to keep resources at same level).
 * Otherwise returns the default target directory from config.
 */
function inferResourceDestination(customDestination, defaultTargetDir) {
  return customDestination ? path.dirname(customDestination) : defaultTargetDir;
}

/** Orchestrates linking commands, skills, and agents for a given provider. */
export async function linkForProvider({ providerId, destination, mode, dryRun, logger = console }) {
  validateMode(mode);

  const providerConfig = await loadProviderConfig(providerId);

  // Link commands
  await linkCommands({
    providerId,
    providerConfig,
    destination,
    mode,
    dryRun,
    logger,
  });

  // Link skills if provider supports them
  if (providerConfig.supportsSkills && providerConfig.defaultSkillsTargetDir) {
    const skillsDestination = inferResourceDestination(destination, providerConfig.defaultSkillsTargetDir);
    await linkSkills({
      providerId,
      destination: skillsDestination,
      mode,
      dryRun,
      logger,
    });
  }

  // Link agents if provider supports them
  if (providerConfig.supportsAgents && providerConfig.defaultAgentsTargetDir) {
    const agentsDestination = inferResourceDestination(destination, providerConfig.defaultAgentsTargetDir);
    await linkAgents({
      providerId,
      destination: agentsDestination,
      mode,
      dryRun,
      logger,
    });
  }
}

/** Orchestrates linking commands for a given provider. */
export async function linkCommands({
  providerId,
  providerConfig: providerConfigParam,
  destination,
  mode,
  dryRun,
  logger = console,
}) {
  validateMode(mode);

  const providerConfig = providerConfigParam || (await loadProviderConfig(providerId));
  const sourceRoot = COMMAND_SOURCE_ROOT;
  const destinationInput = destination ?? providerConfig.defaultCommandsTargetDir;
  if (!destinationInput) {
    throw new Error(`Provider '${providerId}' does not specify a default target directory.`);
  }

  const destinationDisplay = destinationInput;
  const commandsRootDisplay = destination ?? providerConfig.defaultCommandsTargetDir;
  const expandedDestination = expandHomeDir(destinationInput);
  const destinationRoot = path.isAbsolute(expandedDestination)
    ? expandedDestination
    : path.resolve(process.cwd(), expandedDestination);

  logger.log(`Linking commands for provider '${providerId}' using mode '${mode}'.`);
  logger.log(`Source root: ${sourceRoot}`);
  logger.log(`Destination root: ${destinationRoot}`);

  if (!providerConfig.mappings || !providerConfig.mappings.length) {
    providerConfig.mappings = await buildDefaultMappings(sourceRoot, providerConfig);
  }

  await processMappings({
    mappings: providerConfig.mappings,
    providerConfig,
    sourceRoot,
    destinationRoot,
    destinationDisplay,
    commandsRootDisplay,
    mode,
    dryRun,
    logger,
  });

  logger.log(dryRun ? 'Dry run finished.' : 'Commands linked successfully.');
}
