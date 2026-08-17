# Contributing

Thank you for contributing to WaterMirror, the Expo frontend for WQI5-based current-state water quality assessment.

## Local Development

WaterMirror uses Node.js/npm and Expo. The companion [WQSurrogateModels](https://github.com/KageRyo/WQSurrogateModels) backend is a separate Python project and may use `uv`; `uv` is not used to run this frontend.

Prerequisites:

- Node.js >= 20.19
- npm
- A running [WQSurrogateModels](https://github.com/KageRyo/WQSurrogateModels) backend for live assessments

Set up the frontend:

```bash
npm ci
cp .env.example .env
npx expo start
```

Run the local checks before opening a pull request:

```bash
npm test
npx expo-doctor
npx expo config --json
```

## Workflow

This project follows GitHub Flow with `main` as the primary branch. Create one topic branch from `main` for each change, push it to your fork or repository, and open a pull request against `main` after the local checks pass.

## Branch Naming

Use `feature/...` for features, documentation, metadata, or maintenance changes and `fix/...` for bug or security corrections.

Examples:

- `feature/update-import-flow`
- `feature/improve-build-docs`
- `fix/api-timeout`

## Commit Messages

Follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/):

```text
type(scope): short description
```

Examples include `feat(calc): add CSV validation`, `fix(api): handle timeout responses`, and `docs(setup): clarify local backend configuration`.

## Pull Requests

Pull requests should explain the user-visible or maintenance impact, link the related issue, list validation commands, and include screenshots or recordings when a UI change affects the app flow. Keep `package.json` marked as `private`; this repository is not an npm package.

## Backend Changes

Changes to the API contract should be coordinated with [WQSurrogateModels](https://github.com/KageRyo/WQSurrogateModels) and documented in the relevant integration guide.

## License

By contributing, you agree that your contributions will be licensed under the project's [Apache License 2.0](LICENSE).
