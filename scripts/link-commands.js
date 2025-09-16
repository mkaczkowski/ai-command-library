import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');

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
  console.log(`Usage: link-ai-commands [options]\n\n` +
    `Options:\n` +
    `  -p, --provider <name>    Provider configuration to use (default: claude)\n` +
    `  -d, --destination <dir> Override destination root (relative to cwd)\n` +
    `  -m, --mode <copy|symlink>  Transfer mode (default: copy)\n` +
    `      --dry-run            Print planned actions without writing\n` +
    `      --list-providers     Show bundled provider configs\n` +
    `  -h, --help               Show this help message\n`);
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
  await fs.symlink(source, destination, 'dir');
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

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
  const destinationRoot = path.resolve(process.cwd(), args.destination ?? providerConfig.defaultTargetDir);

  console.log(`Linking commands for provider '${args.provider}' using mode '${args.mode}'.`);
  console.log(`Source root: ${sourceRoot}`);
  console.log(`Destination root: ${destinationRoot}`);

  for (const mapping of providerConfig.mappings) {
    const sourcePath = path.join(sourceRoot, mapping.source);
    const destinationPath = path.join(destinationRoot, mapping.target ?? mapping.source);
    if (!(await pathExists(sourcePath))) {
      throw new Error(`Missing source path: ${sourcePath}`);
    }

    await removeIfExists(destinationPath, args.dryRun);

    if (args.mode === 'copy') {
      await copyRecursive(sourcePath, destinationPath, args.dryRun);
    } else {
      await createSymlink(sourcePath, destinationPath, args.dryRun);
    }
  }

  console.log(args.dryRun ? 'Dry run finished.' : 'Commands linked successfully.');
}

const executedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === __filename;

if (executedDirectly) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
