# Result Fields

This document describes the assessment fields returned by the backend and displayed by `WaterMirror`.

## Backend-Returned Fields

- `score`: the backend-calculated WQI5 score
- `category`: the backend-calculated WQI5 category label
- `rating_range`: the human-readable score interval associated with the category
- `assessment`: per-indicator quality labels
- `warnings`: validation or interpretation warnings
- `model_type`: the backend model identifier used for the assessment
- `latency_ms`: backend response timing metadata when available

## Frontend Responsibility

WaterMirror displays backend-returned values and does not recompute WQI5 categories locally.

In particular, the frontend should treat the backend as the source of truth for:

- `score`
- `category`
- `rating_range`
- `warnings`

## Display Notes

- `assessment` is intended for per-indicator feedback.
- `warnings` should be shown when the backend reports out-of-range or interpretation issues.
- `model_type` helps distinguish the `direct_wqi5` baseline from surrogate models.
