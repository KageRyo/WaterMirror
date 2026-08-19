# Troubleshooting

## Cannot connect to the backend

- Confirm `EXPO_PUBLIC_API_BASE_URL` points to the backend service root.
- Confirm the backend is reachable through `GET /api/v2/health` and ready through `GET /api/v2/ready`.
- Do not include `/api/v2` in `EXPO_PUBLIC_API_BASE_URL`.

## Physical phone cannot use `localhost`

`localhost` on a physical device points to the device itself, not your development machine.

Use:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://<your-lan-ip>:8001
```

## CORS errors in web builds

The backend must allow the frontend origin through `CORS_ALLOW_ORIGINS`.

Example:

```dotenv
CORS_ALLOW_ORIGINS=http://localhost:8081,https://your-watermirror-domain.com
```

## Request timeout

- Increase `EXPO_PUBLIC_REQUEST_TIMEOUT_MS` if needed.
- Check whether the backend is loading large model artifacts on startup.
- Verify that the selected backend model is available.

## Backend is running but not ready

`/api/v2/health` only confirms that the process is reachable. If WaterMirror
reports that the backend is not ready, check `GET /api/v2/ready` for dataset and
model availability. The application does not retry assessment submissions
automatically because they are not treated as safely repeatable.

When an assessment error includes a support reference, provide that request ID
when investigating the backend JSON logs.

## CSV upload fails

- Confirm the header is exactly `DO,BOD,NH3N,EC,SS`.
- Remove empty rows.
- Check numeric formatting in all required columns.

## Android APK crashes

- Validate the Expo config with `npx expo-doctor`.
- Rebuild after clearing Expo cache.
- Capture logs with `adb logcat` before changing UI code.
