import { run, runGhJson } from "./process.js";
import { log } from "./logger.js";

/**
 * Repository helpers for translating CLI input into owner/repo coordinates.
 */

/**
 * Parse a repository identifier (URL, SSH, or slug) into its components.
 * @param {string} value
 * @returns {{host: string, owner: string, repo: string}|null}
 */
function parseRepositoryString(value) {
  log("DEBUG", `Parsing repository string: ${value}`);

  if (!value) {
    log("DEBUG", "Empty repository string provided");
    return null;
  }

  const trimmed = value.trim();

  const sshMatch = trimmed.match(/^(?:git@|ssh:\/\/git@)([^:/]+)[:/]([^/]+)\/(.+)$/);
  if (sshMatch) {
    const result = {
      host: sshMatch[1],
      owner: sshMatch[2],
      repo: sanitizeRepo(sshMatch[3]),
    };
    log("DEBUG", "SSH format parsed", result);
    return result;
  }

  const httpMatch = trimmed.match(/^https?:\/\/([^/]+)\/([^/]+)\/(.+)$/);
  if (httpMatch) {
    const result = {
      host: httpMatch[1],
      owner: httpMatch[2],
      repo: sanitizeRepo(httpMatch[3]),
    };
    log("DEBUG", "HTTP format parsed");
    return result;
  }

  const slugMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (slugMatch) {
    log("DEBUG", "Matched owner/repo slug format");
    const result = {
      host: "github.com",
      owner: slugMatch[1],
      repo: sanitizeRepo(slugMatch[2]),
    };
    return result;
  }

  log("DEBUG", "No matching repository format found");
  return null;
}

/**
 * Strip optional .git suffix from a repository name.
 * @param {string} value
 * @returns {string}
 */
function sanitizeRepo(value) {
  return value.replace(/\.git$/i, "");
}

/**
 * Resolve repository coordinates from CLI input or the current git remote.
 * @param {string|undefined} repoArg
 * @returns {Promise<{host: string, owner: string, repo: string}>}
 */
async function resolveRepository(repoArg) {
  if (repoArg) {
    log("DEBUG", `Using provided repository: ${repoArg}`);
    const parsed = parseRepositoryString(repoArg);
    if (!parsed) {
      log("ERROR", `Unable to parse repository: ${repoArg}`);
      throw new Error(`Unable to parse repository: ${repoArg}`);
    }
    log("DEBUG", "Repository parsed successfully", parsed);
    return parsed;
  }

  log("DEBUG", "Auto-detecting repository from git remote");
  try {
    const remoteUrl = await run("git", ["remote", "get-url", "origin"]);
    log("DEBUG", `Git remote URL: ${remoteUrl}`);

    const parsed = parseRepositoryString(remoteUrl);
    if (!parsed) {
      log("ERROR", "Failed to parse git remote URL");
      throw new Error("Failed to detect repository from git remote");
    }

    log("DEBUG", "Repository detected successfully", parsed);
    return parsed;
  } catch (error) {
    log("ERROR", `Git remote detection failed: ${error.message}`);
    throw new Error(`Failed to detect repository from git remote: ${error.message}`);
  }
}

/**
 * Detect the pull request number associated with the current branch.
 * @returns {Promise<number>}
 */
async function getCurrentPRNumber() {
  try {
    const result = await runGhJson(["pr", "view", "--json", "number"]);
    const prNumber = result.number;
    if (prNumber && !isNaN(prNumber)) {
      log("DEBUG", `Auto-detected PR number: ${prNumber}`);
      return prNumber;
    }
    throw new Error("Failed to parse PR number from gh pr view");
  } catch (error) {
    throw new Error(`No PR found for current branch: ${error.message}`);
  }
}

export { parseRepositoryString, sanitizeRepo, resolveRepository, getCurrentPRNumber };
