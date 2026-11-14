# MIYTO — Validation and Evidence

**Evidence dates:** 13–15 November 2026.
**Current main commit:** `d2343d26edbdd889bfea0c43f3fbf4d9bb142a9c`.

## Pre-merge QA snapshot

The private sanitized engineering snapshot on branch `codex/qa-miyto-20261113` (base `018a5aa`) recorded:

- Unit suite: 1,202 passed, 61 skipped, 0 failed.
- Worker / Durable Object suite: 180 passed, 2 skipped, 0 failed across 31 test files.
- Cloudflare type generation, TypeScript typecheck, production build and browser credential scan: passed.
- GitHub Actions validation passed on commit `fea2731` (run `43429281744`); an earlier successful run was recorded on `217f68c` (run `43332200388`).

These are revision-specific QA results, not production certification or a live-media end-to-end result.

## Attendance alarm CI issue — resolved

The subsequent merge commit `0bea82f` (PR #1) triggered run `43429940694` and failed `tests/workerd/attendance-sync-alarm-20261106.test.ts`: the attendance record remained `pending` when the test expected `recorded`.

**Root cause:** fixed November 8–11 test timestamps were already in the past relative to Workerd's real clock during CI on November 13. The runtime could auto-fire a Durable Object alarm before the test's explicit alarm helper, creating a race in the test fixture.

**Correction:** [PR #2](https://github.com/a7medgamil/miyto-smart-rooms/pull/2), merged as `d2343d2).

- Alarm test timestamps now use future Riyadh-local instants relative to the runtime clock.
- The primary alarm test explicitly asserts that the alarm helper delivers the scheduled alarm.
- The fallback direct invocation of `alarm()` was removed.
- No attendance application source, live data, production configuration or deployment was changed.

## Post-merge main CI — passed

[GitHub Actions run 43633701186](https://github.com/a7medgamil/miyto-smart-rooms/actions/runs/43633701186) completed successfully on main commit `d2343d2`.

- Cloudflare type generation: passed.
- TypeScript typecheck: passed.
- Unit tests: 1,263 total; local full-suite result was 1,202 passed, 61 skipped.
- Worker / Durable Object tests: 31 files, 180 passed, 2 skipped.
- Production build: passed.
- Browser credential scan: passed.

The pull-request CI checks also passed on both runs `43633236391` and `43633262036`.

## Not tested

- The isolated 400-participant / 200-room / 45-minute load scenario was not run against a live staging environment. Synthetic harness assertions do not substitute for that run.
- Live SFU media end-to-end behavior was not tested.
- No production deployment or live configuration change was performed as part of this correction.

The test totals are not a capacity benchmark, production certification, or proof of live-media quality.
