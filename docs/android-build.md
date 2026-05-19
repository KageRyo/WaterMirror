# Android Build

This guide covers Android-specific build checks for `WaterMirror`.

## Preconditions

- Node.js 16+ or 18+
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
- Use the `preview` profile for APK testing and the `production` profile for AAB generation.

## Crash Triage

If a preview APK crashes on launch:

1. Confirm the backend URL in `.env`.
2. Rebuild after `npx expo start --clear`.
3. Capture logs with `adb logcat`.
4. Check whether the crash happens before or after the first API request.
