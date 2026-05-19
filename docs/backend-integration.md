# Backend Integration

This document describes how `WaterMirror` connects to `WQSurrogateModels`.

## Companion Repository Relationship

`WaterMirror` is the mobile frontend.
`WQSurrogateModels` is the FastAPI backend and model repository.

The integration contract is the backend's `/api/v2/*` API.

## Base URL Configuration

Set `EXPO_PUBLIC_API_BASE_URL` to the backend service root. Do not append `/api/v2`, because `src/utils/apiClient.js` adds that path internally.

### Local backend on the same machine

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://localhost:8001
```

### Physical phone testing on the same LAN

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://<your-lan-ip>:8001
```

### Lab deployed backend

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://140.123.105.126:8011
```

## Primary Endpoints Used by WaterMirror

- `GET /api/v2/health`
- `POST /api/v2/assessment`
- `POST /api/v2/assessment/csv/summary`
- `GET /api/v2/percentile`
- `GET /api/v2/categories`

## Result Display Contract

WaterMirror should display backend-returned fields directly:

- `score`
- `category`
- `rating_range`
- `warnings`
- `assessment`

WaterMirror should not re-derive WQI5 category thresholds locally.

## Legacy Compatibility

The backend still exposes legacy root-level endpoints such as `/predict` and `/score/total/`, but they are deprecated. New frontend work should target `/api/v2/*`.

## Related Backend Documentation

- API contract: <https://github.com/KageRyo/WQSurrogateModels/blob/main/docs/watermirror-integration.md>
- Endpoint reference: <https://github.com/KageRyo/WQSurrogateModels/blob/main/docs/api-reference.md>
- Full-stack local run: <https://github.com/KageRyo/WQSurrogateModels/blob/main/docs/fullstack-local-run.md>
