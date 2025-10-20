/** Parses CLI arguments for the link commands tool. */
export function parseArgs(argv) {
  const args = { mode: 'copy', dryRun: false };
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
      case '--folders':
      case '-f': {
        const value = next();
        if (!value) throw new Error('Missing value after --folders');
        args.folders = value
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean);
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
      case '--list-groups':
        args.listGroups = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }
  if (!args.provider && !args.listGroups && !args.help && !args.listProviders) {
    throw new Error('Missing required option --provider <name>.');
  }
  return args;
}

/** Prints usage information for the link commands tool. */
export function printHelp(logger = console) {
  logger.log(
    `Usage: link-ai-commands [options]\n\n` +
      `Options:\n` +
      `  -p, --provider <name>      Provider configuration to use (required)\n` +
      `  -f, --folders <list>       Comma-separated list of library groups to install\n` +
      `                             (e.g., "debugger,pr"). Omit to install all groups.\n` +
      `  -m, --mode <copy|symlink>  Transfer mode (default: copy)\n` +
      `      --dry-run              Print planned actions without writing\n` +
      `      --list-providers       Show bundled provider configs\n` +
      `      --list-groups          Show available library groups\n` +
      `  -h, --help                 Show this help message\n`
  );
}
