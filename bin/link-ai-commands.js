#!/usr/bin/env node
import { main } from '../scripts/link-commands.js';

main().catch((error) => {
  const message = error?.stack ?? error?.message ?? String(error);
  console.error(message);
  process.exit(1);
});
