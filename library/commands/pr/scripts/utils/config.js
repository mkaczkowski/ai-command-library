/**
 * Shared configuration constants consumed by the GitHub scripts.
 */

/**
 * CSV parsing defaults shared across comment utilities.
 */
export const ENHANCE_COMMENT_CSV_CONFIG = {
  REQUIRED_HEADERS: ['id', 'original', 'rewritten'],
  EXPECTED_COLUMNS: 3,
  CHARS: {
    QUOTE: '"',
    COMMA: ',',
    NEWLINE: '\n',
    CARRIAGE_RETURN: '\r',
  },
};

/**
 * CSV layout expected when creating review comments.
 */
export const REVIEW_COMMENT_CSV_CONFIG = {
  REQUIRED_HEADERS: ['path', 'position', 'body', 'line', 'startLine', 'side', 'startSide'],
  EXPECTED_COLUMNS: 7,
};

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
