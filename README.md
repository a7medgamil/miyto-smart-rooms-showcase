# MIYTO Smart Rooms — Product Case Study

MIYTO is an audio-first, level-aware learning-room experience developed for Superior Multiskills Institute (SMI). It structures learner practice into paired rooms, guided silent-practice rounds, and moderated speaking discussions.

> Public documentation only. No application source, student records, production credentials, internal endpoints, or deployment configuration are included.

## Product scope

- Paired learner rooms with level-aware matching and room lifecycle management.
- Structured practice rounds followed by guided speaking discussions.
- A curated discussion bank documented as 240 topics and 4,800 question slots.
- Attendance synchronization and session-window workflows.
- Peer reporting, moderation restrictions, and auditable handling.
- Administrative room visibility and session oversight.

## Engineering validation snapshot

The pre-merge QA snapshot was checked on 13 November 2026 on branch `codex/qa-miyto-20261113` (base commit `018a5aa`). Results below are tied to that tested snapshot, not automatically to later `main` revisions:

| Check | Result |
|---|---:|
| Unit assertions | 1,202 passed; 61 skipped |
| Worker / Durable Object assertions | 180 passed; 2 skipped |
| Build | Passed |
| Type generation and typecheck | Passed |
| Browser credential scan | Passed |
| GitHub Actions validation workflow | Passed on the tested snapshot; a later main-branch result is recorded below |

**Combined assertions:** 1,382 passed, 63 skipped, 0 failed.

These results describe the tested pre-merge engineering snapshot only. The GitHub Actions run on that snapshot passed on commit `fea2731` (run `43429281744`); an earlier successful run also completed on `217f68c` (run `43332200388`). These results are not a production certification or a live-media end-to-end result.

## Latest main-branch CI check (13 November 2026)

The subsequent merge commit `0bea82f` (PR #1) triggered GitHub Actions run `43429940694`, which failed one Worker / Durable Object test:

- **Failing test:** `tests/workerd/attendance-sync-alarm-20261106.test.ts`
- **Observed result:** the attendance record remained `pending` when the test expected `recorded`.
- **Unit suite:** 1,201 passed, 62 skipped, 0 failed (1,263 total).
- **Worker suite:** 179 passed, 2 skipped, 1 failed (182 total).
- **Build and browser credential scan:** skipped after the Worker-suite failure.

This was the latest main-branch CI result checked on 15 November 2026. It is a CI failure, not evidence of a production incident; the merged revision should not be described as CI-green until the attendance-alarm case is resolved and rerun.

## Explicit limitations

- The isolated 400-participant / 200-room load scenario was not run.
- A live SFU end-to-end test was not run in this QA pass.
- Production deployment and live configuration changes were outside the validation scope.
- Bundle-size optimization remains follow-up engineering work.

## Product access

[MIYTO student experience](https://secondary-session.smi-platform.org/) · [Portfolio case study](https://ahmed-gamil-portfolio.ahmedabdulbarim.workers.dev/case-studies/miyto-smart-rooms)

## Publication boundary

The application source remains in a separate private repository. No client or learner data is published.

© 2026 Superior Multiskills Institute. All rights reserved.
