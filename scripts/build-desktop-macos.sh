#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
npm run build
app="dist/native/Agent Harness UI.app/Contents"
mkdir -p "$app/MacOS" "$app/Resources/ui"
swiftc -O desktop/macos/AuthorizationAttempt.swift desktop/macos/main.swift -o "$app/MacOS/Harness"
cp desktop/macos/Info.plist "$app/Info.plist"
rsync -a --delete --exclude=/native --exclude=/checks dist/ "$app/Resources/ui/"
codesign --force --sign - "dist/native/Agent Harness UI.app"
