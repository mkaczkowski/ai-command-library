import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs, printHelp } from './lib/cli.js';
import { listProviders } from './lib/providers.js';
import { linkCommands } from './lib/link-service.js';

const __filename = fileURLToPath(import.meta.url);

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

  await linkCommands({
    providerId: args.provider,
    destination: args.destination,
    mode: args.mode,
    dryRun: args.dryRun,
  });
}

const executedDirectly = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (executedDirectly) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
