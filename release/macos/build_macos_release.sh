#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This build script supports macOS only."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_NAME="Axinom Ingest Helper"
BUNDLE_ID="com.axinom.ingesthelper"
VERSION="${1:-$(date +%Y.%m.%d)}"

BUILD_ROOT="$ROOT_DIR/release/macos/build"
DIST_ROOT="$ROOT_DIR/release/macos/dist"
VENV_DIR="$BUILD_ROOT/.venv"
PYI_WORK="$BUILD_ROOT/pyinstaller/work"
PYI_SPEC="$BUILD_ROOT/pyinstaller/spec"
PYI_DIST="$BUILD_ROOT/pyinstaller/dist"
PYI_CONFIG="$BUILD_ROOT/pyinstaller/config"
COMPONENT_PLIST="$BUILD_ROOT/component.plist"
PKG_ROOT=""
ICON_PATH="$ROOT_DIR/release/macos/assets/AxinomIngestHelper.icns"

PKG_FILENAME="AxinomIngestHelper-${VERSION}.pkg"
README_FILENAME="AxinomIngestHelper-${VERSION}-README.txt"

mkdir -p "$BUILD_ROOT" "$DIST_ROOT"

resolve_file() {
  local candidate=""
  for candidate in "$@"; do
    if [[ -f "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

TEMPLATE_V1_0="$(resolve_file \
  "$ROOT_DIR/axinom_ingest_template_v1_0_0.xlsx" \
  "$ROOT_DIR/docs/reference/axinom_ingest_template_v1_0_0.xlsx")" || {
  echo "Missing template file: axinom_ingest_template_v1_0_0.xlsx"
  exit 1
}

TEMPLATE_V1_1="$(resolve_file \
  "$ROOT_DIR/axinom_ingest_template_v1_1_0.xlsx" \
  "$ROOT_DIR/docs/reference/axinom_ingest_template_v1_1_0.xlsx")" || {
  echo "Missing template file: axinom_ingest_template_v1_1_0.xlsx"
  exit 1
}

TEMPLATE_V1_2="$(resolve_file \
  "$ROOT_DIR/axinom_ingest_template_v1_2_0.xlsx" \
  "$ROOT_DIR/docs/reference/axinom_ingest_template_v1_2_0.xlsx")" || {
  echo "Missing template file: axinom_ingest_template_v1_2_0.xlsx"
  exit 1
}

TEMPLATE_V1_3="$(resolve_file \
  "$ROOT_DIR/axinom_ingest_template_v1_3_0.xlsx" \
  "$ROOT_DIR/docs/reference/axinom_ingest_template_v1_3_0.xlsx")" || {
  echo "Missing template file: axinom_ingest_template_v1_3_0.xlsx"
  exit 1
}

TEMPLATE_V1_4="$(resolve_file \
  "$ROOT_DIR/axinom_ingest_template_v1_4_0.xlsx" \
  "$ROOT_DIR/docs/reference/axinom_ingest_template_v1_4_0.xlsx")" || {
  echo "Missing template file: axinom_ingest_template_v1_4_0.xlsx"
  exit 1
}

TEMPLATE_V1_5="$(resolve_file \
  "$ROOT_DIR/axinom_ingest_template_v1_5_0.xlsx" \
  "$ROOT_DIR/docs/reference/axinom_ingest_template_v1_5_0.xlsx")" || {
  echo "Missing template file: axinom_ingest_template_v1_5_0.xlsx"
  exit 1
}

TEMPLATE_V1_5_1="$(resolve_file \
  "$ROOT_DIR/axinom_ingest_template_v1_5_1.xlsx" \
  "$ROOT_DIR/docs/reference/axinom_ingest_template_v1_5_1.xlsx")" || {
  echo "Missing template file: axinom_ingest_template_v1_5_1.xlsx"
  exit 1
}

cleanup() {
  if [[ -n "${PKG_ROOT}" && -d "${PKG_ROOT}" ]]; then
    rm -rf "${PKG_ROOT}" || true
  fi
}
trap cleanup EXIT

if ! command -v pkgbuild >/dev/null 2>&1; then
  echo "pkgbuild was not found. Install Xcode Command Line Tools first."
  exit 1
fi

if [[ ! -f "$ICON_PATH" ]]; then
  echo "Missing app icon: $ICON_PATH"
  echo "Expected a .icns icon for macOS packaging."
  exit 1
fi

if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
fi

# Keep this resilient for restricted/offline environments after first bootstrap.
"$VENV_DIR/bin/python" -m pip install --disable-pip-version-check --upgrade pip >/dev/null 2>&1 || true
if ! "$VENV_DIR/bin/python" -c "import PyInstaller" >/dev/null 2>&1; then
  "$VENV_DIR/bin/python" -m pip install --disable-pip-version-check pyinstaller
fi

rm -rf "$PYI_WORK" "$PYI_SPEC" "$PYI_DIST" "$PYI_CONFIG" "$COMPONENT_PLIST"
PKG_ROOT="$(mktemp -d /tmp/axinom_ingest_pkgroot.XXXXXX)"
mkdir -p "$PYI_WORK" "$PYI_SPEC" "$PYI_DIST" "$PYI_CONFIG" "$PKG_ROOT/Applications"

export PYINSTALLER_CONFIG_DIR="$PYI_CONFIG"
"$VENV_DIR/bin/pyinstaller" \
  --noconfirm \
  --clean \
  --windowed \
  --name "$APP_NAME" \
  --icon "$ICON_PATH" \
  --osx-bundle-identifier "$BUNDLE_ID" \
  --workpath "$PYI_WORK" \
  --specpath "$PYI_SPEC" \
  --distpath "$PYI_DIST" \
  --add-data "$ROOT_DIR/webapp/static:webapp/static" \
  --add-data "$ROOT_DIR/webapp/program_types.json:webapp" \
  --add-data "$TEMPLATE_V1_0:templates" \
  --add-data "$TEMPLATE_V1_1:templates" \
  --add-data "$TEMPLATE_V1_2:templates" \
  --add-data "$TEMPLATE_V1_3:templates" \
  --add-data "$TEMPLATE_V1_4:templates" \
  --add-data "$TEMPLATE_V1_5:templates" \
  --add-data "$TEMPLATE_V1_5_1:templates" \
  "$ROOT_DIR/webapp/desktop_launcher.py"

APP_PATH="$PYI_DIST/$APP_NAME.app"
if [[ ! -d "$APP_PATH" ]]; then
  echo "Expected app bundle not found: $APP_PATH"
  exit 1
fi

APP_PLIST="$APP_PATH/Contents/Info.plist"
if [[ -f "$APP_PLIST" ]]; then
  /usr/libexec/PlistBuddy -c "Delete :CFBundleURLTypes" "$APP_PLIST" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes array" "$APP_PLIST"
  /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0 dict" "$APP_PLIST"
  /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLName string com.axinom.ingesthelper.launch" "$APP_PLIST"
  /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" "$APP_PLIST"
  /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string axinom-ingest" "$APP_PLIST"
fi

cp -R "$APP_PATH" "$PKG_ROOT/Applications/"

# Prevent Installer from relocating the app back into the build folder.
pkgbuild --analyze --root "$PKG_ROOT" "$COMPONENT_PLIST"
/usr/libexec/PlistBuddy -c "Set :0:BundleIsRelocatable false" "$COMPONENT_PLIST"

pkgbuild \
  --root "$PKG_ROOT" \
  --component-plist "$COMPONENT_PLIST" \
  --identifier "$BUNDLE_ID" \
  --version "$VERSION" \
  --install-location "/" \
  "$DIST_ROOT/$PKG_FILENAME"

cat > "$DIST_ROOT/$README_FILENAME" <<README
Axinom Ingest Helper - Release ${VERSION}

What is included
- ${PKG_FILENAME}: macOS installer package
- ${README_FILENAME}: this quick-start file

Install
1. Double-click ${PKG_FILENAME}
2. Follow the installer prompts
3. Launch "${APP_NAME}" from Applications

How it works
- The app starts a local web server and opens your browser automatically.
- No terminal steps are required for end users.
- Desktop runtime auto-shuts down when browser activity stops.
- You can launch it from link/protocol: axinom-ingest://open

Notes
- If macOS blocks the app, open System Settings > Privacy & Security and allow it.
- This release is unsigned unless your team adds code-signing + notarization.
README

echo
echo "Release complete:"
echo "  $DIST_ROOT/$PKG_FILENAME"
echo "  $DIST_ROOT/$README_FILENAME"
