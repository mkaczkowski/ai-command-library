import path from 'path';
import { COMMAND_SOURCE_ROOT } from './paths.js';
import { expandHomeDir } from './path-utils.js';
import { buildDefaultMappings, loadProviderConfig } from './providers.js';
import { processMappings } from './mapping-processor.js';
import { linkSkills } from './link-skills.js';
import { linkAgents } from './link-agents.js';

/** Orchestrates linking commands, skills, and agents for a given provider. */
export async function linkForProvider({ providerId, destination, mode, dryRun, logger = console }) {
  const supportedModes = new Set(['copy', 'symlink']);
  if (!supportedModes.has(mode)) {
    throw new Error(`Unsupported mode '${mode}'. Use copy or symlink.`);
  }

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
    const skillsDestination = destination
      ? path.dirname(destination) // If custom destination, infer skills dir from commands dir
      : providerConfig.defaultSkillsTargetDir;

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
    const agentsDestination = destination
      ? path.dirname(destination) // If custom destination, infer agents dir from commands dir
      : providerConfig.defaultAgentsTargetDir;

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
  const supportedModes = new Set(['copy', 'symlink']);
  if (!supportedModes.has(mode)) {
    throw new Error(`Unsupported mode '${mode}'. Use copy or symlink.`);
  }

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
