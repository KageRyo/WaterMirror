# Mobile Identity and Network Security

## Application identifiers

The current iOS bundle identifier and Android package name are both `com.kaeryo.watermirror`. The repository treats this value as the canonical application identity. Do not change it after distribution without an explicit app-store migration plan because a new identifier is a different application and cannot receive upgrades from the existing one.

The release owner has confirmed that this identifier is intentional. No identifier change is included in this review.

## Network security by build variant

Local development and internal preview builds allow HTTP backends so the app can connect to a local machine or LAN address. The release owner confirmed that this exception is for development and preview only. Production builds remove iOS `NSAllowsArbitraryLoads` and set Android `usesCleartextTraffic` to `false`; production deployments must use an HTTPS API endpoint.

`app.config.js` selects the production policy when `APP_VARIANT=production` or `EAS_BUILD_PROFILE=production`. `eas.json` sets `APP_VARIANT` explicitly for the `preview` and `production` profiles. A local development run defaults to the development policy so the documented HTTP backend workflow remains available.

## Native permissions

The current app uses [`expo-document-picker`](https://docs.expo.dev/versions/v54.0.0/sdk/document-picker/) for CSV uploads and AsyncStorage for local result persistence. DocumentPicker opens the operating system's document-provider UI; it does not require the photo-library permission used by [`expo-media-library`](https://docs.expo.dev/versions/v54.0.0/sdk/media-library/). The upload path keeps `copyToCacheDirectory: true` so the selected file can be read immediately after selection.

The app does not use the camera or photo library. The unused camera and photo-library usage descriptions, media-library permission request, and `expo-media-library` dependency were removed from the application configuration and source. If CSV selection fails on a device after this change, investigate the system document provider or file URI handling rather than adding photo-library permission back to the app.
