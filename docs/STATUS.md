# MIYTO — Validation and Evidence

**Evidence dates:** 13 November 2026; latest main-branch CI checked 15 November 2026.

## Pre-merge QA snapshot

The private sanitized engineering snapshot on branch `codex/qa-miyto-20261113` (base `018a5aa`) recorded:

- Unit suite: 1,202 passed, 61 skipped, 0 failed.
- Worker / Durable Object suite: 180 passed, 2 skipped, 0 failed across 31 test files.
- Cloudflare type generation, TypeScript typecheck, production build and browser credential scan: passed.
- GitHub Actions validation passed on commit `fea2731` (run `43429281744`); an earlier successful run was recorded on `217f68c` (run `43332200388`).

These are revision-specific QA results, not production certification or a live-media end-to-end result.

## Latest main-branch CI result

The later merge commit `0bea82f` (PR #1) was tested by GitHub Actions run `43429940694` and **failed one Worker / Durable Object test**:

- Test: `tests/workerd/attendance-sync-alarm-20261106.test.ts`
- Failure: expected the attendance state `recorded`, but observed `pending`.
- Unit suite: 1,201 passed, 62 skipped, 0 failed.
- Worker suite: 179 passed, 2 skipped, 1 failed.
- Build and browser credential scan were skipped after the Worker-suite failure.

This is the latest main-branch CI result checked on 15 November 2026. It is not evidence of a production incident, but the merged main revision is not CI-green until this test is resolved and the workflow passes again.

## Not tested

- The isolated 400-participant / 200-room / 45-minute load scenario was not run against a live staging environment. Synthetic harness assertions do not substitute for that run.
- Live SFU media end-to-end behavior was not tested.
- Production deployment or live configuration changes were not part of the QA snapshot.

The test totals are not a capacity benchmark, production certification, or proof of live-media quality.
