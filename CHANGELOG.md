## v4.2.5 (Pending Release)

### Changed

- chore: keep test files out of the published package
- chore(github): run the build and tests in ci, on node 22, 24 and 26
- chore: use the same lint setup across every plugin
- chore: add a changelog:sync script to populate the pending section from the commits
- chore: count a repeated commit subject once when syncing the changelog
- chore(github): check the changelog against the commits in ci
- chore: restore the original author and remove personal funding links
- docs: add node 26 to the supported node versions
- chore: allow dependency install scripts by package name rather than pinned version, so a version bump cannot silently block a native build
- chore: exclude test files and the test config from the published package
- fix: restore debug logging when the plugin runs in a child bridge
- fix: put the plugin settings where the code reads them, so auto renewal actually runs
- fix: send a real version in the user agent, rather than the word undefined
- fix: use the right my-ip.io address for ipv6, so the lookup can work
- fix: stop two refreshes running at once, so no-ip never gets duplicate updates
- fix: report a successful ip update as a success, not a warning
- fix: stop the polling and renewal timers when homebridge shuts down
- fix: stop confirming updateRate and pushRate in the log, when nothing reads either
- fix: stop the auto renewal timer firing a thousand times a second, instead of once a month
- chore(deps): dependency updates

## v4.2.4 (2026-07-28)

### Changed

