# CSV Format

`WaterMirror` accepts CSV uploads for batch assessment through the backend summary endpoint.

## Required Header

```text
DO,BOD,NH3N,EC,SS
```

Column order should match the header above.

## Example

```csv
DO,BOD,NH3N,EC,SS
7.2,3.1,0.5,280,45
6.8,2.9,0.4,300,38
```

## Notes

- Header names are case-sensitive.
- Extra columns should be avoided unless backend parsing is updated deliberately.
- Missing required columns will cause validation or parsing failures.
- WaterMirror sends the uploaded file to `POST /api/v2/assessment/csv/summary`.
