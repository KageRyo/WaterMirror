# Android Build

This guide covers Android-specific build checks for `WaterMirror`.

## Preconditions

- Node.js >= 20.19
- Expo CLI through `npx expo`
- EAS CLI if building cloud artifacts

## Recommended Verification Flow

```bash
npm test
npx expo-doctor
npx expo start --clear
eas build -p android --profile preview
```

## Configuration Notes

- Keep Android app configuration in `app.json` consistent with the Expo schema.
- Do not place Android permission fields inside `adaptiveIcon`.
- Use `preview` for APK testing, `release-apk` for public APKs, and
  `production` for Play Store AABs.
- `release-apk` inherits the production profile and uses the EAS `production`
  environment with `APP_VARIANT=production`. It explicitly sets
  `ALLOW_HTTP_BACKEND=true` so users can connect to their own HTTP IP addresses.
  This public APK policy was chosen to support user-managed LAN backends; the
  AAB profile retains its existing HTTPS network policy.
- Open **Backend settings** in the app to enter a service root, such as
  `http://192.168.1.20:8001` or `https://water.example.com`, test connectivity,
  and save it on the device. Do not append `/api/v2`. The selected URL persists
  across restarts and is used by all API requests.
- HTTP does not encrypt measurements or responses. Prefer HTTPS for public
  services; use HTTP on trusted networks. An HTTPS certificate must be trusted
  by the device. A web build loaded over HTTPS cannot access an HTTP backend
  because browsers block mixed content.
- `EXPO_PUBLIC_API_BASE_URL` is an optional initial URL for a build; users can
  override it in the app. Without one, a release build asks users to configure
  their backend before entering measurements.

## One-time EAS setup

The repository must be linked to your real Expo project before CI can build.
Project IDs are public metadata; access tokens and signing keys are secrets.

```bash
npx eas-cli@24.8.0 login
npx eas-cli@24.8.0 whoami
npx eas-cli@24.8.0 init
```

Use the Expo account that owns WaterMirror (including GitHub login if that is
how the account was created). Review and commit the generated
`extra.eas.projectId` in `app.json`; the dynamic config preserves it. Do not
insert a placeholder ID. If an existing project is available, link it with
`npx eas-cli@24.8.0 init --id <existing-project-id>`.

If you want a default backend URL, configure it in the EAS production
environment. It is optional when users choose their own backend:

```bash
npx eas-cli@24.8.0 env:set --environment production \
  --name EXPO_PUBLIC_API_BASE_URL --value https://your-backend.example.com \
  --visibility plaintext
```

Replace the example URL with the deployed backend. Perform the first build
with `npx eas-cli@24.8.0 build --platform android --profile release-apk`.
The first build can prompt
for Android signing credentials. Reuse the existing keystore when available;
generating a different key can prevent updates to already installed APKs.
Keep signing credentials in EAS, never in Git.

Create an Expo access token in the Expo account settings and store it as the
GitHub Actions secret `EXPO_TOKEN`. Enter it through the hidden prompt:

```bash
gh secret set EXPO_TOKEN --repo KageRyo/WaterMirror
gh variable set EXPO_PUBLIC_API_BASE_URL --repo KageRyo/WaterMirror \
  --body https://your-backend.example.com
```

The GitHub Actions URL variable is optional. If configured, use the same URL
in GitHub and the EAS production environment. The
`EXPO_PUBLIC_*` values are bundled into the app and must not contain secrets.
Then verify project resolution and a complete non-interactive build:

```bash
npx eas-cli@24.8.0 project:info
npx eas-cli@24.8.0 build --platform android --profile release-apk \
  --non-interactive --wait --json
```

Install the APK on a device and check launch and HTTP/HTTPS backend access. A
successful config check alone does not prove that an APK installs or runs.

See [Expo's CI prerequisites](https://docs.expo.dev/build/building-on-ci/).

## Crash Triage

If a preview APK crashes on launch:

1. Confirm the backend URL in `.env`.
2. Rebuild after `npx expo start --clear`.
3. Capture logs with `adb logcat`.
4. Check whether the crash happens before or after the first API request.
