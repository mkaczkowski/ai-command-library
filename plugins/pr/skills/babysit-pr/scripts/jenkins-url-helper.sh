# Shared helper for Jenkins Blue Ocean API scripts.
# Source this file — do not execute directly.
#
# Requires: JENKINS_USERNAME and JENKINS_API_TOKEN env vars.
# Requires: curl, python3
# Note: curl must be excluded from RTK rewriting in rtk config (exclude_commands = ["curl"])

validate_jenkins_env() {
  if [[ -z "${JENKINS_USERNAME:-}" || -z "${JENKINS_API_TOKEN:-}" ]]; then
    echo "Error: JENKINS_USERNAME and JENKINS_API_TOKEN must be set" >&2
    exit 1
  fi
}

jenkins_curl() {
  curl -s -u "${JENKINS_USERNAME}:${JENKINS_API_TOKEN}" "$1"
}

jenkins_post() {
  curl -s -u "${JENKINS_USERNAME}:${JENKINS_API_TOKEN}" -X POST -H "Content-Type: application/json" "$1"
}

# Convert classic Jenkins URL to Blue Ocean base URL.
# Handles both multibranch pipelines (>=3 job segments) and simple pipelines (1-2 segments).
# Multibranch: job/Org/job/Repo/job/Pipeline/job/branch/build → .../pipelines/Org/.../branches/branch/runs/build
# Simple:      job/Folder/job/Pipeline/build                  → .../pipelines/Folder/pipelines/Pipeline/runs/build
jenkins_to_blue_ocean() {
  python3 -c "
from urllib.parse import urlparse, unquote
import sys

url = sys.argv[1]
parsed = urlparse(url)
host = f'{parsed.scheme}://{parsed.netloc}'

parts = [p for p in parsed.path.split('/') if p]
job_parts = []
build_number = None
for p in parts:
    if p == 'job':
        continue
    if p.isdigit():
        build_number = p
        break
    if p in ('display', 'redirect', 'console', 'consoleFull', 'testReport'):
        continue
    job_parts.append(unquote(p))

if not job_parts or not build_number:
    print('Error: could not parse job/build from URL', file=sys.stderr)
    sys.exit(1)

base = f'{host}/blue/rest/organizations/jenkins'
if len(job_parts) >= 3:
    pipelines_path = '/pipelines/'.join(job_parts[:-1])
    branch = job_parts[-1]
    print(f'{base}/pipelines/{pipelines_path}/branches/{branch}/runs/{build_number}')
else:
    pipelines_path = '/pipelines/'.join(job_parts)
    print(f'{base}/pipelines/{pipelines_path}/runs/{build_number}')
" "$1"
}
