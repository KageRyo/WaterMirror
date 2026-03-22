# WaterMirror

[![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE) [![Expo](https://img.shields.io/badge/Expo-%5E48.0.0-brightgreen.svg)](https://expo.dev)

Project Summary
---------------
WaterMirror is a cross-platform mobile client for collecting and submitting water quality measurements to an analysis backend. The app provides data upload, validation, and results display features in a compact, production-oriented interface.

Supported Indicators
--------------------
- Dissolved oxygen (DO)
- Biochemical oxygen demand (BOD)
- Suspended solids (SS)
- Ammonia nitrogen (NH3-N)
- Electrical conductivity (EC)

Requirements
------------
- Node.js 16+ or 18+
- npm 8+ or yarn 1/3
- Expo CLI (`npx expo`) for local run

Quickstart
----------
```bash
git clone https://github.com/KageRyo/WaterMirror.git
cd WaterMirror
npm install
```

Set backend config in `src/config.json`:
```json
{
  "api_url": "http://127.0.0.1",
  "port": "8000"
}
```

Start the app:
```bash
npx expo start
```

Deployment
----------
- For local development, run on simulator/emulator via Expo.
- For production, follow Expo's published app workflow.

Integration with MPR_Model
--------------------------
WaterMirror expects an API server endpoint for inferencing. Use MPR_Model (or similar) as backend and ensure network authorization is configured.

CSV upload format
-----------------
The accepted format is CSV with a header row containing columns:
`DO,BOD,NH3N,EC,SS`

Example row:
`7.2,3.1,0.5,280,45`

Permissions
-----------
- File system access for upload
- Network access for backend communication

Project Structure
-----------------
- `src/`: application source code
- `assets/`: static assets and images
- `src/config.json`: environment configuration

Contributing
------------
1. Fork repository
2. Create feature branch
3. Add tests/manual test notes
4. Open pull request

License
-------
Apache License 2.0. See `LICENSE`.

Authors
-------
- Chien-Hsun Chang (KageRyo)
- Kuo-Wei Wu (RRAaru)

