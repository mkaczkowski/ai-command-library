#!/bin/bash

# Collects PR state as structured JSON for the babysit-pr skill.
# Usage: collect-pr-state.sh [PR_NUMBER]

set -euo pipefail

PR_INPUT="${1:-}"

# Extract numeric PR number from URL if needed (gh pr view accepts URLs, but GraphQL needs Int)
if [[ "$PR_INPUT" =~ /pull/([0-9]+) ]]; then
  PR_NUMBER="${BASH_REMATCH[1]}"
else
  PR_NUMBER="$PR_INPUT"
fi

if [[ -z "$PR_NUMBER" ]]; then
  PR_NUMBER=$(gh pr list --head "$(git branch --show-current 2>/dev/null)" --json number --jq '.[0].number' 2>/dev/null || true)
fi

if [[ -z "$PR_NUMBER" ]]; then
  echo '{"error":"No PR number provided and no PR found for current branch"}' >&2
  exit 1
fi

# Fetch all data in parallel (4 calls)
PR_FILE=$(mktemp) CHECKS_FILE=$(mktemp) COMMENTS_FILE=$(mktemp) ISSUE_COMMENTS_FILE=$(mktemp) REPO_FILE=$(mktemp)
trap 'rm -f "$PR_FILE" "$CHECKS_FILE" "$COMMENTS_FILE" "$ISSUE_COMMENTS_FILE" "$REPO_FILE"' EXIT

gh repo view --json nameWithOwner --jq '.nameWithOwner' >"$REPO_FILE" 2>/dev/null &
gh pr view "$PR_NUMBER" --json number,title,state,isDraft,url,headRefName,baseRefName,author,createdAt,updatedAt,mergeable,reviewDecision,additions,deletions,changedFiles,commits,labels,reviewRequests >"$PR_FILE" 2>/dev/null &
gh pr checks "$PR_NUMBER" --json name,state,bucket,description,startedAt,completedAt,link >"$CHECKS_FILE" 2>/dev/null &
gh pr view "$PR_NUMBER" --json comments --jq '[.comments[] | {id: .id, body: .body, user: .author.login, createdAt: .createdAt}]' >"$ISSUE_COMMENTS_FILE" 2>/dev/null &
wait

REPO=$(cat "$REPO_FILE")
PR=$(cat "$PR_FILE")
CHECKS=$(cat "$CHECKS_FILE")

if [[ -z "$PR" ]]; then
  echo '{"error":"Could not fetch PR data"}' >&2
  exit 1
fi

# Detect GHE hostname from PR URL (needed for GraphQL on non-github.com hosts)
PR_URL=$(echo "$PR" | jq -r '.url')
GH_HOSTNAME=$(echo "$PR_URL" | sed -n 's|https\{0,1\}://\([^/]*\)/.*|\1|p')
GH_HOST_FLAG=""
if [[ "$GH_HOSTNAME" != "github.com" && -n "$GH_HOSTNAME" ]]; then
  GH_HOST_FLAG="--hostname $GH_HOSTNAME"
fi

# Fetch review threads via GraphQL (gives isResolved + isOutdated)
OWNER="${REPO%%/*}"
REPO_NAME="${REPO##*/}"
gh api graphql $GH_HOST_FLAG -F owner="$OWNER" -F repo="$REPO_NAME" -F pr="$PR_NUMBER" -f query='
query($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      reviewThreads(first: 100) {
        nodes {
          isResolved
          isOutdated
          path
          line
          comments(first: 10) {
            nodes {
              body
              author { login }
              createdAt
            }
          }
        }
      }
    }
  }
}' --jq '[.data.repository.pullRequest.reviewThreads.nodes[] | {
  isResolved,
  isOutdated,
  path,
  line,
  comments: [.comments.nodes[] | {body, user: .author.login, createdAt}]
}]' >"$COMMENTS_FILE" 2>/dev/null || true

