import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SCRIPTS_ROOT = path.resolve(__dirname, '..');
export const PACKAGE_ROOT = path.resolve(SCRIPTS_ROOT, '..');
export const COMMAND_SOURCE_ROOT = path.join(PACKAGE_ROOT, 'library/commands');
export const SKILLS_SOURCE_ROOT = path.join(PACKAGE_ROOT, 'library/skills');
export const PROVIDERS_ROOT = path.join(PACKAGE_ROOT, 'providers');
