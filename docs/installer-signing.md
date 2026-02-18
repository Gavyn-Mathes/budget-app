# Installer Signing and Notarization

This project uses `electron-builder` for installers.

Current policy:

- Windows: unsigned
- Linux: signed artifacts for distribution
- macOS: unsigned (no Apple Developer ID)

## Windows status

Windows builds are intentionally unsigned in this repo configuration.
Users should expect SmartScreen "Unknown publisher" warnings.

## Linux signing

`electron-builder` can produce `AppImage` and `deb`, but Linux trust usually comes from your distribution channel:

- For `deb`: sign the APT repository metadata (recommended for hosted repo distribution).
- For `AppImage`: publish checksum + detached GPG signature alongside the artifact.

Example (run after `npm run dist:linux`):

```bash
sha256sum dist/*.AppImage > dist/SHA256SUMS
gpg --armor --detach-sign dist/SHA256SUMS
```

## macOS status

macOS builds are intentionally unsigned in this repo configuration.
They can still run, but users should expect Gatekeeper warnings when opening the app.

## Update behavior

The app checks for updates automatically after startup (silent background check) and periodically while running.
If a newer version is found, it prompts the user and opens the release page on confirmation.
Users can also manually check from "Help > Check for Updates...".
It does not auto-download or auto-install updates.

## Build examples

PowerShell:

```powershell
# Windows unsigned installer
npm run dist:win
```

```powershell
# macOS unsigned build (run on macOS host)
npm run dist:mac
```
