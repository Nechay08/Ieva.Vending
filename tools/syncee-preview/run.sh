#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
umask 077

if ! docker compose version >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  printf '%s\n' 'Docker is unavailable. Run this from a Codespaces terminal with Docker running.' >&2
  exit 1
fi

if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  export IEVA_WP_ORIGIN="https://${CODESPACE_NAME}-8081.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
else
  export IEVA_WP_ORIGIN=http://localhost:8081
fi

config=.env.wordpress.local
if [[ ! -s "$config" ]]; then
  printf 'IEVA_WP_DB_PASSWORD=%s\n' "$(openssl rand -hex 32)" > "$config"
fi

compose=(docker compose --env-file "$config")
wp=("${compose[@]}" exec -T -u www-data wordpress wp)

case "${1:-up}" in
  up)
    "${compose[@]}" up -d --build
    printf '\nWordPress setup: %s/wp-admin/install.php\n' "$IEVA_WP_ORIGIN"
    ;;
  plugins)
    if ! "${wp[@]}" core is-installed; then
      printf 'Complete WordPress setup at %s/wp-admin/install.php first.\n' "$IEVA_WP_ORIGIN" >&2
      exit 1
    fi
    "${wp[@]}" plugin install woocommerce syncee-global-dropshipping --activate
    "${wp[@]}" rewrite structure '/%postname%/' --hard
    "${wp[@]}" option update blog_public 0
    printf '\nWordPress admin: %s/wp-admin/\n' "$IEVA_WP_ORIGIN"
    ;;
  stop)
    "${compose[@]}" stop
    ;;
  *)
    printf 'Usage: bash tools/syncee-preview/run.sh [up|plugins|stop]\n' >&2
    exit 2
    ;;
esac
