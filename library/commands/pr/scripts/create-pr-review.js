#!/usr/bin/env node

/**
 * GitHub PR Pending Review Creator
 *
 * Creates a pending review on an existing pull request using comment data from CSV.
 */
import { log } from "./utils/logger.js";
import { ensureGhCli, runGhJson } from "./utils/process.js";
import { getCurrentPRNumber, resolveRepository } from "./utils/repository.js";
import {
  createFlagHandler,
  createStandardArgHandlers,
  createStandardValidations,
  parseArgs,
  showHelp,
  validateArgs,
} from "./utils/cli.js";
import { COMMON_BOOLEAN_FLAGS, REVIEW_COMMENT_CSV_CONFIG } from "./utils/config.js";
import { createOptionalPositiveIntegerFieldValidator, createStringFieldValidator, parseCSVFile } from "./utils/csv.js";

const HELP_TEXT = `
Create a pending GitHub PR review populated with inline comments supplied via CSV.

Usage:
  node .claude/commands/pr/scripts/create-pr-review.js --comments-file=comments.csv [options]

Options:
  --comments-file        Path to a CSV file describing review comments (required)
  --pr                   Pull request number (auto-detects current PR if omitted)
  --repo                 Repository in owner/repo format (auto-detected when omitted)
  --review-body          Text to use as the review summary body
  --commit               Commit SHA to anchor the review (optional)
  --verbose              Enable detailed logging
  --help, -h             Show this help message

Comments CSV format (7 columns):
path,position,body,line,startLine,side,startSide
src/index.ts,12,"Please extract helper",,,,
src/components/foo.ts,,"Can we document this prop?",42,,RIGHT,

Rules:
  - Provide either position OR line/startLine columns per row (not both).
  - When using line-based locations, side/startSide default to RIGHT when omitted.
  - Leave event unset to keep the review in PENDING state.
`;

async function main() {
  try {
    log("INFO", "GitHub PR Pending Review Creator starting...");

    const options = parseCliArgs(process.argv.slice(2));
    log("DEBUG", "Parsed CLI options", options);

    if (options.help) {
      showHelp(HELP_TEXT);
      return;
    }

    const standardValidations = createStandardValidations();
    const validations = [
      standardValidations.repository,
      standardValidations.prNumber,
      { ...standardValidations.mappingFile, field: "commentsFile" },
    ];

    validateArgs(options, validations);

    await ensureGhCli();

    log("INFO", `Loading review comments from CSV: ${options.commentsFile}`);
    const comments = await parseCommentsFile(options.commentsFile);
    log("INFO", `Loaded ${comments.length} review comment(s) from CSV`);

    if (comments.length === 0) {
      throw new Error("No review comments provided in CSV file");
    }

    const repo = await resolveRepository(options.repo);
    const prNumber = await resolvePullRequestNumber(options.pr);

    const hostInfo = repo.host && repo.host !== "github.com" ? ` (${repo.host})` : "";
    log("INFO", `Target repository: ${repo.owner}/${repo.repo}${hostInfo}`);
    log("INFO", `Target PR number: ${prNumber}`);
    console.log(`Creating pending review on PR #${prNumber} with ${comments.length} comment(s)`);

    const reviewBody = resolveReviewBody(options);
    const payload = buildReviewPayload({
      reviewBody,
      commit: options.commit,
      comments,
    });

    await submitReview(repo, prNumber, payload);
  } catch (error) {
    log("ERROR", `Script failed: ${error.message}`);
    console.error(error.message);
    process.exit(1);
  }
}

function parseCliArgs(argv) {
  const argHandlers = createStandardArgHandlers();

  const flagHandlers = {
    "--comments-file": createFlagHandler("commentsFile"),
    "--repo": createFlagHandler("repo"),
    "--pr": createFlagHandler("pr", (value) => parseInt(value.trim(), 10)),
    "--review-body": createFlagHandler("reviewBody"),
    "--commit": createFlagHandler("commit"),
  };

  return parseArgs(argv, {
    argHandlers,
    flagHandlers,
    booleanFlags: [...COMMON_BOOLEAN_FLAGS],
    requiredFlags: ["--comments-file"],
  });
}

