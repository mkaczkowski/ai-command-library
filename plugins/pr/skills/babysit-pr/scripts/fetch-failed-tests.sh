#!/bin/bash
# Fetch failed test results from Jenkins Blue Ocean REST API.
# Usage: fetch-failed-tests.sh <classic-jenkins-build-url>
#
# Output: one block per failed test with name, file path, and error summary.

set -euo pipefail

JENKINS_URL="${1:?Usage: fetch-failed-tests.sh <jenkins-build-url>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/jenkins-url-helper.sh"
validate_jenkins_env

BLUE_BASE=$(jenkins_to_blue_ocean "$JENKINS_URL")
BLUE_URL="${BLUE_BASE}/tests/?status=FAILED&limit=50"

RESPONSE=$(jenkins_curl "$BLUE_URL" 2>&1)

if [[ -z "$RESPONSE" || "$RESPONSE" == "[]" ]]; then
  echo "No failed tests found."
  exit 0
fi

# Pipe via stdin to avoid ARG_MAX limits on large test result payloads
python3 -c "
import sys, json, re

try:
    tests = json.loads(sys.stdin.read())
except (json.JSONDecodeError, IndexError):
    print('Error: could not parse test results JSON', file=sys.stderr)
    sys.exit(1)

if not tests:
    print('No failed tests found.')
    sys.exit(0)

print(f'Failed tests: {len(tests)}')
print()

for t in tests:
    name = t.get('name', '')
    stack = t.get('errorStackTrace', '') or ''
    stack_lines = stack.split('\n')
    file_match = ''
    for line in stack_lines:
        if '/src/' in line:
            m = re.search(r'(src/[^:]+)', line)
            if m:
                file_match = m.group(1)
                break
    print(f'FAILED: {name}')
    if file_match:
        print(f'  File: {file_match}')
    error_line = stack_lines[0][:150] if stack else t.get('errorDetails', '') or 'unknown'
    print(f'  Error: {error_line}')
    print()
" <<< "$RESPONSE"
