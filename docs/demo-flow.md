# Demo Flow

This document summarizes the main end-user flows demonstrated by `WaterMirror`.

## Manual Input Flow

1. Enter values for `DO`, `BOD`, `NH3N`, `EC`, and `SS`.
2. Validate that all five indicators are present.
3. Send `POST /api/v2/assessment`.
4. Display backend-returned `score`, `category`, `rating_range`, `warnings`, and `assessment`.

## CSV Upload Flow

1. Select a CSV file with header `DO,BOD,NH3N,EC,SS`.
2. Validate the header shape before upload when possible.
3. Send `POST /api/v2/assessment/csv/summary`.
4. Display the summary assessment returned by the backend.

## Architecture Reminder

WaterMirror is responsible for user interaction and visualization.
WQSurrogateModels is responsible for WQI5 calculation and assessment logic.