- chore(github): allow the codeql scan to be started manually
- Bump undici from 8.7.0 to 8.8.0 (#186)
- chore(github): stop concurrent release runs racing for the same version
- chore: add the supports-matter keyword
- chore(github): use the shared homebridge action to deprecate past pre-releases
- style(ui): standardise the custom ui layout and sync the support tab with the readme
- fix(schema): declare required fields the standard way so the homebridge ui stops reporting a config validation failure
- chore: declare the supports-hap transport keyword for the homebridge ui
- chore(deps): dependency updates

## v4.2.3 (2026-07-20)

### Changed

- fix(schema): give the logging levels clear, distinct names
- chore(deps): dependency updates

## v4.2.2 (2026-07-18)

### Changed

- chore(github): update the setup-node action to v7
- chore(deps): dependency updates

## v4.2.1 (2026-07-15)

### Changed

- chore(deps): update dependencies
- chore: add .idea to .gitignore
- chore(github): align workflows, funding and issue templates with the other org plugins
- chore: align npm publishing files with the other org plugins
- chore: standardise the eslint setup with the other org plugins
- refactor: store device instances on their accessories like the other org plugins
- style: apply the standardised lint rules
- chore: standardise the package scripts and publishing config
- chore: update the plugin metadata for the new maintainer
- chore: sync the package version with the released v4.2.0
- docs: refresh the readme
- docs: add claude and copilot instructions files
- docs: use the standard org readme banner
- fix: keep matter display names within the 32 character limit
- fix: register matter contact sensors with the required device type (#183)

## [4.2.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v4.2.0) (2026-04-29)

### What's Changed
- **Added Homebridge Matter support with automatic HAP fallback**
  - The plugin now supports Homebridge v2.0+ Matter API integration. Devices are registered using Matter when available and enabled; otherwise, the plugin falls back to standard HAP (HomeKit Accessory Protocol) registration.
  - Platform selection is automatic and configurable via `preferMatter` and `enableMatter` options.
- Updated all dependencies to latest versions
- Removed unused dependencies
- Updated Homebridge and Node.js engine requirements
- Addressed security vulnerabilities in dependencies (some may remain due to upstream issues)

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v4.1.4...v4.2.0

## [4.1.4](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v4.1.4) (2026-04-29)

## What's Changed
* No notable changes

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v4.1.3...v4.1.4

## [4.1.3](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v4.1.3) (2025-09-18)

## What's Changed
* No notable changes

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v4.1.2...v4.1.3

## [4.1.2](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v4.1.2) (2025-03-04)

# *No New Releases During Lent*

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v4.1.1...v4.1.2

## [4.1.1](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v4.1.1) (2025-01-25)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v4.1.0...v4.1.1

## [4.1.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v4.1.0) (2025-01-16)

### What's Changes
- Added ipv6 support [#161](https://github.com/homebridge-plugins/homebridge-noip/pull/161), Thanks [@v0lume](https://github.com/v0lume)
- Added support for other ip providers
  - `ipify.org`, `ipinfo.io`, `ipapi.co`, `my-ip.io`, and `getmyip.dev`
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v4.0.0...v4.1.0

## [4.0.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v4.0.0) (2025-01-16)

### What's Changes
- This plugins has moved to a scoped plugin under the `@homebridge-plugins` org.
  - Homebridge UI is designed to transition you to the new scoped plugin.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v3.0.6...v4.0.0

## [3.0.6](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v3.0.6) (2024-11-04)

### What's Changes
- Fix refreshRate Issue

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v3.0.5...v3.0.6

## [3.0.5](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v3.0.5) (2024-11-03)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v3.0.4...v3.0.5

## [3.0.4](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v3.0.4) (2024-05-26)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v3.0.3...v3.0.4

## [3.0.3](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v3.0.3) (2024-05-26)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v3.0.2...v3.0.3

## [3.0.2](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v3.0.2) (2024-02-13)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v3.0.1...v3.0.2

## [3.0.1](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v3.0.1) (2024-01-31)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v3.0.0...v3.0.1

## [3.0.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v3.0.0) (2023-12-23)

### What's Changes
- Moved from CommonJS to ES Module
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v2.0.4...v3.0.0

## [2.0.4](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v2.0.4) (2023-12-15)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v2.0.3...v2.0.4

## [2.0.3](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v2.0.3) (2023-11-26)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v2.0.2...v2.0.3

## [2.0.2](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v2.0.2) (2023-10-31)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v2.0.1...v2.0.2

## [2.0.1](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v2.0.1) (2023-08-27)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v2.0.0...v2.0.1

## [2.0.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v2.0.0) (2023-08-19)

### What's Changes
#### Major Changes
- Added Support to update multiple hostnames.
  - Must setup hostnames again after upgrading to v2.0.0

#### Other Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.6.2...v2.0.0

## [1.6.2](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.6.2) (2023-04-07)

### What's Changes
- Housekeeping and updated dependencies.
  - This release will end support for Node v14.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.6.1...v1.6.2

## [1.6.1](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.6.1) (2022-12-08)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.6.0...v1.6.1

## [1.6.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.6.0) (2022-10-18)

### What's Changes
- Added Config to allow manually setting firmware version.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.5.8...v1.6.0

## [1.5.8](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.5.8) (2022-08-31)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.5.7...v1.5.8

## [1.5.7](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.5.7) (2022-06-25)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.5.6...v1.5.7

## [1.5.6](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.5.6) (2022-05-04)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.5.5...v1.5.6

## [1.5.5](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.5.5) (2022-03-19)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.5.4...v1.5.5

## [1.5.4](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.5.4) (2022-02-15)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.5.3...v1.5.4

## [1.5.3](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.5.3) (2022-02-12)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.5.2...v1.5.3

## [1.5.2](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.5.2) (2022-01-29)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.5.1...v1.5.2

## [1.5.1](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.5.1) (2022-01-22)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.5.0...v1.5.1

## [1.5.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.5.0) (2022-01-13)

### What's Changes

- Removed dependency `easy-ip` to use built in Public IP finder.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.4.0...v1.5.0

## [1.4.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.4.0) (2022-01-06)

### What's Changes

- Change from dependency `systeminformation` to `easy-ip`.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.3.0...v1.4.0

## [1.3.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.3.0) (2022-01-06)

### What's Changes

### Major Change To `Logging`:

- Added the following Logging Options:
  - `Standard`
  - `None`
  - `Debug`
- Removed Device Logging Option, which was pushed into new logging under debug.
- Added Device Logging Override for each Device, by using the Device Config.
- Change from dependency `public-ip` to `systeminformation` to `easy-ip`.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.2.4...v1.3.0

## [1.2.4](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v1.2.4) (2021-12-15)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.2.3...v1.2.4

## [1.2.3](https://github.com/homebridge-plugins/homebridge-noip/compare/v1.2.2...v1.2.3) (2021-11-12)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.2.2...v1.2.3

## [1.2.2](https://github.com/homebridge-plugins/homebridge-noip/compare/v1.2.1...v1.2.2) (2021-10-28)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.2.1...v1.2.2

## [1.2.1](https://github.com/homebridge-plugins/homebridge-noip/compare/v1.2.0...v1.2.1) (2021-10-20)

### What's Changes

- Update Plugin Debug Logging Config Setting to show more logs and added Device Logging option.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.2.0...v1.2.1

## [1.2.0](https://github.com/homebridge-plugins/homebridge-noip/compare/v1.1.2...v1.2.0) (2021-10-13)

### What's Changes

- Removed dependency for `no-ip` and implemented built in noip updater.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.1.2...v1.2.0

## [1.1.2](https://github.com/homebridge-plugins/homebridge-noip/compare/v1.1.1...v1.1.2) (2021-10-02)

### What's Changes

- Potential Fix for Error: `Possible EventEmitter memory leak detected. 11 error listeners added to [NoIP]`

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.1.1...v1.1.2

## [1.1.1](https://github.com/homebridge-plugins/homebridge-noip/compare/v1.1.0...v1.1.1) (2021-09-19)

### What's Changes

- Fixes incorrect status of contact sensor.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.1.0...v1.1.1

## [1.1.0](https://github.com/homebridge-plugins/homebridge-noip/compare/v1.0.0...v1.0.1) (2021-09-17)

### What's Changes

- Add Plugin debug config.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v1.0.0...v1.1.0

## [1.0.0](https://github.com/homebridge-plugins/homebridge-noip/compare/v0.1.0...v1.0.0) (2021-08-09)

### What's Changes

- Release of [homebridge-noip](https://github.com/homebridge-plugins/homebridge-noip) which allows you to update your No-IP hostname.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-noip/compare/v0.1.0...v1.0.0

## [0.1.0](https://github.com/homebridge-plugins/homebridge-noip/releases/tag/v0.1.0) (2021-08-09)

### What's Changes

- Initial Release
