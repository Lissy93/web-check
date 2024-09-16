#!/usr/bin/env bash
SCREEN_RESOLUTION="${SCREEN_RESOLUTION:-1280x1024x24}"
if [[ ! "${SCREEN_RESOLUTION}" =~ ^[0-9]+x[0-9]+x(8|16|24)$ ]]; then
    echo "SCREEN_RESOLUTION must match screen resolution like '1280x1024x24'"
    echo "last number (color) must be 8,16 or 24"
    exit 1
fi

service dbus start
[[ -z "${DISPLAY}" ]] && export DISPLAY=":99"
Xvfb "${DISPLAY}" -screen 0 "${SCREEN_RESOLUTION}" &
exec "${@}"
