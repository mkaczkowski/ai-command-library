import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');

function expandHomeDir(targetPath) {
  if (!targetPath) return targetPath;
  if (targetPath === '~') return os.homedir();
  if (targetPath.startsWith('~/') || targetPath.startsWith('~\\')) {
    const suffix = targetPath.slice(2);
    return suffix ? path.join(os.homedir(), suffix) : os.homedir();
  }
  return targetPath;
}

function parseArgs(argv) {
  const args = { provider: 'claude', mode: 'copy', dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = () => {
      i += 1;
      return argv[i];
    };
    switch (token) {
      case '--provider':
      case '-p': {
        const value = next();
        if (!value) throw new Error('Missing value after --provider');
        args.provider = value;
        break;
      }
      case '--destination':
      case '--dest':
      case '-d': {
        const value = next();
        if (!value) throw new Error('Missing value after --destination');
        args.destination = value;
        break;
      }
      case '--mode':
      case '-m': {
        const value = next();
        if (!value) throw new Error('Missing value after --mode');
        args.mode = value;
        break;
      }
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--list-providers':
        args.listProviders = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }
  return args;
}

async function readJSON(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function listProviders() {
  const providersDir = path.join(PACKAGE_ROOT, 'providers');
  const entries = await fs.readdir(providersDir);
  const providers = [];
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const config = await readJSON(path.join(providersDir, entry));
    providers.push({ id: config.id, target: config.defaultTargetDir, label: config.label ?? '' });
  }
  if (!providers.length) {
    console.log('No providers configured yet.');
    return;
  }
  console.log('Available providers:');
  for (const provider of providers) {
    const label = provider.label ? ` (${provider.label})` : '';
    console.log(`- ${provider.id}${label}: ${provider.target}`);
  }
}

function printHelp() {
  console.log(
    `Usage: link-ai-commands [options]\n\n` +
      `Options:\n` +
      `  -p, --provider <name>    Provider configuration to use (default: claude)\n` +
      `  -d, --destination <dir> Override destination root (relative to cwd)\n` +
      `  -m, --mode <copy|symlink>  Transfer mode (default: copy)\n` +
      `      --dry-run            Print planned actions without writing\n` +
      `      --list-providers     Show bundled provider configs\n` +
      `  -h, --help               Show this help message\n`
  );
}

async function ensureProviderConfig(providerId) {
  const configPath = path.join(PACKAGE_ROOT, 'providers', `${providerId}.json`);
  try {
    await fs.access(configPath);
  } catch {
    throw new Error(`Provider configuration not found for '${providerId}'.`);
  }
  const config = await readJSON(configPath);
  if (!Array.isArray(config.mappings) || config.mappings.length === 0) {
    throw new Error(`Provider '${providerId}' has no mappings configured.`);
  }
  return config;
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function removeIfExists(targetPath, dryRun) {
  if (!(await pathExists(targetPath))) return;
  if (dryRun) {
    console.log(`[dry-run] remove ${targetPath}`);
    return;
  }
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function copyRecursive(source, destination, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] copy ${source} -> ${destination}`);
    return;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.cp(source, destination, { recursive: true });
}

async function createSymlink(source, destination, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] symlink ${destination} -> ${source}`);
    return;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const linkType = process.platform === 'win32' ? 'junction' : 'dir';
  try {
    await fs.symlink(source, destination, linkType);
  } catch (error) {
    if (process.platform === 'win32') {
      console.warn(`Symlink not supported at ${destination}, falling back to copy. (${error.message})`);
      await copyRecursive(source, destination, false);
    } else {
      throw error;
    }
  }
}

async function collectFilesRecursive(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFilesRecursive(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  files.sort();
  return files;
}

function flattenRelativePath(relativePath, delimiter = '__') {
  const normalized = splitSegments(relativePath);
  return normalized.join(delimiter);
}

function stripTemplateExtension(relativePath) {
  if (relativePath.endsWith('.template.md')) {
    return `${relativePath.slice(0, -'.template.md'.length)}.md`;
  }
  return relativePath;
}

async function copyFileWithDirs(source, destination, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] copy ${source} -> ${destination}`);
    return;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

async function createFileSymlink(source, destination, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] symlink ${destination} -> ${source}`);
    return;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const linkType = process.platform === 'win32' ? 'file' : undefined;
  try {
    await fs.symlink(source, destination, linkType);
  } catch (error) {
    if (process.platform === 'win32') {
      console.warn(`Symlink not supported at ${destination}, falling back to copy. (${error.message})`);
      await copyFileWithDirs(source, destination, false);
    } else {
      throw error;
    }
  }
}

