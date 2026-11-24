#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
umask 077

if ! docker compose version >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  printf '%s\n' 'Docker is unavailable. Run this from a Codespaces terminal with Docker running.' >&2
  exit 1
fi

if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  export IEVA_WP_BIND_HOST=0.0.0.0
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
    printf '\nLocal service: http://localhost:8081\n'
    printf 'WordPress setup: %s/wp-admin/install.php\n' "$IEVA_WP_ORIGIN"
    ;;
  setup|plugins)
    if ! "${wp[@]}" core is-installed; then
      if [[ "${1:-}" != setup ]]; then
        printf '%s\n' 'Run bash tools/syncee-preview/run.sh setup to install WordPress.' >&2
        exit 1
      fi
      read -r -p 'WordPress admin email: ' admin_email
      read -rs -p 'Choose a WordPress admin password: ' admin_password
      printf '\n'
      if [[ -z "$admin_email" || -z "$admin_password" ]]; then
        printf '%s\n' 'Email and password are required.' >&2
        exit 1
      fi
      printf '%s\n' "$admin_password" | "${wp[@]}" core install \
        --url="$IEVA_WP_ORIGIN" --title='Ieva Syncee Preview' \
        --admin_user=ieva_admin --admin_email="$admin_email" --skip-email --prompt=admin_password
      unset admin_password
    fi
    for plugin in woocommerce syncee-global-dropshipping; do
      if ! "${wp[@]}" plugin is-installed "$plugin"; then
        "${wp[@]}" plugin install "$plugin"
      fi
      "${wp[@]}" plugin activate "$plugin"
    done
    "${wp[@]}" rewrite structure '/%postname%/' --hard
    "${wp[@]}" option update blog_public 0
    printf '\nWordPress admin: %s/wp-admin/\n' "$IEVA_WP_ORIGIN"
    ;;
  stop)
    "${compose[@]}" stop
    ;;
  *)
    printf 'Usage: bash tools/syncee-preview/run.sh [up|setup|plugins|stop]\n' >&2
    exit 2
    ;;
esac
