# Copilot instructions

Guidance for AI coding agents working in this repository. The fuller version of this document is [CLAUDE.md](../CLAUDE.md) at the repo root — keep the two in sync.

## Commands

- Build: `npm run build` (`rimraf ./dist` → `tsc` → copy plugin UI html). All steps are required for a working package.
- Lint: `npm run lint` (`eslint . --max-warnings=0`, CI fails on warnings); `npm run lint:fix` to autofix.
- Test: `npm test` (vitest, colocated `src/**/*.test.ts`).
- Local dev loop: `npm run watch` (rebuild + restart `homebridge -U ./test/hbConfig -D` on changes; `./test/hbConfig` is gitignored, create locally).

## Key architecture facts

- Homebridge dynamic platform plugin that keeps No-IP dynamic-DNS hostnames updated with the machine's public IP; each hostname is a HomeKit contact sensor (open = out of sync).
- `src/index.ts` registers a runtime HAP/Matter proxy (`enableMatter`/`preferMatter` config); keep `api.matter?.…` calls optional-chained.
- `ContactSensor` (`src/devices/contactsensor.ts`) extends `deviceBase` and is stored as `accessory.control`; it fetches the public IP from the configured provider (ipify/getmyip/ipapi/my-ip/ipinfo, IPv4 or IPv6), calls No-IP's `dynupdate` API, and maps `good`/`nochg`/error responses to sensor state.
- Requests use undici; usernames are validated with `validator.isEmail`.
- Use the platform's leveled log helpers (`infoLog`, `debugLog`, …) so user logging settings are respected.

## Conventions

- TypeScript ESM: relative imports need `.js` extensions.
- ESLint `@antfu/eslint-config`: single quotes, sorted exports; run `npm run lint:fix` before committing.
- `config.schema.json` must stay in sync with the config interfaces in `src/settings.ts`.
- Copyright headers in `src/` credit @donavanbecker (original author) — leave them in place.
