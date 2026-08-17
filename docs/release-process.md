# Release Process

WaterMirror uses the Expo version in `app.json` as the mobile release version.
The private `package.json` version is dependency metadata and is not the public
application release number.

## Naming convention

Every public GitHub Release uses the same project-specific names:

- tag: `WaterMirror-vX.Y.Z`
- release title: `WaterMirror vX.Y.Z`

The `X.Y.Z` value must match `expo.version` in `app.json`. Update the localized
in-app version strings when the displayed application version changes.

## Checklist

1. Update `expo.version` in `app.json` and the localized version display values.
2. Run `npm ci`, `npm test`, `npx expo config --json`, and `npx expo-doctor`.
3. Confirm the companion [WQSurrogateModels](https://github.com/KageRyo/WQSurrogateModels)
   release and API contract are compatible when the backend changes too.
4. Ensure the repository visibility and public-release review are complete.
5. Create and publish the GitHub Release with the exact tag and title format
   above.

The release metadata workflow rejects a published release with a mismatched
tag, title, version, or repository visibility.