async function resolvePullRequestNumber(providedPr) {
  if (providedPr) {
    return providedPr;
  }

  log("INFO", "Auto-detecting PR number using gh pr view");
  return getCurrentPRNumber();
}

function resolveReviewBody(options) {
  if (options.reviewBody !== undefined) {
    return options.reviewBody;
  }

  return undefined;
}

async function parseCommentsFile(filePath) {
  const { REQUIRED_HEADERS, EXPECTED_COLUMNS } = REVIEW_COMMENT_CSV_CONFIG;

  const fieldValidators = [
    createStringFieldValidator("path"),
    createOptionalPositiveIntegerFieldValidator("position"),
    createStringFieldValidator("body"),
    createOptionalPositiveIntegerFieldValidator("line"),
    createOptionalPositiveIntegerFieldValidator("startLine"),
    createStringFieldValidator("side", true),
    createStringFieldValidator("startSide", true),
  ];

  const rowProcessor = (row, rowNumber) => buildCommentFromRow(row, rowNumber);

  const { rows } = await parseCSVFile(filePath, {
    requiredHeaders: REQUIRED_HEADERS,
    expectedColumns: EXPECTED_COLUMNS,
    fieldValidators,
    rowProcessor,
  });

  return rows;
}

function buildCommentFromRow(row, rowNumber) {
  const path = row.path.trim();
  const body = row.body;
  const position = row.position;
  const line = row.line;
  const startLine = row.startLine;
  const side = normalizeSide(row.side, "side", rowNumber);
  const startSide = normalizeSide(row.startSide, "startSide", rowNumber);

  if (!position && !line) {
    throw new Error(`Row ${rowNumber}: Provide either position or line value.`);
  }

  if (position && (line || startLine || side || startSide)) {
    throw new Error(`Row ${rowNumber}: position cannot be combined with line/startLine/side values.`);
  }

  if (startLine && !line) {
    throw new Error(`Row ${rowNumber}: startLine requires line to be set.`);
  }

  if (!path) {
    throw new Error(`Row ${rowNumber}: path cannot be empty.`);
  }

  const comment = {
    path,
    body,
  };

  if (position) {
    comment.position = position;
    return comment;
  }

  comment.line = line;
  comment.side = side || "RIGHT";

  if (startSide && !startLine) {
    throw new Error(`Row ${rowNumber}: startSide requires startLine to be set.`);
  }

  if (startLine) {
    comment.startLine = startLine;
    comment.startSide = startSide || comment.side;
  }

  return comment;
}

function normalizeSide(value, fieldName, rowNumber) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    return undefined;
  }

  const upper = trimmed.toUpperCase();
  if (upper !== "LEFT" && upper !== "RIGHT") {
    throw new Error(`Row ${rowNumber}: ${fieldName} must be LEFT or RIGHT when provided.`);
  }

  return upper;
}

function buildReviewPayload({ reviewBody, commit, comments }) {
  const payload = {
    comments,
  };

  if (commit) {
    payload.commit_id = commit;
  }

  if (reviewBody !== undefined) {
    const trimmedBody = reviewBody.trim();
    if (trimmedBody) {
      payload.body = reviewBody;
    }
  }

  return payload;
}

async function submitReview(repo, prNumber, payload) {
  const endpoint = `/repos/${repo.owner}/${repo.repo}/pulls/${prNumber}/reviews`;
  const payloadString = `${JSON.stringify(payload)}\n`;

  log("DEBUG", `Submitting review via POST ${endpoint}`);

  const response = await runGhJson(["api", "--method", "POST", endpoint, "--input", "-"], {
    input: payloadString,
    host: repo.host,
  });

  const reviewId = response.id || response.node_id || "unknown";
  const state = response.state || "pending";
  console.log(`✔ Created pending review ${reviewId} (state: ${state})`);
}

main();
