import path from 'path';
import { promises as fs } from 'fs';
import { SKILLS_SOURCE_ROOT } from './paths.js';
import { expandHomeDir } from './path-utils.js';
import { removeIfExists, collectFilesRecursive } from './fs-utils.js';

/** Orchestrates linking skills for a given provider. */
export async function linkSkills({ providerId, destination, mode, dryRun, logger = console }) {
  const supportedModes = new Set(['copy', 'symlink']);
  if (!supportedModes.has(mode)) {
    throw new Error(`Unsupported mode '${mode}'. Use copy or symlink.`);
  }

  const sourceRoot = SKILLS_SOURCE_ROOT;

  // Check if source directory exists
  try {
    await fs.access(sourceRoot);
  } catch {
    logger.log(`Skills source root not found at ${sourceRoot}. Skipping skills linking.`);
    return;
  }

  const destinationInput = destination;
  if (!destinationInput) {
    throw new Error(`No skills destination provided for provider '${providerId}'.`);
  }

  const expandedDestination = expandHomeDir(destinationInput);
  const destinationRoot = path.isAbsolute(expandedDestination)
    ? expandedDestination
    : path.resolve(process.cwd(), expandedDestination);

  logger.log(`Linking skills for provider '${providerId}' using mode '${mode}'.`);
  logger.log(`Source root: ${sourceRoot}`);
  logger.log(`Destination root: ${destinationRoot}`);

  // Get all skill directories
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  const skillDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  if (skillDirs.length === 0) {
    logger.log('No skills found in source root.');
    return;
  }

  // Link each skill directory
  for (const skillDir of skillDirs) {
    const sourcePath = path.join(sourceRoot, skillDir);
    const destinationPath = path.join(destinationRoot, skillDir);

    await linkSkillDirectory({
      sourcePath,
      destinationPath,
      mode,
      dryRun,
      logger,
    });
  }

  logger.log(dryRun ? 'Dry run finished.' : 'Skills linked successfully.');
}

/** Links a single skill directory by copying or symlinking it. */
async function linkSkillDirectory({ sourcePath, destinationPath, mode, dryRun, logger }) {
  // Remove destination if it exists
  await removeIfExists(destinationPath, { dryRun, logger });

  if (mode === 'copy') {
    await copySkillDirectory(sourcePath, destinationPath, { dryRun, logger });
    return;
  }

  if (mode === 'symlink') {
    await symlinkSkillDirectory(sourcePath, destinationPath, { dryRun, logger });
  }
}

/** Copies an entire skill directory recursively. */
async function copySkillDirectory(source, destination, { dryRun, logger }) {
  if (dryRun) {
    logger.log(`[dry-run] copy directory ${source} -> ${destination}`);
    return;
  }

  // Create destination directory
  await fs.mkdir(destination, { recursive: true });

  // Collect all files and copy them
  const files = await collectFilesRecursive(source);
  for (const sourceFile of files) {
    const relativeFile = path.relative(source, sourceFile);
    const destinationFile = path.join(destination, relativeFile);

    // Create parent directories if needed
    await fs.mkdir(path.dirname(destinationFile), { recursive: true });

    // Copy the file
    await fs.copyFile(sourceFile, destinationFile);
  }

  logger.log(`copy directory ${source} -> ${destination}`);
}

/** Creates a symlink to the entire skill directory. */
async function symlinkSkillDirectory(source, destination, { dryRun, logger }) {
  if (dryRun) {
    logger.log(`[dry-run] symlink ${destination} -> ${source}`);
    return;
  }

  // Create parent directory if needed
  await fs.mkdir(path.dirname(destination), { recursive: true });

  try {
    // Create the symlink
    const linkType = process.platform === 'win32' ? 'dir' : undefined;
    await fs.symlink(source, destination, linkType);
    logger.log(`symlink ${destination} -> ${source}`);
  } catch (error) {
    if (process.platform === 'win32' && error.code === 'EACCES') {
      logger.warn(`Symlink not supported at ${destination}, falling back to copy. (${error.message})`);
      await copySkillDirectory(source, destination, { dryRun: false, logger });
    } else {
      throw error;
    }
  }
}
