# Release Process

WaterMirror uses the Expo version in `app.json` as the canonical mobile release
version. Keep the `package.json` version aligned for npm and tooling metadata;
the release workflow still validates against `app.json`.

## Naming convention

Every public GitHub Release uses the same project-specific names:

- tag: `WaterMirror-vX.Y.Z`
- release title: `WaterMirror vX.Y.Z`

The `X.Y.Z` value must match `expo.version` in `app.json`. Update the localized
in-app version strings when the displayed application version changes.

## Checklist

1. Update `expo.version` in `app.json`, `package.json`, and localized version
   display values. Increase `android.versionCode` for a new Android release;
   EAS uses the local app version metadata.
2. Run `npm ci`, `npm test`, `npx expo config --json`, and `npx expo-doctor`.
3. Confirm the companion [WQSurrogateModels](https://github.com/KageRyo/WQSurrogateModels)
   release and API contract are compatible when the backend changes too.
4. Ensure the repository visibility and public-release review are complete.
5. Complete the [one-time EAS setup](android-build.md#one-time-eas-setup),
   including project linkage, Android signing credentials, the `EXPO_TOKEN`
   Actions secret. Optionally configure a default backend URL in the
   `EXPO_PUBLIC_API_BASE_URL` Actions variable and EAS production environment.
6. After the release changes are merged and CI passes, create the annotated
   `WaterMirror-vX.Y.Z` tag on the intended commit and push that tag.
7. Monitor the **Build and publish Android release** workflow and verify its
   APK and checksum assets before announcing the release.

## Automated APK release

Pushing `WaterMirror-v*` starts validation, then a non-interactive EAS
`release-apk` build that waits for completion. Validation checks public
repository visibility, tag/Expo/package version alignment, and a valid EAS
project ID. Users can set the backend URL in the app;
an initial build-time URL is optional. The release title is derived from the
validated version as `WaterMirror vX.Y.Z`.

The workflow downloads the finished Android APK, checks its ZIP structure,
Android signature, and the HTTP backend allowance in the compiled manifest,
and creates `SHA256SUMS.txt`. A separate job receives the
verified assets, checks their hashes again, creates a draft with both assets,
then publishes it. Build or upload failures therefore cannot publish a
source-only release. A successful release contains:

- `WaterMirror-vX.Y.Z.apk`
- `SHA256SUMS.txt`
- GitHub-generated source archives

Create releases by pushing tags through this workflow. Manually publishing a
release in the GitHub UI bypasses the APK build. The former validation on
`release.published` has been replaced by validation before building.

If a build fails, fix its configuration and rerun the failed workflow. If
publication fails after draft creation, inspect the draft and its assets
before retrying; the workflow deliberately refuses to overwrite an existing
release or replace its artifacts. Retain failed-run logs for diagnosis.

Release assets must come from the tagged source. Do not retag an existing
public release or replace its signing key to repair a build.
