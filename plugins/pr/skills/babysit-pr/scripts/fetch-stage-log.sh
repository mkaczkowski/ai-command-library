#!/bin/bash
# Fetch detailed logs for a failing stage in a Jenkins build.
# Drills into stage nodes → steps → step logs, and follows downstream job failures.
#
# Usage: fetch-stage-log.sh <jenkins-build-url> [stage-name]
#   If stage-name is omitted, finds the first failing stage automatically.
#
# Output: stage name, failing steps with logs, downstream job details if applicable.

set -euo pipefail

JENKINS_URL="${1:?Usage: fetch-stage-log.sh <jenkins-build-url> [stage-name]}"
STAGE_FILTER="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/jenkins-url-helper.sh"
validate_jenkins_env

BLUE_BASE=$(jenkins_to_blue_ocean "$JENKINS_URL")

python3 -c "
import sys, json, re, subprocess

base_url = sys.argv[1]
stage_filter = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else None
jenkins_user = sys.argv[3]
jenkins_token = sys.argv[4]

def curl(url):
    result = subprocess.run(
        ['curl', '-s', '-u', f'{jenkins_user}:{jenkins_token}', url],
        capture_output=True, text=True
    )
    return result.stdout

def curl_json(url):
    raw = curl(url)
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        return None

# Find the target stage
nodes = curl_json(f'{base_url}/nodes/') or []
target = None
for n in nodes:
    name = n.get('displayName', '')
    result = n.get('result', '')
    if stage_filter:
        if stage_filter.lower() in name.lower() and result == 'FAILURE':
            target = n
            break
    elif result == 'FAILURE':
        target = n
        break

if not target:
    if stage_filter:
        print(f'No failing stage matching \"{stage_filter}\" found.')
    else:
        print('No failing stage found.')
    sys.exit(0)

stage_name = target['displayName']
stage_id = target['id']
print(f'Failing stage: {stage_name}')
print()

# Get steps within the failing stage
steps = curl_json(f'{base_url}/nodes/{stage_id}/steps/') or []
failing_steps = [s for s in steps if s.get('result') == 'FAILURE']

if not failing_steps:
    print('No failing steps found in this stage.')
    sys.exit(0)

for step in failing_steps:
    step_name = step.get('displayName', '') or step.get('displayDescription', '')
    step_id = step.get('id', '')
    print(f'Failing step: {step_name}')

    # Get step log
    log = curl(f'{base_url}/nodes/{stage_id}/steps/{step_id}/log/')
    if not log:
        print('  (no log available)')
        print()
        continue

    lines = log.strip().split('\n')

    # Check if this is a downstream job trigger
    downstream_match = re.search(r'Starting building: (.+?) #(\d+)', log)
    if downstream_match:
        downstream_name = downstream_match.group(1)
        downstream_build = downstream_match.group(2)
        print(f'  Downstream job: {downstream_name} #{downstream_build}')

        # Try to extract the downstream job URL from the log
        url_match = re.search(r'(https?://[^\s]+/job/[^\s]+/' + downstream_build + r')', log)
        if url_match:
            print(f'  URL: {url_match.group(1)}')
        print()

        # Build downstream Blue Ocean URL by converting the job name
        # e.g. 'Tools >> IntegrationTestsReceiver' → 'Tools/IntegrationTestsReceiver'
        parts = [p.strip() for p in downstream_name.replace(' >> ', '/').replace(' » ', '/').split('/')]
        host = base_url.split('/blue/')[0]
        ds_pipelines = '/pipelines/'.join(parts)
        ds_blue = f'{host}/blue/rest/organizations/jenkins/pipelines/{ds_pipelines}/runs/{downstream_build}'

        # Get downstream build info
        ds_run = curl_json(f'{ds_blue}/')
        if ds_run and ds_run.get('result'):
            ds_result = ds_run.get('result', 'UNKNOWN')
            ds_duration = (ds_run.get('durationInMillis') or 0) / 1000
            dm = int(ds_duration // 60)
            ds = int(ds_duration % 60)
            print(f'  Downstream build: #{downstream_build} {ds_result} ({dm}m {ds}s)')

            # Get downstream failing stages
            ds_nodes = curl_json(f'{ds_blue}/nodes/') or []
            for dn in ds_nodes:
                if dn.get('result') == 'FAILURE':
                    dn_name = dn.get('displayName', '?')
                    dn_id = dn.get('id', '')
                    print(f'  Downstream failing stage: {dn_name}')

                    # Get downstream failing step logs
                    ds_steps = curl_json(f'{ds_blue}/nodes/{dn_id}/steps/') or []
                    ds_failing = [s for s in ds_steps if s.get('result') == 'FAILURE']
                    for ds_step in ds_failing:
                        ds_step_name = ds_step.get('displayName', '') or ds_step.get('displayDescription', '')
                        ds_step_id = ds_step.get('id', '')
                        ds_log = curl(f'{ds_blue}/nodes/{dn_id}/steps/{ds_step_id}/log/')
                        if ds_log:
                            ds_lines = ds_log.strip().split('\n')
                            # Show last 80 lines of downstream log
                            tail = ds_lines[-80:] if len(ds_lines) > 80 else ds_lines
                            print(f'  --- {ds_step_name} (last {len(tail)} of {len(ds_lines)} lines) ---')
                            print('\n'.join(tail))
                            print('  ---')
                    print()
        else:
            print('  Could not fetch downstream build details.')
            print()
    else:
        # Regular step — show last 50 lines of log
        tail = lines[-50:] if len(lines) > 50 else lines
        print(f'  --- log (last {len(tail)} of {len(lines)} lines) ---')
        print('\n'.join(tail))
        print('  ---')
        print()
" "$BLUE_BASE" "$STAGE_FILTER" "$JENKINS_USERNAME" "$JENKINS_API_TOKEN"
