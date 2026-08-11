#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config/config.js"

DEV_URL="http://10.1.1.226:8088"
PROD_URL="https://api.verzeilberg.nl"

# Determine the chosen environment: argument or interactive prompt
CHOICE="${1:-}"
if [ -z "$CHOICE" ]; then
    echo "Kies een omgeving voor de build:"
    echo "  1) Development  ($DEV_URL)"
    echo "  2) Productie    ($PROD_URL)"
    read -r -p "Keuze [1/2]: " CHOICE
fi

case "$CHOICE" in
    1|dev|development)
        TARGET_URL="$DEV_URL"
        ;;
    2|prod|production)
        TARGET_URL="$PROD_URL"
        ;;
    *)
        echo "Ongeldige keuze: '$CHOICE'. Gebruik 1 (development) of 2 (productie)." >&2
        exit 1
        ;;
esac

echo "API_BASE_URL wordt gebouwd met: $TARGET_URL"

# Back up the current config so it can be restored afterwards
BACKUP_FILE="$SCRIPT_DIR/config/config.js.bak"
cp "$CONFIG_FILE" "$BACKUP_FILE"

restore_config() {
    if [ -f "$BACKUP_FILE" ]; then
        mv "$BACKUP_FILE" "$CONFIG_FILE"
        echo "config.js is teruggezet."
    fi
}
trap restore_config EXIT

# Swap in the chosen API_BASE_URL (escape the URL for use in sed)
ESCAPED_URL=$(printf '%s' "$TARGET_URL" | sed 's/[\/&]/\\&/g')
sed -i "s/API_BASE_URL: '.*'/API_BASE_URL: '${ESCAPED_URL}'/" "$CONFIG_FILE"

echo "Builden van de APK..."
eas build -p android --profile preview

echo "Klaar! APK gebouwd met API_BASE_URL=$TARGET_URL"
