import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SCRIPTS_ROOT = path.resolve(__dirname, '..');
export const PACKAGE_ROOT = path.resolve(SCRIPTS_ROOT, '..');
export const LIBRARY_ROOT = path.join(PACKAGE_ROOT, 'library');
export const PROVIDERS_ROOT = path.join(PACKAGE_ROOT, 'providers');