THREADS=$(cat "$COMMENTS_FILE")
ISSUE_COMMENTS=$(cat "$ISSUE_COMMENTS_FILE")
[[ -z "$CHECKS" ]]          && CHECKS="[]"          || true
[[ -z "$THREADS" ]]         && THREADS="[]"         || true
[[ -z "$ISSUE_COMMENTS" ]]  && ISSUE_COMMENTS="[]"  || true

# Compute behind-count
BASE=$(echo "$PR" | jq -r '.baseRefName')
HEAD=$(echo "$PR" | jq -r '.headRefName')
git fetch origin "$BASE" "$HEAD" --quiet 2>/dev/null || true
BEHIND=$(git rev-list --count "origin/${HEAD}..origin/${BASE}" 2>/dev/null || echo "0")

# Single jq call: assemble output + compute health
jq -n \
  --argjson pr "$PR" \
  --argjson checks "$CHECKS" \
  --argjson threads "$THREADS" \
  --argjson issueComments "$ISSUE_COMMENTS" \
  --argjson behind "$BEHIND" \
  '
  ($checks | [.[] | select(.bucket == "fail")] | length) as $failCount |
  ($checks | [.[] | select(.bucket == "pending")] | length) as $pendCount |
  ($pr.reviewDecision // "null") as $review |
  (
    (if $pr.mergeable == "CONFLICTING" then 1 else 0 end) +
    (if $review == "CHANGES_REQUESTED" then 1 else 0 end) +
    (if $failCount > 0 then 1 else 0 end)
  ) as $blockers |
  (
    (if $pr.isDraft then 1 else 0 end) +
    (if $pendCount > 0 then 1 else 0 end) +
    (if ($review == "REVIEW_REQUIRED" or $review == "null") then 1 else 0 end) +
    (if ([($threads // [])[] | select(.isResolved == false)] | length) > 0 then 1 else 0 end) +
    (if ($pr.reviewRequests | length) == 0 then 1 else 0 end)
  ) as $warnings |
  {
    number: $pr.number,
    title: $pr.title,
    url: $pr.url,
    state: $pr.state,
    isDraft: $pr.isDraft,
    headRefName: $pr.headRefName,
    baseRefName: $pr.baseRefName,
    author: $pr.author.login,
    mergeable: $pr.mergeable,
    reviewDecision: $review,
    additions: $pr.additions,
    deletions: $pr.deletions,
    changedFiles: $pr.changedFiles,
    updatedAt: $pr.updatedAt,
    commitsCount: ($pr.commits | length),
    recentCommits: [(($pr.commits // [])[-3:] | reverse | .[] | {message: .messageHeadline, author: .authors[0].login})],
    labels: [($pr.labels // [])[] | .name],
    reviewers: [($pr.reviewRequests // [])[] | .login],
    behindCount: $behind,
    checks: {
      total: ($checks | length),
      passed: ([$checks[] | select(.bucket == "pass")] | length),
      failed: $failCount,
      pending: $pendCount,
      failedChecks: [$checks[] | select(.bucket == "fail") | {name, link, description}],
      pendingChecks: [$checks[] | select(.bucket == "pending") | {name, startedAt}]
    },
    prComments: {
      total: ($issueComments | length),
      human: [($issueComments // [])[] | select(.user | test("\\[bot\\]$|^qodo-merge|^jenkins-ci|^sonarqube|^github-actions") | not) | {body, user, createdAt}],
      humanCount: ([($issueComments // [])[] | select(.user | test("\\[bot\\]$|^qodo-merge|^jenkins-ci|^sonarqube|^github-actions") | not)] | length)
    },
    reviewThreads: {
      total: (($threads // []) | length),
      unresolved: [($threads // [])[] | select(.isResolved == false and .isOutdated == false)],
      unresolvedCount: ([($threads // [])[] | select(.isResolved == false and .isOutdated == false)] | length),
      outdatedCount: ([($threads // [])[] | select(.isOutdated == true)] | length),
      resolvedCount: ([($threads // [])[] | select(.isResolved == true)] | length)
    },
    health: {
      blockers: $blockers,
      warnings: $warnings,
      healthy: ($blockers == 0 and $warnings == 0)
    }
  }
  '
