# Mobile Identity and Network Security

## Application identifiers

The current iOS bundle identifier and Android package name are both `com.kaeryo.watermirror`. The repository treats this value as the canonical application identity. Do not change it after distribution without an explicit app-store migration plan because a new identifier is a different application and cannot receive upgrades from the existing one.

The release owner has confirmed that this identifier is intentional. No identifier change is included in this review.

## Network security by build variant

Local development and internal preview builds allow HTTP backends so the app can connect to a local machine or LAN address. The release owner confirmed that this exception is for development and preview only. Production builds remove iOS `NSAllowsArbitraryLoads` and set Android `usesCleartextTraffic` to `false`; production deployments must use an HTTPS API endpoint.

`app.config.js` selects the production policy when `APP_VARIANT=production` or `EAS_BUILD_PROFILE=production`. `eas.json` sets `APP_VARIANT` explicitly for the `preview` and `production` profiles. A local development run defaults to the development policy so the documented HTTP backend workflow remains available.

## Native permissions

The current app uses [`expo-document-picker`](https://docs.expo.dev/versions/v57.0.0/sdk/document-picker/) for CSV uploads and AsyncStorage for local result persistence. DocumentPicker opens the operating system's document-provider UI; it does not require the photo-library permission used by [`expo-media-library`](https://docs.expo.dev/versions/v57.0.0/sdk/media-library/). The upload path keeps `copyToCacheDirectory: true` so the selected file can be read immediately after selection.

The app does not use the camera or photo library. The unused camera and photo-library usage descriptions, media-library permission request, and `expo-media-library` dependency were removed from the application configuration and source. If CSV selection fails on a device after this change, investigate the system document provider or file URI handling rather than adding photo-library permission back to the app.


## Expo toolchain dependency fixes

WaterMirror pins Zod 4.6.7 for Expo CLI and its MCP tunnel. This fixes GHSA-mrhx-c7xc-m3w5 without keeping an affected Zod 3 copy. The published MCP tunnel 0.2.4 still uses the Zod 3 JSON Schema converter, which silently drops nested command parameters with Zod 4. The project therefore installs that tunnel locally and applies a narrow compatibility patch: use Zod 4's native draft-7 converter and update its prompt declaration types. The tunnel transport is not started unless explicitly requested; adding the package does not enable MCP networking.

`npm ci` runs `scripts/patch-toolchain.cjs --apply`. Exact original and patched file SHA-256 values live in `security/toolchain-patches.json`; unknown dependency contents fail installation instead of receiving a best-effort patch. An install with scripts disabled is rejected by `npm run audit:ci` until the compatibility patch is applied. The Docker dependency layer includes the patch script/policy before installation. Clean CI, Docker and EAS installs use the same locked inputs.

For GHSA-86w9-cpqp-85rv, no fixed node-forge npm release was available on 2026-10-25. The override uses the immutable HTTPS source archive for upstream [forge PR1152](https://github.com/digitalbazaar/forge/pull/1152), commit `ceba34402e329f0365134f23fe19898756527d65`. Its only runtime change relative to 1.4.0 checks the nested DigestAlgorithm element count. The source reports version 1.4.1-0 and is an unreleased upstream patch, not an official stable release. The lock records archive integrity; the security gate additionally checks the exact reviewed RSA file hash and the CLI's resolved dependency, since a registry audit alone is insufficient evidence for a source-archive dependency.

The former unpatched-advisory exemptions were removed. The audit gate still runs npm audit and rejects high/critical findings, incomplete reports, missing patches or changed security source. Regression tests cover malformed RSA DigestInfo rejection alongside valid encodings, early rejection of oversized constrained Zod collections, and real CLI/MCP nested input, output and prompt-schema registration. No remote tunnel or plugin command runs in those tests.

Remove the local MCP patch and source-archive override only after the respective official packages ship compatible fixes and the same checks pass. These dependencies belong to the Expo development/build toolchain; this change does not claim that the published mobile binary contained the vulnerable Node APIs.
