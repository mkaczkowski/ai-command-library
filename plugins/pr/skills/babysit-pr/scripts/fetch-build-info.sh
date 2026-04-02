#!/bin/bash
# Fetch Jenkins build info via Blue Ocean REST API.
# Usage: fetch-build-info.sh <classic-jenkins-build-url>
#
# Output: build status, pipeline stages, failing stage, console log tail.

set -euo pipefail

JENKINS_URL="${1:?Usage: fetch-build-info.sh <jenkins-build-url>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/jenkins-url-helper.sh"
validate_jenkins_env

BLUE_BASE=$(jenkins_to_blue_ocean "$JENKINS_URL")

RUN_RESPONSE=$(jenkins_curl "$BLUE_BASE/" 2>&1)
if [[ -z "$RUN_RESPONSE" ]]; then
  echo "Error: empty response from Blue Ocean API" >&2
  exit 1
fi

NODES_RESPONSE=$(jenkins_curl "$BLUE_BASE/nodes/" 2>&1)
LOG_RESPONSE=$(jenkins_curl "$BLUE_BASE/log/?download=true" 2>&1)

# Pipe log via stdin to avoid ARG_MAX limits on large console logs
python3 -c "
import sys, json, re

run_json = sys.argv[1]
nodes_json = sys.argv[2]
url = sys.argv[3]
log_text = sys.stdin.read()

try:
    run = json.loads(run_json)
except (json.JSONDecodeError, ValueError):
    print('Error: could not parse build info JSON', file=sys.stderr)
    if '404' in run_json or 'not found' in run_json.lower():
        print('Build not found (may have been deleted). Suggest re-triggering CI.')
    elif '401' in run_json or '403' in run_json:
        print('Authentication failed. Check JENKINS_USERNAME and JENKINS_API_TOKEN.')
    else:
        print(f'Raw response: {run_json[:500]}', file=sys.stderr)
    sys.exit(1)

result = run.get('result', 'UNKNOWN') or 'IN_PROGRESS'
duration_ms = run.get('durationInMillis', 0)
duration_s = (duration_ms or 0) / 1000
minutes = int(duration_s // 60)
seconds = int(duration_s % 60)
duration_str = f'{minutes}m {seconds}s' if minutes else f'{seconds}s'
build_id = run.get('id', '?')

print(f'Build: #{build_id} {result} ({duration_str})')
print(f'URL: {url}')
print()

failing_stage = None
try:
    nodes = json.loads(nodes_json) if nodes_json else []
except (json.JSONDecodeError, ValueError):
    nodes = []

if nodes:
    print('Stages:')
    for node in nodes:
        name = node.get('displayName', '?')
        node_result = node.get('result', 'UNKNOWN') or 'UNKNOWN'
        node_state = node.get('state', '')
        nd_s = (node.get('durationInMillis') or 0) / 1000
        nd_str = f'{int(nd_s // 60)}m {int(nd_s % 60)}s' if nd_s >= 60 else f'{int(nd_s)}s'

        if node_result == 'SUCCESS':
            tag = 'PASS'
        elif node_result == 'FAILURE':
            tag = 'FAIL'
            failing_stage = name
        elif node_state == 'SKIPPED' or node_result == 'NOT_BUILT':
            tag = 'SKIP'
        else:
            tag = node_result

        if tag == 'SKIP':
            print(f'  [{tag}] {name}')
        else:
            print(f'  [{tag}] {name} ({nd_str})')
    print()

if failing_stage:
    print(f'Failing stage: {failing_stage}')
else:
    print('Failing stage: could not identify')
print()

if 'Downstream' in log_text:
    downstream_urls = set(re.findall(r'https?://[^\s]+/job/[^\s]+/\d+', log_text))
    if downstream_urls:
        print('Downstream build URLs found:')
        for u in downstream_urls:
            print(f'  {u}')
        print()

lines = log_text.strip().split('\n') if log_text.strip() else []
tail_count = 150
tail = lines[-tail_count:] if len(lines) > tail_count else lines
print(f'Console log (last {len(tail)} of {len(lines)} lines):')
print('---')
print('\n'.join(tail))
print('---')
" "$RUN_RESPONSE" "$NODES_RESPONSE" "$JENKINS_URL" <<< "$LOG_RESPONSE"
