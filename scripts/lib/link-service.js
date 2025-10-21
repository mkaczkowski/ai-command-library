import path from 'path';
import { PLUGINS_ROOT } from './paths.js';
import { expandHomeDir } from './path-utils.js';
import { validateMode } from './link-utils.js';
import { buildDefaultMappings, loadProviderConfig } from './providers.js';
import { processMappings } from './mapping-processor.js';
import { linkSkills } from './link-skills.js';
import { linkAgents } from './link-agents.js';

/** Orchestrates linking commands, skills, and agents for a given provider. */
export async function linkForProvider({ providerId, mode, dryRun, selectedPlugins, logger = console }) {
  validateMode(mode);

  const providerConfig = await loadProviderConfig(providerId);

  // Link commands
  await linkCommands({
    providerId,
    providerConfig,
    mode,
    dryRun,
    selectedPlugins,
    logger,
  });

  // Link skills if provider supports them
  if (providerConfig.supportsSkills && providerConfig.defaultSkillsTargetDir) {
    await linkSkills({
      providerId,
      destination: providerConfig.defaultSkillsTargetDir,
      mode,
      dryRun,
      selectedPlugins,
      logger,
    });
  }

  // Link agents if provider supports them
  if (providerConfig.supportsAgents && providerConfig.defaultAgentsTargetDir) {
    await linkAgents({
      providerId,
      destination: providerConfig.defaultAgentsTargetDir,
      mode,
      dryRun,
      selectedPlugins,
      logger,
    });
  }
}

/** Orchestrates linking commands for a given provider. */
export async function linkCommands({
  providerId,
  providerConfig: providerConfigParam,
  mode,
  dryRun,
  selectedPlugins,
  logger = console,
}) {
  validateMode(mode);

  const providerConfig = providerConfigParam || (await loadProviderConfig(providerId));
  const sourceRoot = PLUGINS_ROOT;
  const destinationInput = providerConfig.defaultCommandsTargetDir;
  if (!destinationInput) {
    throw new Error(`Provider '${providerId}' does not specify a default target directory.`);
  }

  const destinationDisplay = destinationInput;
  const commandsRootDisplay = providerConfig.defaultCommandsTargetDir;
  const expandedDestination = expandHomeDir(destinationInput);
  const destinationRoot = path.isAbsolute(expandedDestination)
    ? expandedDestination
    : path.resolve(process.cwd(), expandedDestination);

  logger.log(`Linking commands for provider '${providerId}' using mode '${mode}'.`);
  logger.log(`Source root: ${sourceRoot}`);
  logger.log(`Destination root: ${destinationRoot}`);

  if (!providerConfig.mappings || !providerConfig.mappings.length) {
    providerConfig.mappings = await buildDefaultMappings(sourceRoot, providerConfig, selectedPlugins);
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
