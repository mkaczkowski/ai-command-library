/**
 * Shared configuration constants consumed by the GitHub scripts.
 */

/**
 * GraphQL pagination caps used when fetching review data.
 */
export const PAGINATION_LIMITS = {
  THREADS: 50,
  COMMENTS: 20,
  REACTIONS: 2,
};

/**
 * Boolean flags recognised by the shared CLI helpers.
 */
export const COMMON_BOOLEAN_FLAGS = ['--verbose', '--help', '-h'];
