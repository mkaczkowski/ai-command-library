import path from 'path';
import { COMMAND_SOURCE_ROOT } from './paths.js';
import { expandHomeDir } from './path-utils.js';
import { loadProviderConfig, buildDefaultMappings } from './providers.js';
import { processMappings } from './mapping-processor.js';

/** Orchestrates linking commands for a given provider. */
export async function linkCommands({
  providerId,
  destination,
  mode,
  dryRun,
  logger = console,
}) {
  const supportedModes = new Set(['copy', 'symlink']);
  if (!supportedModes.has(mode)) {
    throw new Error(`Unsupported mode '${mode}'. Use copy or symlink.`);
  }

  const providerConfig = await loadProviderConfig(providerId);
  const sourceRoot = COMMAND_SOURCE_ROOT;
  const destinationInput = destination ?? providerConfig.defaultTargetDir;
  if (!destinationInput) {
    throw new Error(`Provider '${providerId}' does not specify a default target directory.`);
  }

  const destinationDisplay = destinationInput;
  const commandsRootDisplay = destination ?? providerConfig.defaultTargetDir;
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
