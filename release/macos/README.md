# macOS Release Packaging

Build a double-click installer package (`.pkg`) for team distribution.

## Output

The build script creates:

- `release/macos/dist/AxinomIngestHelper-<version>.pkg`
- `release/macos/dist/AxinomIngestHelper-<version>-README.txt`

## Build

```bash
cd /Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates
./release/macos/build_macos_release.sh
```

Optional explicit version:

```bash
./release/macos/build_macos_release.sh 1.0.0
```

## Requirements

- macOS
- Xcode Command Line Tools (`pkgbuild` available)
- Internet access during build (for `pyinstaller` install in local venv)

## Distribution

Share the generated `.pkg` + sidecar README from `release/macos/dist/`.

## Notes

- End users do not need Python or terminal.
- For enterprise rollout, add code signing + notarization as a follow-up.
- Desktop runtime now auto-shuts down after inactivity (about 90 seconds without browser activity/heartbeat).
- If the app is already running on `http://127.0.0.1:8080`, launching the app again reopens the browser to that running session.
- Installer registers protocol `axinom-ingest://` so a saved link like `axinom-ingest://open` can launch the app.
- Build uses `release/macos/assets/AxinomIngestHelper.icns` for the app icon.
- If you previously built with an older script and see `Permission denied` under `release/macos/build/pkgroot`, the new script avoids this by using an ephemeral `/tmp` staging root.
