# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run build` — `rimraf ./dist && tsc && npm run plugin-ui`. The `plugin-ui` step rsyncs `src/homebridge-ui/public/index.html` into `dist/` (the UI server itself is TypeScript and compiled by `tsc`). Skipping it produces a broken published package.
- `npm run lint` — ESLint over the whole repo with `--max-warnings=0`. CI fails on any warning. `npm run lint:fix` to autofix.
- `npm test` — vitest, colocated `src/**/*.test.ts` files. `npm run test:watch` and `npm run test-coverage` also available.
- `npm run watch` — build, `npm link`, then `nodemon`: recompiles and restarts `homebridge -U ./test/hbConfig -D` on `src/**/*.ts` changes. `./test/hbConfig` is gitignored; create it locally with a `config.json` containing No-IP credentials.
- `npm run docs` — typedoc into `docs/` (gitignored — generated output is never committed).
- `npm run prepublishOnly` — lint then build; runs automatically on publish.

CI (`.github/workflows/build.yml`) runs install + lint on Node 22.x/24.x. Releases publish via `.github/workflows/release.yml`: a GitHub release (tag `vX.Y.Z`) publishes to npm's `latest` tag; pushes to `beta-X.Y.Z` / `alpha-X.Y.Z` branches publish incrementing prerelease versions to the `beta` / `alpha` tags.

Supported Node: `^22.12.0 || ^24.0.0`. Homebridge: `^1.11.4 || ^2.0.0`.

## Architecture

Homebridge dynamic platform plugin (`platform: "NoIP"`, package `@homebridge-plugins/homebridge-noip`) that keeps No-IP dynamic-DNS hostnames pointed at the public IP of the machine Homebridge runs on, surfacing sync status as a HomeKit contact sensor per hostname.

### HAP/Matter platform selection

`src/index.ts` registers a runtime proxy that picks `NoIPMatterPlatform` (`src/NoIPMatterPlatform.ts`) when Homebridge reports Matter available+enabled (per `enableMatter`/`preferMatter` config), otherwise the HAP `NoIPPlatform` (`src/platform.ts`). Matter API calls must stay optional-chained.

### Update flow (`src/devices/contactsensor.ts`)

`ContactSensor` extends `deviceBase` and is stored on the accessory as `accessory.control` (module augmentation in `src/devices/device.ts`). On each refresh interval (rxjs `interval` subscription) it:
1. Looks up the current public IP from the configured `ipProvider` (ipify.org, getmyip.dev, ipapi.co, my-ip.io or ipinfo.io), IPv4 or IPv6 per `device.ipv4or6`.
2. Calls No-IP's `dynupdate` API with basic auth to renew the hostname (`renewDomain`).
3. Parses the `good`/`nochg`/error response codes (`parseStatus`) and sets the contact sensor state — open means the hostname is out of sync or errored.

Requests go through undici. The platform validates the username with `validator.isEmail`.

### Logging

The platform and `deviceBase` expose leveled log helpers (`infoLog`, `warnLog`, `errorLog`, `debugLog`, …) gated by `config.options.logging` with per-device overrides. Use these instead of `this.log` directly.

## Conventions

- TypeScript ESM (`"type": "module"`): relative imports use `.js` extensions even from `.ts` source.
- ESLint is `@antfu/eslint-config` (flat config in `eslint.config.js`): single quotes, 1tbs braces, `curly` multi-line only, sorted exports. Run `npm run lint:fix` before committing.
- `config.schema.json` defines the Homebridge UI form and must stay in sync with the interfaces in `src/settings.ts` (`NoIPPlatformConfig`, `devicesConfig`, `options`).
- Copyright headers in `src/` credit @donavanbecker, the original plugin author — leave them in place.
