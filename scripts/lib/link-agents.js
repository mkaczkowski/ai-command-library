import path from 'path';
import { promises as fs } from 'fs';
import { AGENTS_SOURCE_ROOT } from './paths.js';
import { expandHomeDir } from './path-utils.js';
import { removeIfExists } from './fs-utils.js';

/** Orchestrates linking agents for a given provider. */
export async function linkAgents({ providerId, destination, mode, dryRun, logger = console }) {
  const supportedModes = new Set(['copy', 'symlink']);
  if (!supportedModes.has(mode)) {
    throw new Error(`Unsupported mode '${mode}'. Use copy or symlink.`);
  }

  const sourceRoot = AGENTS_SOURCE_ROOT;

  // Check if source directory exists
  try {
    await fs.access(sourceRoot);
  } catch {
    logger.log(`Agents source root not found at ${sourceRoot}. Skipping agents linking.`);
    return;
  }

  const destinationInput = destination;
  if (!destinationInput) {
    throw new Error(`No agents destination provided for provider '${providerId}'.`);
  }

  const expandedDestination = expandHomeDir(destinationInput);
  const destinationRoot = path.isAbsolute(expandedDestination)
    ? expandedDestination
    : path.resolve(process.cwd(), expandedDestination);

  logger.log(`Linking agents for provider '${providerId}' using mode '${mode}'.`);
  logger.log(`Source root: ${sourceRoot}`);
  logger.log(`Destination root: ${destinationRoot}`);

  // Get all agent files (*.md files in the agents directory)
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  const agentFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md')).map((entry) => entry.name);

  if (agentFiles.length === 0) {
    logger.log('No agents found in source root.');
    return;
  }

  // Link each agent file
  for (const agentFile of agentFiles) {
    const sourcePath = path.join(sourceRoot, agentFile);
    const destinationPath = path.join(destinationRoot, agentFile);

    await linkAgentFile({
      sourcePath,
      destinationPath,
      mode,
      dryRun,
      logger,
    });
  }

  logger.log(dryRun ? 'Dry run finished.' : 'Agents linked successfully.');
}

/** Links a single agent file by copying or symlinking it. */
async function linkAgentFile({ sourcePath, destinationPath, mode, dryRun, logger }) {
  // Remove destination if it exists
  await removeIfExists(destinationPath, { dryRun, logger });

  if (mode === 'copy') {
    await copyAgentFile(sourcePath, destinationPath, { dryRun, logger });
    return;
  }

  if (mode === 'symlink') {
    await symlinkAgentFile(sourcePath, destinationPath, { dryRun, logger });
  }
}

/** Copies a single agent file. */
async function copyAgentFile(source, destination, { dryRun, logger }) {
  if (dryRun) {
    logger.log(`[dry-run] copy ${source} -> ${destination}`);
    return;
  }

  // Create parent directory if needed
  await fs.mkdir(path.dirname(destination), { recursive: true });

  // Copy the file
  await fs.copyFile(source, destination);
  logger.log(`copy ${source} -> ${destination}`);
}

/** Creates a symlink to a single agent file. */
async function symlinkAgentFile(source, destination, { dryRun, logger }) {
  if (dryRun) {
    logger.log(`[dry-run] symlink ${destination} -> ${source}`);
    return;
  }

  // Create parent directory if needed
  await fs.mkdir(path.dirname(destination), { recursive: true });

  try {
    // Create the symlink
    await fs.symlink(source, destination);
    logger.log(`symlink ${destination} -> ${source}`);
  } catch (error) {
    if (process.platform === 'win32' && error.code === 'EACCES') {
      logger.warn(`Symlink not supported at ${destination}, falling back to copy. (${error.message})`);
      await copyAgentFile(source, destination, { dryRun: false, logger });
    } else {
      throw error;
    }
  }
}