function splitSegments(input) {
  if (!input) return [];
  return String(input)
    .split(/[/\\]/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function resolveFlattenOptions(flattenValue) {
  const options = { delimiter: '__', excludePrefixes: [] };
  if (!flattenValue || flattenValue === true) {
    return options;
  }
  if (typeof flattenValue === 'object') {
    if (typeof flattenValue.delimiter === 'string' && flattenValue.delimiter.length > 0) {
      options.delimiter = flattenValue.delimiter;
    }
    if (Array.isArray(flattenValue.excludePrefixes)) {
      options.excludePrefixes = flattenValue.excludePrefixes
        .map((prefix) => splitSegments(prefix))
        .filter((segments) => segments.length > 0);
    }
  }
  return options;
}

function shouldPreservePath(relativePath, excludePrefixes) {
  if (!excludePrefixes.length) return false;
  const segments = splitSegments(relativePath);
  return excludePrefixes.some((prefixSegments) => {
    if (prefixSegments.length > segments.length) return false;
    return prefixSegments.every((segment, index) => segments[index] === segment);
  });
}

const SCRIPT_PLACEHOLDER_PATTERN = /\{\{\s*script:([^}]+)\s*\}\}/g;
const PATH_PLACEHOLDER_PATTERN = /\{\{\s*path:([^}]+)\s*\}\}/g;

function combineDisplayPath(destinationDisplay, relativePath) {
  const normalizedRoot = destinationDisplay ? destinationDisplay.replace(/\\/g, '/') : '';
  const normalizedRelative = relativePath ? relativePath.replace(/\\/g, '/') : '';
  if (!normalizedRoot) return normalizedRelative;
  if (!normalizedRelative) return normalizedRoot;
  return normalizedRoot.endsWith('/')
    ? `${normalizedRoot}${normalizedRelative}`
    : `${normalizedRoot}/${normalizedRelative}`;
}

function resolveDestinationRelativePath(providerConfig, relativePath) {
  const normalized = splitSegments(relativePath).join('/');
  for (const mapping of providerConfig.mappings) {
    const mappingSource = splitSegments(mapping.source ?? '').join('/');
    if (!mappingSource) continue;
    if (normalized === mappingSource || normalized.startsWith(`${mappingSource}/`)) {
      const remainder = normalized === mappingSource ? '' : normalized.slice(mappingSource.length + 1);
      if (!mapping.flatten) {
        const targetBase = mapping.target
          ? splitSegments(mapping.target).join('/')
          : mappingSource;
        const combined = remainder ? `${targetBase}/${remainder}` : targetBase;
        return stripTemplateExtension(combined);
      }
      const options = resolveFlattenOptions(mapping.flatten);
      if (shouldPreservePath(remainder, options.excludePrefixes)) {
        const targetBase = mapping.target ? splitSegments(mapping.target).join('/') : '';
        if (!targetBase) return stripTemplateExtension(remainder);
        const combined = remainder ? `${targetBase}/${remainder}` : targetBase;
        return stripTemplateExtension(combined);
      }
      const flattenInput = remainder ? `${mappingSource}/${remainder}` : mappingSource;
      const flattenedName = stripTemplateExtension(
        flattenRelativePath(flattenInput, options.delimiter)
      );
      const targetBase = mapping.target ? splitSegments(mapping.target).join('/') : '';
      return targetBase ? `${targetBase}/${flattenedName}` : flattenedName;
    }
  }
  throw new Error(
    `Unable to resolve script placeholder '${relativePath}' for provider '${providerConfig.id ?? 'unknown'}'.`
  );
}

