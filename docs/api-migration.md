# API Migration

This document summarizes the frontend migration from legacy root-level endpoints to the `/api/v2/*` contract.

## Legacy Endpoints

Older frontend versions may call endpoints such as:

- `POST /predict`
- `POST /score/total/`
- `POST /score/all/`
- `GET /status`

These paths remain on the backend for backward compatibility, but they are deprecated.

## Current WaterMirror API Usage

Current WaterMirror uses:

- `GET /api/v2/health`
- `POST /api/v2/assessment`
- `POST /api/v2/assessment/csv/summary`
- `GET /api/v2/percentile`
- `GET /api/v2/categories`

## Configuration Reminder

`EXPO_PUBLIC_API_BASE_URL` should point to the backend service root only.

Do not append `/api/v2`, because `src/utils/apiClient.js` appends the versioned path internally.
