# Mobile Identity and Network Security

## Application identifiers

The current iOS bundle identifier and Android package name are both `com.kaeryo.watermirror`. The repository treats this value as the canonical application identity. Do not change it after distribution without an explicit app-store migration plan because a new identifier is a different application and cannot receive upgrades from the existing one.

The release owner must confirm that this identifier is intentional before the first public store release. No identifier change is included in this review.

## Network security by build variant

Local development and internal preview builds allow HTTP backends so the app can connect to a local machine or LAN address. Production builds remove iOS `NSAllowsArbitraryLoads` and set Android `usesCleartextTraffic` to `false`; production deployments must use an HTTPS API endpoint.

`app.config.js` selects the production policy when `APP_VARIANT=production` or `EAS_BUILD_PROFILE=production`. `eas.json` sets `APP_VARIANT` explicitly for the `preview` and `production` profiles. A local development run defaults to the development policy so the documented HTTP backend workflow remains available.

## Native permissions

The current app uses the system document picker for CSV uploads and AsyncStorage for local result persistence. It does not use the camera or photo library. The unused camera and photo-library usage descriptions, media-library permission request, and `expo-media-library` dependency were removed from the application configuration and source.