function replaceMarkdownPlaceholders(content, { providerConfig, destinationDisplay, displayPaths }) {
  let hasDynamicContent = false;

  let replaced = content.replace(SCRIPT_PLACEHOLDER_PATTERN, (_, rawPath) => {
    hasDynamicContent = true;
    const normalizedPath = rawPath.trim();
    if (!normalizedPath) {
      throw new Error('Encountered empty script placeholder.');
    }
    const resolvedRelative = resolveDestinationRelativePath(providerConfig, normalizedPath);
    return combineDisplayPath(destinationDisplay, resolvedRelative);
  });

  replaced = replaced.replace(PATH_PLACEHOLDER_PATTERN, (_, rawKey) => {
    hasDynamicContent = true;
    const key = rawKey.trim();
    if (!key) {
      throw new Error('Encountered empty path placeholder.');
    }
    const value = displayPaths[key];
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(
        `Unknown path placeholder '${key}' for provider '${providerConfig.id ?? 'unknown'}'.`
      );
    }
    return value;
  });

  SCRIPT_PLACEHOLDER_PATTERN.lastIndex = 0;
  PATH_PLACEHOLDER_PATTERN.lastIndex = 0;

  return { replaced, hasDynamicContent };
}

let warnedSymlinkFallback = false;

async function transferFile({
  args,
  destinationFile,
  providerConfig,
  destinationDisplay,
  displayPaths,
  sourceFile,
}) {
  const extension = path.extname(sourceFile).toLowerCase();
  const isMarkdown = extension === '.md';

  if (isMarkdown) {
    const content = await fs.readFile(sourceFile, 'utf8');
    const { replaced, hasDynamicContent } = replaceMarkdownPlaceholders(content, {
      providerConfig,
      destinationDisplay,
      displayPaths,
    });
    if (args.mode === 'symlink' && hasDynamicContent && !warnedSymlinkFallback) {
      console.warn('Symlink mode not supported for markdown with embedded placeholders. Falling back to copy.');
      warnedSymlinkFallback = true;
    }
    if (args.dryRun) {
      console.log(`[dry-run] write ${destinationFile}`);
      return;
    }
    await fs.mkdir(path.dirname(destinationFile), { recursive: true });
    await fs.writeFile(destinationFile, replaced, 'utf8');
    return;
  }

  if (args.mode === 'copy') {
    await copyFileWithDirs(sourceFile, destinationFile, args.dryRun);
    return;
  }

  await createFileSymlink(sourceFile, destinationFile, args.dryRun);
}

async function processFlattenMapping({
  args,
  mapping,
  providerConfig,
  sourcePath,
  targetRoot,
  destinationDisplay,
  displayPaths,
}) {
  const { delimiter, excludePrefixes } = resolveFlattenOptions(mapping.flatten);
  const seen = new Set();
  const mappingSourceSegments = splitSegments(mapping.source ?? '');
  const files = await collectFilesRecursive(sourcePath);
  for (const absoluteFile of files) {
    const relativeToMappingRoot = path.relative(sourcePath, absoluteFile);
    const relativeSegments = splitSegments(relativeToMappingRoot);
    const normalizedRelative = relativeSegments.join('/');
    const relativeWithMapping = [...mappingSourceSegments, ...relativeSegments].join('/');
    const flattenedName = flattenRelativePath(relativeWithMapping, delimiter);
    if (!flattenedName) {
      throw new Error(`Unable to compute flattened name for ${absoluteFile}`);
    }

    const destinationRelativePreserved = stripTemplateExtension(normalizedRelative);
    const destinationRelativeFlattened = stripTemplateExtension(flattenedName);

    if (shouldPreservePath(normalizedRelative, excludePrefixes)) {
      const legacyFlattenedPath = path.join(targetRoot, flattenedName);
      await removeIfExists(legacyFlattenedPath, args.dryRun);

      const destinationFile = path.join(targetRoot, ...destinationRelativePreserved.split('/'));
      await removeIfExists(destinationFile, args.dryRun);
      await transferFile({
        args,
        destinationDisplay,
        destinationFile,
        providerConfig,
        displayPaths,
        sourceFile: absoluteFile,
      });
      continue;
    }

    if (seen.has(destinationRelativeFlattened)) {
      throw new Error(`Flattened filename collision detected: ${destinationRelativeFlattened}`);
    }
    seen.add(destinationRelativeFlattened);

    const destinationFile = path.join(targetRoot, ...destinationRelativeFlattened.split('/'));
    await removeIfExists(destinationFile, args.dryRun);
    await transferFile({
      args,
      destinationDisplay,
      destinationFile,
      providerConfig,
      displayPaths,
      sourceFile: absoluteFile,
    });
  }
}

