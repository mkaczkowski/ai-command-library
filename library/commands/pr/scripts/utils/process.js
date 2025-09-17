import {spawn} from 'child_process';
import {log} from './logger.js';

/**
 * Process execution helpers used by the GitHub scripts.
 */

/**
 * Spawn a child process and resolve with trimmed stdout, rejecting on error.
 * @param {string} command
 * @param {string[]} args
 * @param {{input?: string, env?: NodeJS.ProcessEnv}} [options]
 * @returns {Promise<string>}
 */
function run(command, args, {input, env} = {}) {
    const commandString = `${command} ${args.join(' ')}`;
    log('DEBUG', `Executing command: ${commandString}`);

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {...process.env, ...env},
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                log('DEBUG', `Command successful, stdout length: ${stdout.length}`);
                resolve(stdout.trim());
            } else {
                const message = stderr.trim() || stdout.trim() || `Command failed: ${commandString}`;
                log('ERROR', `Command failed: ${message}`);
                reject(new Error(message));
            }
        });

        child.on('error', (error) => {
            log('ERROR', `Command execution error: ${error.message}`);
            reject(error);
        });

        if (input !== undefined) {
            log('DEBUG', `Writing ${input.length} characters to stdin`);
            child.stdin.write(input);
            child.stdin.end();
        } else {
            child.stdin.end();
        }
    });
}

/**
 * Execute a GitHub CLI command with GH_PAGER disabled.
 * @param {string[]} args
 * @param {{input?: string, host?: string}} [options]
 * @returns {Promise<string>}
 */
async function runGh(args, {input, host} = {}) {
    const env = {GH_PAGER: ''};

    if (host) {
        // Include enterprise hostname when provided.
        args = ['--hostname', host, ...args];
        env.GH_HOST = host;
    }

    try {
        const result = await run('gh', args, {input, env});
        log('DEBUG', 'GitHub CLI command completed successfully');
        return result;
    } catch (error) {
        log('ERROR', `GitHub CLI command failed: ${error.message}`);
        throw error;
    }
}

/**
 * Execute a GitHub CLI command and parse JSON response.
 * @param {string[]} args
 * @param {{input?: string, host?: string}} [options]
 * @returns {Promise<any>}
 */
async function runGhJson(args, {input, host} = {}) {
    try {
        const result = await runGh(args, {input, host});
        return JSON.parse(result);
    } catch (error) {
        if (error.message.includes('Failed to parse JSON')) {
            throw error;
        }
        throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
}

/**
 * Check if a command is available in the system.
 * @param {string} command
 * @returns {Promise<boolean>}
 */
async function checkCommand(command) {
    try {
        await run(command, ['--version']);
        log('DEBUG', `${command} found`);
        return true;
    } catch (error) {
        log('ERROR', `${command} not found: ${error.message}`);
        return false;
    }
}

/**
 * Ensure the GitHub CLI is available, throwing a descriptive error otherwise.
 * @returns {Promise<boolean>}
 */
async function ensureGhCli() {
    const isAvailable = await checkCommand('gh');
    if (!isAvailable) {
        throw new Error('GitHub CLI not found. Please install gh cli: https://cli.github.com/');
    }
    return true;
}

export {run, runGh, runGhJson, checkCommand, ensureGhCli};
