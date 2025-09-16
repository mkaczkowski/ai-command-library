const REACTION_CONTENT_MAP = Object.freeze({
  '+1': 'THUMBS_UP',
  '-1': 'THUMBS_DOWN',
  laugh: 'LAUGH',
  hooray: 'HOORAY',
  confused: 'CONFUSED',
  heart: 'HEART',
  rocket: 'ROCKET',
  eyes: 'EYES',
});

const ALLOWED_REACTIONS = Object.freeze(Object.keys(REACTION_CONTENT_MAP));

/**
 * Normalize reaction names to lowercase to ensure consistent comparisons.
 * @param {string} value
 * @returns {string}
 */
function normalizeReactionName(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

/**
 * Resolve the GitHub API reaction content identifier for a reaction name.
 * @param {string} reactionName - Normalized reaction name
 * @returns {string|undefined}
 */
function mapReactionNameToContent(reactionName) {
  return REACTION_CONTENT_MAP[reactionName];
}

/**
 * Determine if the provided value is a supported reaction name.
 * @param {string} reaction
 * @returns {boolean}
 */
function isSupportedReaction(reaction) {
  if (!reaction) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(REACTION_CONTENT_MAP, reaction);
}

export { ALLOWED_REACTIONS, isSupportedReaction, mapReactionNameToContent, normalizeReactionName };
