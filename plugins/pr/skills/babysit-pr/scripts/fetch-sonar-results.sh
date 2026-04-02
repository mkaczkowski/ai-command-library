#!/bin/bash
# Fetch SonarQube quality gate status and findings for a PR.
# Usage: fetch-sonar-results.sh <jenkins-build-url>
#
# Requires: JENKINS_USERNAME and JENKINS_API_TOKEN (to extract Sonar metadata from Jenkins)
# Optional: SONAR_TOKEN (to query SonarQube API for findings; falls back to dashboard URL only)

set -euo pipefail

JENKINS_URL="${1:?Usage: fetch-sonar-results.sh <jenkins-build-url>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/jenkins-url-helper.sh"
validate_jenkins_env

# Strip display/redirect suffixes to get the base build URL
BASE_URL=$(echo "$JENKINS_URL" | sed 's|/display/redirect||;s|/console.*||')

# Extract SonarQube metadata from Jenkins build actions
# Use -g to disable curl glob expansion so [...] in tree param is not interpreted as a range
JENKINS_ACTIONS=$(curl -sg -u "${JENKINS_USERNAME}:${JENKINS_API_TOKEN}" \
  "${BASE_URL}/api/json?tree=actions[_class,installationName,serverUrl,sonarqubeDashboardUrl]")

SONAR_INFO=$(python3 -c "
import sys, json
data = json.loads(sys.argv[1])
for action in data.get('actions', []):
    if 'SonarAnalysis' in action.get('_class', ''):
        print(action.get('serverUrl', ''))
        print(action.get('sonarqubeDashboardUrl', ''))
        break
" "$JENKINS_ACTIONS" 2>/dev/null) || true

SONAR_SERVER=$(echo "$SONAR_INFO" | sed -n '1p')
SONAR_DASHBOARD=$(echo "$SONAR_INFO" | sed -n '2p')

if [[ -z "$SONAR_DASHBOARD" ]]; then
  echo "Could not extract SonarQube info from Jenkins build."
  echo "Jenkins URL: $BASE_URL"
  exit 1
fi

# Parse project key and PR number from dashboard URL
# e.g. https://sonarqube.dev.box.net/dashboard?id=workflow-client&pullRequest=2241
read -r PROJECT_KEY PR_NUMBER < <(python3 -c "
from urllib.parse import urlparse, parse_qs
import sys
qs = parse_qs(urlparse(sys.argv[1]).query)
print(qs.get('id', [''])[0], qs.get('pullRequest', [''])[0])
" "$SONAR_DASHBOARD")

echo "SonarQube Dashboard: $SONAR_DASHBOARD"
echo "Project: $PROJECT_KEY | PR: ${PR_NUMBER:-n/a}"
echo ""

if [[ -z "${SONAR_TOKEN:-}" ]]; then
  echo "No SONAR_TOKEN set — showing dashboard URL only."
  echo "To get findings, set SONAR_TOKEN (generate at ${SONAR_SERVER}/account/security)"
  exit 0
fi

# Quality gate status
QG_RESPONSE=$(curl -s -u "${SONAR_TOKEN}:" \
  "${SONAR_SERVER}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}${PR_NUMBER:+&pullRequest=${PR_NUMBER}}")

python3 -c "
import sys, json

data = json.loads(sys.argv[1])
qg = data.get('projectStatus', {})
status = qg.get('status', 'UNKNOWN')
print(f'Quality Gate: {status}')
print()

conditions = qg.get('conditions', [])
failed = [c for c in conditions if c.get('status') == 'ERROR']
if failed:
    print('Failed conditions:')
    for c in failed:
        metric = c.get('metricKey', '?')
        actual = c.get('actualValue', '?')
        threshold = c.get(\"errorThreshold\", '?')
        print(f'  {metric}: {actual} (threshold: {threshold})')
    print()
elif conditions:
    print('All conditions passed.')
    print()
" "$QG_RESPONSE" 2>/dev/null || echo "Could not parse quality gate response."

# Issues introduced in this PR only (inNewCodePeriod=true scopes to new issues on the branch)
ISSUES_RESPONSE=$(curl -sg -u "${SONAR_TOKEN}:" \
  "${SONAR_SERVER}/api/issues/search?componentKeys=${PROJECT_KEY}${PR_NUMBER:+&pullRequest=${PR_NUMBER}}&resolved=false&inNewCodePeriod=true&ps=25&s=SEVERITY&asc=false")

python3 -c "
import sys, json

data = json.loads(sys.argv[1])
total = data.get('total', 0)
issues = data.get('issues', [])

print(f'Issues: {total} unresolved (showing up to 25)')
if not issues:
    print('  None found.')
    sys.exit(0)

print()
for issue in issues:
    severity   = issue.get('severity', '?')
    issue_type = issue.get('type', '?')
    msg        = issue.get('message', '?')
    component  = issue.get('component', '?').split(':')[-1]
    line       = issue.get('line', '')
    location   = f'{component}:{line}' if line else component
    print(f'  [{severity}] {issue_type} — {msg}')
    print(f'    {location}')
" "$ISSUES_RESPONSE" 2>/dev/null || echo "Could not parse issues response."

# Coverage breakdown — only shown when new_coverage failed the quality gate
COVERAGE_FAILED=$(python3 -c "
import sys, json
d = json.loads(sys.argv[1])
conditions = d.get('projectStatus', {}).get('conditions', [])
print('yes' if any(c.get('metricKey') == 'new_coverage' and c.get('status') == 'ERROR' for c in conditions) else 'no')
" "$QG_RESPONSE" 2>/dev/null || echo "no")

if [[ "$COVERAGE_FAILED" == "yes" ]]; then
  echo ""
  echo "Coverage breakdown (new lines, files with gaps):"
  COVERAGE_RESPONSE=$(curl -sg -u "${SONAR_TOKEN}:" \
    "${SONAR_SERVER}/api/measures/component_tree?component=${PROJECT_KEY}${PR_NUMBER:+&pullRequest=${PR_NUMBER}}&metricKeys=new_coverage,new_uncovered_lines,new_lines_to_cover&strategy=leaves&ps=50")

  python3 -c "
import sys, json

data = json.loads(sys.argv[1])
dashboard = sys.argv[2]
project = sys.argv[3]
pr = sys.argv[4]

components = data.get('components', [])
# Filter to files (not test files) with new lines to cover and sort by uncovered desc
files = []
for c in components:
    if c.get('qualifier') == 'UTS':
        continue
    measures = {m['metric']: m.get('period', {}).get('value') for m in c.get('measures', [])}
    to_cover = int(measures.get('new_lines_to_cover') or 0)
    uncovered = int(measures.get('new_uncovered_lines') or 0)
    coverage = measures.get('new_coverage')
    if to_cover > 0:
        files.append((uncovered, to_cover, coverage, c.get('path', c.get('name', '?'))))

files.sort(reverse=True)

if not files:
    print('  No new lines to cover found.')
else:
    for uncovered, to_cover, coverage, path in files:
        cov_str = f'{float(coverage):.1f}%' if coverage else '0%'
        print(f'  {cov_str} ({uncovered}/{to_cover} uncovered) — {path}')

print()
server = dashboard.split('/dashboard')[0]
print(f'  Full view: {server}/component_measures?id={project}&metric=new_coverage&pullRequest={pr}&view=list')
" "$COVERAGE_RESPONSE" "$SONAR_DASHBOARD" "$PROJECT_KEY" "${PR_NUMBER:-}" 2>/dev/null || echo "  Could not parse coverage response."
fi