async function processStandardMapping({
  args,
  mapping,
  providerConfig,
  sourcePath,
  destinationRoot,
  destinationDisplay,
  displayPaths,
}) {
  const targetBase = path.join(destinationRoot, mapping.target ?? mapping.source);
  await removeIfExists(targetBase, args.dryRun);

  const files = await collectFilesRecursive(sourcePath);
  for (const absoluteFile of files) {
    const relativeToMappingRoot = path.relative(sourcePath, absoluteFile);
    const relativeSegments = splitSegments(relativeToMappingRoot);
    const normalizedRelative = relativeSegments.join('/');
    const destinationRelative = stripTemplateExtension(normalizedRelative);
    const destinationFile = path.join(targetBase, ...destinationRelative.split('/'));
    await transferFile({
      args,
      destinationDisplay,
      destinationFile,
      providerConfig,
      displayPaths,
      sourceFile: absoluteFile,
    });
  }
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  warnedSymlinkFallback = false;

  if (args.help) {
    printHelp();
    return;
  }

  if (args.listProviders) {
    await listProviders();
    return;
  }

  const supportedModes = new Set(['copy', 'symlink']);
  if (!supportedModes.has(args.mode)) {
    throw new Error(`Unsupported mode '${args.mode}'. Use copy or symlink.`);
  }

  const providerConfig = await ensureProviderConfig(args.provider);
  const sourceRoot = path.join(PACKAGE_ROOT, providerConfig.sourceRoot ?? 'library/commands');
  const destinationInput = args.destination ?? providerConfig.defaultTargetDir;
  if (!destinationInput) {
    throw new Error(`Provider '${args.provider}' does not specify a default target directory.`);
  }
  const destinationDisplay = destinationInput;
  const displayPaths = { ...(providerConfig.displayPaths ?? {}) };
  if (args.destination) {
    displayPaths.commandsRoot = args.destination;
  } else if (!displayPaths.commandsRoot) {
    displayPaths.commandsRoot = destinationDisplay;
  }
  const expandedDestination = expandHomeDir(destinationInput);
  const destinationRoot = path.isAbsolute(expandedDestination)
    ? expandedDestination
    : path.resolve(process.cwd(), expandedDestination);

  console.log(`Linking commands for provider '${args.provider}' using mode '${args.mode}'.`);
  console.log(`Source root: ${sourceRoot}`);
  console.log(`Destination root: ${destinationRoot}`);

  for (const mapping of providerConfig.mappings) {
    const sourcePath = path.join(sourceRoot, mapping.source);
    if (!(await pathExists(sourcePath))) {
      throw new Error(`Missing source path: ${sourcePath}`);
    }

    if (mapping.flatten) {
      const flattenTargetRoot = mapping.target
        ? path.join(destinationRoot, mapping.target)
        : destinationRoot;
      await processFlattenMapping({
        args,
        mapping,
        providerConfig,
        sourcePath,
        targetRoot: flattenTargetRoot,
        destinationDisplay,
        displayPaths,
      });
      continue;
    }

    await processStandardMapping({
      args,
      mapping,
      providerConfig,
      sourcePath,
      destinationRoot,
      destinationDisplay,
      displayPaths,
    });
  }

  console.log(args.dryRun ? 'Dry run finished.' : 'Commands linked successfully.');
}

const executedDirectly = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (executedDirectly) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
